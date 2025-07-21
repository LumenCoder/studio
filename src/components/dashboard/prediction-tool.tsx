"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { runForecast } from "@/lib/actions";
import type { ForecastInventoryOutput } from "@/ai/flows/inventory-forecasting";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, BrainCircuit, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


const formSchema = z.object({
  historicalData: z.string().min(10, { message: "Please provide some historical data." }),
  dayOfWeek: z.string({ required_error: "Please select a day." }),
  salesPatterns: z.string().min(10, { message: "Please describe sales patterns." }),
});

export function PredictionTool() {
  const [result, setResult] = useState<ForecastInventoryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalData: "Last week: Beef -50 units, Chicken -30 units, Cheese -40 units. Previous week sales were 15% lower.",
      dayOfWeek: "Friday",
      salesPatterns: "Peak hours are 12-2 PM and 6-8 PM. Tacos are the best sellers, especially on Tuesdays.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setError(null);
    const forecastResult = await runForecast(values);
    if ('error' in forecastResult) {
      setError(forecastResult.error as string);
    } else {
      setResult(forecastResult);
    }
    setIsLoading(false);
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6" />
          Predictive Analysis
        </CardTitle>
        <CardDescription>
          Use AI to forecast inventory needs based on historical data.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="historicalData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Data</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Last week sales..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day to forecast" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salesPatterns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sales Patterns</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Higher traffic on weekends..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : "Generate Forecast"}
            </Button>
            {isLoading && (
              <div className="w-full space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-1/3 mt-2" />
                <Skeleton className="h-6 w-full" />
              </div>
            )}
            {error && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {result && (
              <div className="w-full space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-primary">Predicted Needs</h4>
                  <p className="mt-1 text-foreground/90">{result.predictedNeeds}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-600 dark:text-amber-500">Potential Risks</h4>
                  <p className="mt-1 text-foreground/90">{result.potentialRisks}</p>
                </div>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
