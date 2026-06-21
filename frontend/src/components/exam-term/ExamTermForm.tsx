import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { formSchema, type FormValues } from "./schema";
import type { academicYear } from "@/types";

export interface ExamTermType {
  _id: string;
  name: string;
  academicYear: academicYear;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isLocked: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExamTermForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const [academicYears, setAcademicYears] = useState<academicYear[]>([]);

  useEffect(() => {
    if (open) {
      api.get("/academic-years?limit=100")
        .then(res => setAcademicYears(res.data.academicYears || []))
        .catch(err => console.error("Could not fetch years", err));
    }
  }, [open]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      academicYear: "",
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        academicYear: "",
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
      });
    }
  }, [form, open]);

  const onSubmit = async (data: FormValues) => {
    try {
      await api.post("/exam-terms", data);
      toast.success("Exam term created");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save exam term");
    }
  };

  const pending = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Exam Term</DialogTitle>
          <DialogDescription>
            Create a new term (e.g. Term 1, Midterm) and assign it to an academic year.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            
            <CustomInput
              control={form.control}
              name="name"
              label="Term Name"
              placeholder="e.g. Term 1"
              disabled={pending}
            />

            <Controller
              name="academicYear"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Academic Year</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={pending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year._id} value={year._id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="startDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Start Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="endDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>End Date</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < form.getValues("startDate")}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="isActive"
              control={form.control}
              render={({ field: { value, onChange, ...field } }) => (
                <Field>
                  <div className="flex gap-2 rounded-md border p-4">
                    <Checkbox
                      id="isActive"
                      checked={value}
                      onCheckedChange={onChange}
                      {...field}
                      disabled={pending}
                    />
                    <div className="space-y-1 leading-none">
                      <FieldLabel htmlFor="isActive" className="cursor-pointer">
                        Set as Active
                      </FieldLabel>
                      <p className="text-[0.8rem] text-muted-foreground mt-1">
                        Make this term active and visible
                      </p>
                    </div>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving..." : "Create Term"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamTermForm;
