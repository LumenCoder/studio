
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
  prompt: `You are a highly intelligent data extraction assistant. Your primary task is to meticulously analyze the provided PDF document, which contains an employee work schedule. Your goal is to extract every shift detail for every employee listed and structure it into a clean, usable format.

**Key Extraction Rules:**
1.  **User ID:** Extract the User ID exactly as it appears. If you see "0025", extract "25". If you see "0020", extract "20". Treat it as a numerical value.
2.  **Date and Time:** From the date/time column(s), you must derive two distinct pieces of information for each shift:
    *   The **Day of the Week** (e.g., "Monday", "Tuesday", "Wednesday").
    *   The complete **Time Range** of the shift (e.g., "8:00 AM - 4:00 PM", "10:00 PM - 6:00 AM").
3.  **Thoroughness:** Scan the entire document from top to bottom. Do not miss any entries. Pay close attention to formatting, as some schedules might have varied layouts.
4.  **Output Structure:** For each shift you identify, create an entry with the following fields: "Name", "User ID", "Day of Week", "Time Range", and "Hours Worked".

Your final output should be a complete and accurate list of all schedule entries found in the document.

**Document to Analyze:**
{{media url=pdfDataUri}}`,
});

const extractScheduleFlow = ai.defineFlow(
  {
    name: 'extractScheduleFlow',
    inputSchema: ScheduleOcrInputSchema,
    outputSchema: ScheduleOcrOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.schedule || output.schedule.length === 0) {
        throw new Error("The model failed to extract any schedule entries. The document might be in an unrecognized format or empty. Please check the PDF and try again.");
    }
    return output;
  }
);
