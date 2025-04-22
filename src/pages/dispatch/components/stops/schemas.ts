import { z } from "zod";

/**
 * Zod schema for validating StopFormData
 */
export const stopFormSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  driver: z.string().min(1, "Driver is required"),
  notes: z.string().optional().default(""),
  is_recurring: z.boolean().default(false),
  recurrence_frequency: z.enum(["weekly", "bi-weekly", "monthly"]).optional(),
  preferred_day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).optional(),
  next_occurrence_date: z.date().nullable().optional(),
  recurrence_end_date: z.date().nullable().optional(),
  recurring_order_id: z.string().optional(),
}).refine(
  (data) => {
    // If is_recurring is true, then recurrence_frequency, preferred_day, and next_occurrence_date are required
    if (data.is_recurring) {
      return !!data.recurrence_frequency && !!data.preferred_day && !!data.next_occurrence_date;
    }
    return true;
  },
  {
    message: "Recurrence frequency, preferred day, and next occurrence date are required for recurring deliveries",
    path: ["is_recurring"],
  }
);

/**
 * Type inference from the Zod schema
 */
export type StopFormSchemaType = z.infer<typeof stopFormSchema>;

/**
 * Helper function to validate StopFormData
 */
export const validateStopForm = (data: unknown) => {
  return stopFormSchema.safeParse(data);
}; 