'use server';

/**
 * @fileOverview Calculates the required shipment quantities for inventory items.
 *
 * - calculateShipment - A function that handles the shipment calculation process.
 * - ShipmentCalculationInput - The input type for the calculateShipment function.
 * - ShipmentCalculationOutput - The return type for the calculateShipment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShipmentCalculationInputSchema = z.object({
  inventoryList: z
    .string()
    .describe(
      'A newline-separated list of current inventory items with their stock and threshold levels.'
    ),
});
export type ShipmentCalculationInput = z.infer<
  typeof ShipmentCalculationInputSchema
>;

const ShipmentCalculationOutputSchema = z.object({
  shipmentList: z
    .string()
    .describe(
      'A formatted spreadsheet-like string with columns for Item, Current Stock, Threshold, and a "Need to Order" column showing the calculated quantity to order for items below the threshold.'
    ),
});
export type ShipmentCalculationOutput = z.infer<
  typeof ShipmentCalculationOutputSchema
>;

export async function calculateShipment(
  input: ShipmentCalculationInput
): Promise<ShipmentCalculationOutput> {
  return calculateShipmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateShipmentPrompt',
  input: {schema: ShipmentCalculationInputSchema},
  output: {schema: ShipmentCalculationOutputSchema},
  prompt: `You are an inventory logistics expert. Your task is to calculate the required quantities for a new shipment based on the current inventory data.

The required quantity for each item is the amount needed to reach its threshold. If an item's stock is at or above its threshold, 0 units are needed.

Analyze the following inventory data:
{{{inventoryList}}}

Generate a report in a spreadsheet-like format. The columns should be: "Item", "Current Stock", "Threshold", and "Need to Order". Only include items that need to be reordered (i.e., where "Need to Order" is greater than 0).
`,
});

const calculateShipmentFlow = ai.defineFlow(
  {
    name: 'calculateShipmentFlow',
    inputSchema: ShipmentCalculationInputSchema,
    outputSchema: ShipmentCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
