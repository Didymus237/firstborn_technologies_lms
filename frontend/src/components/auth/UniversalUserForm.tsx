import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import {
  type Class,
  type UserRole,
  type subject,
  type user,
} from "@/types";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/global/CustomSelect";
import { useEffect, useState, useMemo } from "react";
// import { useAuth } from "@/hooks/AuthProvider";
import { CustomMultiSelect } from "@/components/global/CustomMultiSelect";

export type FormType = "login" | "create" | "update";
interface Props {
  type: FormType;
  initialData?: user | null;
  onSuccess?: () => void;
  role?: UserRole;
}

const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name is required"),
      classId: z.string().optional(),
      subjectIds: z.array(z.string()).optional(),
      email: z.email("Invalid email address"),
      role: z.string().optional(),
      password:
        type === "update"
          ? z
              .string()
              .optional()
              .refine((val) => !val || val.length >= 6, {
                message: "Password must be at least 6 characters",
              })
          : z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword:
        type === "create"
          ? z.string().min(6, {
              message: "Password must be at least 6 characters.",
            })
          : z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      fatherName: z.string().optional(),
      dob: z.string().optional(),
      presentAddress: z.string().optional(),
      permanentAddress: z.string().optional(),
      internshipSchool: z.string().optional(),
      department: z.string().optional(), // Maps to Training Program
      trainingDuration: z.string().optional(),
      amountPaid: z.coerce.number().optional().default(0),
      amountPending: z.coerce.number().optional().default(0),
      totalTrainingFee: z.coerce.number().optional().default(0),
      trainingStartDate: z.string().optional(),
      trainingEndDate: z.string().optional(),
      passportNumber: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (type === "create" && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match",
          path: ["confirmPassword"],
        });
      }
    });
};

export interface FormValues {
  name?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  classId?: string;
  subjectIds?: string[];
  role?: string;
  country?: string;
  phone?: string;
  fatherName?: string;
  dob?: string;
  presentAddress?: string;
  permanentAddress?: string;
  internshipSchool?: string;
  department?: string;
  trainingDuration?: string;
  amountPaid?: number;
  amountPending?: number;
  totalTrainingFee?: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  passportNumber?: string;
}

const UniversalUserForm = ({ type, initialData, onSuccess, role }: Props) => {
  const isUpdate = type === "update";
  const isLogin = type === "login";
  // const { setUser } = useAuth();

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [subjects, setSubjects] = useState<subject[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)) as any,
    defaultValues: {
      name: "",
      email: "",
      role: role,
      password: "",
      classId: undefined,
      subjectIds: [],
      country: "India",
      phone: "",
      fatherName: "",
      dob: "",
      presentAddress: "",
      permanentAddress: "",
      internshipSchool: "",
      department: "",
      trainingDuration: "",
      amountPaid: 0,
      amountPending: 0,
      totalTrainingFee: 0,
      trainingStartDate: "",
      trainingEndDate: "",
      passportNumber: "",
    },
  });

  // Watch totalTrainingFee and amountPaid to automatically compute amountPending
  const totalFeeValue = form.watch("totalTrainingFee");
  const amountPaidValue = form.watch("amountPaid");
  const selectedProgramName = form.watch("department");

  useEffect(() => {
    if (role === "student") {
      const fee = parseFloat(String(totalFeeValue)) || 0;
      const paid = parseFloat(String(amountPaidValue)) || 0;
      form.setValue("amountPending", Math.max(0, fee - paid));
    }
  }, [totalFeeValue, amountPaidValue, role, form]);

  // fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/classes");
        setClasses(data.data || data.classes || []);
      } catch (error) {
        if (type !== "login") {
          toast.error("Failed to load Classes");
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingOptions(true);
        const { data } = await api.get("/subjects");
        setSubjects(Array.isArray(data) ? data : data.subjects || []);
        setLoadingOptions(false);
      } catch (error) {
        if (type !== "login") {
          toast.error("Failed to load subjects");
          console.log(error);
        }
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchSubjects();
  }, []);

  // Populate form for Update mode
  useEffect(() => {
    if (initialData && isUpdate) {
      const existingClassId =
        typeof initialData.studentClass === "object"
          ? initialData.studentClass?._id
          : initialData.studentClass;

      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "student",
        password: "",
        classId: existingClassId || "",
        subjectIds: initialData.teacherSubjects?.map((s) => s._id) || [],
        country: initialData.country || "India",
        phone: initialData.phone || "",
        fatherName: initialData.fatherName || "",
        dob: initialData.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "",
        presentAddress: initialData.presentAddress || "",
        permanentAddress: initialData.permanentAddress || "",
        internshipSchool: initialData.internshipSchool || "",
        department: initialData.department || "",
        trainingDuration: initialData.trainingDuration || "",
        amountPaid: initialData.amountPaid || 0,
        amountPending: initialData.amountPending || 0,
        totalTrainingFee: initialData.totalTrainingFee || 0,
        trainingStartDate: initialData.trainingStartDate ? new Date(initialData.trainingStartDate).toISOString().split('T')[0] : "",
        trainingEndDate: initialData.trainingEndDate ? new Date(initialData.trainingEndDate).toISOString().split('T')[0] : "",
        passportNumber: initialData.passportNumber || "",
      });
    }
  }, [isUpdate, initialData, form, classes]);

  async function onSubmit(data: FormValues) {
    try {
      const { classId, subjectIds, ...rest } = data;
      const payload = {
        ...rest,
        studentClass: classId ? classId : null,
        teacherSubjects: subjectIds ? subjectIds : [],
        role: role || rest.role,
      };
      if (isLogin) {
        const { data: user } = await api.post("/users/login", {
          email: data.email,
          password: data.password,
        });
        console.log(user);
        toast.success("Logged in successfully");
        window.location.href = "/dashboard";
      } else if (type === "create") {
        await api.post("/users/register", payload);
        toast.success("Account created successfully!");
        if (onSuccess) onSuccess();
      } else if (type === "update" && initialData?._id) {
        await api.patch(`/users/update/${initialData._id}`, payload);
        toast.success("User updated successfully");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.log(error);
      const msg = error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(msg);
    }
  }

  const countryOptions = [
    { label: "Algeria (+213)", value: "Algeria (+213)" },
    { label: "Angola (+244)", value: "Angola (+244)" },
    { label: "Benin (+229)", value: "Benin (+229)" },
    { label: "Botswana (+267)", value: "Botswana (+267)" },
    { label: "Burkina Faso (+226)", value: "Burkina Faso (+226)" },
    { label: "Burundi (+257)", value: "Burundi (+257)" },
    { label: "Cabo Verde (+238)", value: "Cabo Verde (+238)" },
    { label: "Cameroon (+237)", value: "Cameroon (+237)" },
    { label: "Central African Republic (+236)", value: "Central African Republic (+236)" },
    { label: "Chad (+235)", value: "Chad (+235)" },
    { label: "Comoros (+269)", value: "Comoros (+269)" },
    { label: "Congo (Brazzaville) (+242)", value: "Congo (+242)" },
    { label: "Congo (Kinshasa) (+243)", value: "DR Congo (+243)" },
    { label: "Djibouti (+253)", value: "Djibouti (+253)" },
    { label: "Egypt (+20)", value: "Egypt (+20)" },
    { label: "Equatorial Guinea (+240)", value: "Equatorial Guinea (+240)" },
    { label: "Eritrea (+291)", value: "Eritrea (+291)" },
    { label: "Eswatini (+268)", value: "Eswatini (+268)" },
    { label: "Ethiopia (+251)", value: "Ethiopia (+251)" },
    { label: "Gabon (+241)", value: "Gabon (+241)" },
    { label: "Gambia (+220)", value: "Gambia (+220)" },
    { label: "Ghana (+233)", value: "Ghana (+233)" },
    { label: "Guinea (+224)", value: "Guinea (+224)" },
    { label: "Guinea-Bissau (+245)", value: "Guinea-Bissau (+245)" },
    { label: "Ivory Coast (+225)", value: "Ivory Coast (+225)" },
    { label: "Kenya (+254)", value: "Kenya (+254)" },
    { label: "Lesotho (+266)", value: "Lesotho (+266)" },
    { label: "Liberia (+231)", value: "Liberia (+231)" },
    { label: "Libya (+218)", value: "Libya (+218)" },
    { label: "Madagascar (+261)", value: "Madagascar (+261)" },
    { label: "Malawi (+265)", value: "Malawi (+265)" },
    { label: "Mali (+223)", value: "Mali (+223)" },
    { label: "Mauritania (+222)", value: "Mauritania (+222)" },
    { label: "Mauritius (+230)", value: "Mauritius (+230)" },
    { label: "Morocco (+212)", value: "Morocco (+212)" },
    { label: "Mozambique (+258)", value: "Mozambique (+258)" },
    { label: "Namibia (+264)", value: "Namibia (+264)" },
    { label: "Niger (+227)", value: "Niger (+227)" },
    { label: "Nigeria (+234)", value: "Nigeria (+234)" },
    { label: "Rwanda (+250)", value: "Rwanda (+250)" },
    { label: "Sao Tome and Principe (+239)", value: "Sao Tome and Principe (+239)" },
    { label: "Senegal (+221)", value: "Senegal (+221)" },
    { label: "Seychelles (+248)", value: "Seychelles (+248)" },
    { label: "Sierra Leone (+232)", value: "Sierra Leone (+232)" },
    { label: "Somalia (+252)", value: "Somalia (+252)" },
    { label: "South Africa (+27)", value: "South Africa (+27)" },
    { label: "South Sudan (+211)", value: "South Sudan (+211)" },
    { label: "Sudan (+249)", value: "Sudan (+249)" },
    { label: "Tanzania (+255)", value: "Tanzania (+255)" },
    { label: "Togo (+228)", value: "Togo (+228)" },
    { label: "Tunisia (+216)", value: "Tunisia (+216)" },
    { label: "Uganda (+256)", value: "Uganda (+256)" },
    { label: "Zambia (+260)", value: "Zambia (+260)" },
    { label: "Zimbabwe (+263)", value: "Zimbabwe (+263)" },
    { label: "Other / Non-African", value: "Other" }
  ];

  const trainingProgramOptions = subjects.map((s) => ({
    label: s.name,
    value: s.name,
  }));

  const classOptions = useMemo(() => {
    if (!Array.isArray(classes)) return [];
    
    let filtered = classes;
    if (selectedProgramName) {
      const selectedSubject = subjects.find((s) => s.name === selectedProgramName);
      if (selectedSubject) {
        const matchingClasses = classes.filter((c) => {
          const classSubjectIds = c.subjects?.map((s) => typeof s === "object" ? (s as any)._id : String(s)) || [];
          return classSubjectIds.includes(String(selectedSubject._id));
        });
        if (matchingClasses.length > 0) {
          filtered = matchingClasses;
        }
      }
    }

    return filtered.map((c) => ({
      label: c.name,
      value: c._id,
    }));
  }, [classes, selectedProgramName, subjects]);
  const subjectOptions = Array.isArray(subjects)
    ? subjects.map((s) => ({ label: s.name, value: s._id }))
    : [];
  const roleOptions = role ? [{ label: role, value: role }] : [];

  const pending = form.formState.isSubmitting;
  const showRoleSelector = !isLogin;
  const showClassSelector = !isLogin && role === "student";
  const showSubjectSelector = !isLogin && role === "teacher";
  const isStudent = !isLogin && role === "student";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4 w-full">
          {isStudent ? (
            <div className="col-span-2 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Section 1: Personal Profile */}
              <div className="col-span-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E]">Personal Profile</h3>
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Jane Doe"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="jane@example.com"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="phone"
                  label="Phone Number"
                  placeholder="+91..."
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomSelect
                  control={form.control}
                  name="country"
                  label="Country of Origin"
                  placeholder="Select Country"
                  options={countryOptions}
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="passportNumber"
                  label="Passport Number"
                  placeholder="Enter passport no."
                  disabled={pending}
                />
              </div>
              <div className="col-span-2">
                <CustomInput
                  control={form.control}
                  name="presentAddress"
                  label="Current Address"
                  placeholder="Residential address details"
                  disabled={pending}
                />
              </div>

              {/* Section 2: Internship & Training Details */}
              <div className="col-span-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E]">Internship & Training</h3>
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="internshipSchool"
                  label="School / University (Internship Source)"
                  placeholder="e.g. University of Yaoundé"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomSelect
                  control={form.control}
                  name="department"
                  label="Training Program"
                  placeholder="Select Program"
                  options={trainingProgramOptions}
                  disabled={pending}
                  loading={loadingOptions}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="trainingDuration"
                  label="Training Duration"
                  placeholder="e.g. 6 Months"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                {showClassSelector && (
                  <CustomSelect
                    control={form.control}
                    name="classId"
                    label="Assigned Class"
                    placeholder="Select Class"
                    options={classOptions}
                    disabled={pending}
                    loading={loading}
                  />
                )}
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="trainingStartDate"
                  label="Training Start Date"
                  type="date"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="trainingEndDate"
                  label="Training End Date"
                  type="date"
                  disabled={pending}
                />
              </div>

              {/* Section 3: Financial Summary */}
              <div className="col-span-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E]">Financial Summary</h3>
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="totalTrainingFee"
                  label="Total Training Fee"
                  type="number"
                  placeholder="0"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <CustomInput
                  control={form.control}
                  name="amountPaid"
                  label="Amount Paid"
                  type="number"
                  placeholder="0"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2">
                <CustomInput
                  control={form.control}
                  name="amountPending"
                  label="Amount Pending (Auto-Calculated)"
                  type="number"
                  disabled={true}
                />
              </div>

              {/* Section 4: Security */}
              <div className="col-span-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E]">Account Security</h3>
              </div>
              <div className="col-span-2">
                <CustomInput
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder={isUpdate ? "New Password (Optional)" : "Password"}
                  disabled={pending}
                />
              </div>
              {type === "create" && (
                <div className="col-span-2">
                  <CustomInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm Password"
                    disabled={pending}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {!isLogin && (
                <CustomInput
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Jane Doe"
                  disabled={pending}
                />
              )}
              {/* role selector */}
              {showRoleSelector && (
                <CustomSelect
                  control={form.control}
                  name="role"
                  label="Role"
                  placeholder="Select role"
                  options={roleOptions}
                  disabled={pending}
                />
              )}
              <div className="col-span-2 space-y-2">
                {/* class */}
                {showClassSelector && (
                  <CustomSelect
                    control={form.control}
                    name="classId"
                    label="Class"
                    placeholder="Select Class"
                    options={classOptions}
                    disabled={pending}
                    loading={loading}
                  />
                )}
                {/* subjects */}
                {showSubjectSelector && (
                  <CustomMultiSelect
                    control={form.control}
                    name="subjectIds"
                    label="Subjects"
                    placeholder="Select subjects..."
                    options={subjectOptions}
                    loading={loadingOptions}
                    disabled={pending}
                  />
                )}
                <CustomInput
                  control={form.control}
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="m@example.com"
                  disabled={pending}
                />
              </div>
              <div className="col-span-2">
                <CustomInput
                  control={form.control}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder={isUpdate ? "New Password (Optional)" : "Password"}
                  disabled={pending}
                />
              </div>
              {type === "create" && (
                <div className="col-span-2">
                  <CustomInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder={"Confirm Password"}
                    disabled={pending}
                  />
                </div>
              )}
            </>
          )}
          <div className="col-span-2 mt-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Processing..."
                : type === "login"
                ? "Sign In"
                : type === "create"
                ? "Create Account"
                : "Save Changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
};

export default UniversalUserForm;
