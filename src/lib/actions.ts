
"use server";

import {
  forecastInventory,
  type ForecastInventoryInput,
} from "@/ai/flows/inventory-forecasting";
import {
  calculateShipment,
  type ShipmentCalculationInput,
} from "@/ai/flows/shipment-calculation";
import {
    extractSchedule,
    type ScheduleOcrInput,
    type ScheduleEntry
} from "@/ai/flows/schedule-ocr";


export async function runForecast(input: ForecastInventoryInput) {
  try {
    const result = await forecastInventory(input);
    return result;
  } catch (error) {
    console.error("Error in forecastInventory action:", error);
    return { error: "Failed to generate forecast. Please try again." };
  }
}

export async function runShipmentCalculation(input: ShipmentCalculationInput) {
  try {
    const result = await calculateShipment(input);
    return result;
  } catch (error) {
    console.error("Error in shipment calculation action:", error);
    return { error: "Failed to calculate shipment. Please try again." };
  }
}

export async function runScheduleOcr(input: ScheduleOcrInput) {
    try {
        const result = await extractSchedule(input);
        return result;
    } catch (error) {
        console.error("Error in schedule OCR action:", error);
        return { error: "Failed to extract schedule from PDF. Please try again." };
    }
}

export type { ScheduleEntry };
