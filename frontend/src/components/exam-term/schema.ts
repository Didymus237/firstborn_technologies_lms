import { z } from "zod";

export const formSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(50),
    academicYear: z.string().min(1, "Academic Year is required"),
    startDate: z.date(),
    endDate: z.date(),
    isActive: z.boolean().default(false),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type FormValues = z.infer<typeof formSchema>;
