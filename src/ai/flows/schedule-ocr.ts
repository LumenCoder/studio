
'use server';
/**
 * @fileOverview An AI flow to perform OCR on a schedule PDF and extract structured data.
 *
 * - extractSchedule - A function that handles the schedule extraction process.
 * - ScheduleOcrInput - The input type for the extractSchedule function.
 * - ScheduleOcrOutput - The return type for the extractSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleOcrInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A schedule document as a PDF, passed as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'"
    ),
});
export type ScheduleOcrInput = z.infer<typeof ScheduleOcrInputSchema>;

const ScheduleEntrySchema = z.object({
    name: z.string().describe("The full name of the employee."),
    userId: z.string().describe("The user ID of the employee. Should be parsed as a string to preserve leading zeros, but presented as a number."),
    dayOfWeek: z.string().describe("The day of the week for the shift (e.g., Monday, Tuesday)."),
    timeRange: z.string().describe("The start and end time of the shift (e.g., '9:00 AM - 5:00 PM')."),
    hoursWorked: z.string().describe("The total hours for the scheduled shift."),
});
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;

const ScheduleOcrOutputSchema = z.object({
  schedule: z.array(ScheduleEntrySchema).describe("An array of all schedule entries extracted from the document."),
});
export type ScheduleOcrOutput = z.infer<typeof ScheduleOcrOutputSchema>;

export async function extractSchedule(input: ScheduleOcrInput): Promise<ScheduleOcrOutput> {
  return extractScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleOcrPrompt',
  input: {schema: ScheduleOcrInputSchema},
  output: {schema: ScheduleOcrOutputSchema},
  prompt: `You are an expert data entry assistant. Your task is to analyze the provided PDF schedule and extract the shift details for each employee.

The user ID should be extracted as the number you see. For example, if you see "0025", extract "25". If you see "0020", extract "20".

From the date/time column, you must extract two separate pieces of information:
1. The day of the week (e.g., "Monday", "Tuesday").
2. The time range of the shift (e.g., "8:00 AM - 4:00 PM").

Carefully scan the entire document and create a structured list of all shifts. The required columns are: "Name", "User ID", "Day of Week", "Time Range", and "Hours Worked".

Document: {{media url=pdfDataUri}}`,
});

const extractScheduleFlow = ai.defineFlow(
  {
    name: 'extractScheduleFlow',
    inputSchema: ScheduleOcrInputSchema,
    outputSchema: ScheduleOcrOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
