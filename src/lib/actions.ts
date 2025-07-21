"use server";

import {
  forecastInventory,
  type ForecastInventoryInput,
} from "@/ai/flows/inventory-forecasting";

export async function runForecast(input: ForecastInventoryInput) {
  try {
    const result = await forecastInventory(input);
    return result;
  } catch (error) {
    console.error("Error in forecastInventory action:", error);
    return { error: "Failed to generate forecast. Please try again." };
  }
}
