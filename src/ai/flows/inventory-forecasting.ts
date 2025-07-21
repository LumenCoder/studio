'use server';

/**
 * @fileOverview Predicts future inventory needs based on historical data and sales patterns.
 *
 * - forecastInventory - A function that handles the inventory forecasting process.
 * - ForecastInventoryInput - The input type for the forecastInventory function.
 * - ForecastInventoryOutput - The return type for the forecastInventory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastInventoryInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical inventory data and sales records.'),
  dayOfWeek: z.string().describe('The day of the week.'),
  salesPatterns: z.string().describe('Sales patterns for the inventory.'),
});
export type ForecastInventoryInput = z.infer<typeof ForecastInventoryInputSchema>;

const ForecastInventoryOutputSchema = z.object({
  predictedNeeds: z
    .string()
    .describe('Predicted future inventory needs based on the analysis.'),
  potentialRisks: z
    .string()
    .describe('Potential shortage or overstocking risks.'),
});
export type ForecastInventoryOutput = z.infer<typeof ForecastInventoryOutputSchema>;

export async function forecastInventory(
  input: ForecastInventoryInput
): Promise<ForecastInventoryOutput> {
  return forecastInventoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastInventoryPrompt',
  input: {schema: ForecastInventoryInputSchema},
  output: {schema: ForecastInventoryOutputSchema},
  prompt: `You are an expert inventory manager. Analyze the historical data and sales patterns to predict future inventory needs, considering the day of the week.

Historical Data: {{{historicalData}}}
Day of Week: {{{dayOfWeek}}}
Sales Patterns: {{{salesPatterns}}}

Based on this information, predict the future inventory needs and any potential shortage or overstocking risks.

Return the predicted needs and potential risks in a clear and concise manner.`,
});

const forecastInventoryFlow = ai.defineFlow(
  {
    name: 'forecastInventoryFlow',
    inputSchema: ForecastInventoryInputSchema,
    outputSchema: ForecastInventoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
