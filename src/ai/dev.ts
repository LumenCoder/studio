
import { config } from 'dotenv';
config();

import '@/ai/flows/inventory-forecasting.ts';
import '@/ai/flows/shipment-calculation.ts';
import '@/ai/flows/schedule-ocr.ts';
