export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface user {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  enrollmentNumber?: string;
  role: UserRole;
  country?: string;
  photoUrl?: string;
  phone?: string;
  fatherName?: string;
  dob?: string;
  presentAddress?: string;
  permanentAddress?: string;
  studentClass?: Class;
  teacherSubjects?: subject[];
  internshipSchool?: string;
  department?: string; // Maps to Training Program
  trainingDuration?: string;
  amountPaid?: number;
  amountPending?: number;
  totalTrainingFee?: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  passportNumber?: string;
}

export interface academicYear {
  _id: string;
  name: string; // "2025-2026"
  fromYear: Date; // "2025-09-01"
  toYear: Date; // "2026-06-30"
  isCurrent: boolean; // true/false
}

export interface FeeCategory {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  type: "one-time" | "recurring";
  isActive: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  amount: number;
  paymentDate: string;
  method: "cash" | "paytm" | "phonepay" | "card" | "mtn_money" | "orange_money" | "transfer";
  reference?: string;
  recordedBy: string;
}

export interface FeeInvoice {
  _id: string;
  student: user;
  class: Class;
  academicYear: string;
  feeCategory: FeeCategory;
  amount: number;
  amountPaid: number;
  status: "pending" | "partial" | "paid";
  dueDate?: string;
  paymentHistory: PaymentRecord[];
  createdAt: string;
}

export interface Receipt {
  _id: string;
  receiptId: string;
  student: user;
  paymentType: "Fees" | "Admission" | "Other";
  amount: number;
  paymentMode: "Cash" | "Online" | "Mobile Money" | "UPI" | "Card";
  method: "cash" | "paytm" | "phonepay" | "card" | "mtn_money" | "orange_money" | "transfer";
  transactionId?: string;
  status: "Pending" | "Verified" | "Rejected";
  verifiedBy?: user;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  _id: string;
  name: string; // e.g., "Grade 10"
  academicYear: academicYear; // Link to "2025-2026"
  classTeacher: user; // The main teacher in charge
  subjects: subject[]; // List of subjects taught in this class
  students: user[]; // List of students enrolled
  capacity: number; // Max students allowed (optional)
}

export interface subject {
  _id: string;
  name: string; // "Mathematics"
  code: string; // "MATH101"
  teacher?: user[]; // Default teacher for this subject
  isActive: boolean; // Indicates if the subject is currently active
}

export interface question {
  _id: string;
  questionText: string;
  type: string;
  options: string[]; // Array of strings e.g. ["A", "B", "C", "D"]
  correctAnswer: string; // Hidden from students in default queries
  points: number;
}

export interface exam {
  _id: string;
  title: string;
  subject: subject;
  class: Class;
  teacher: user;
  duration: number; // in minutes
  questions: question[];
  dueDate: Date;
  isActive: boolean;
}

export interface Submission {
  _id: string;
  score: number;
  exam: exam; // The populated exam with answers
  answers: { questionId: string; answer: string }[];
}

export interface period {
  _id: string;
  type?: "class" | "break";
  subject?: { _id: string; name: string; code: string };
  teacher?: { _id: string; name: string };
  room?: string;
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "08:45"
}

export interface schedule {
  day: string; // "Monday", "Tuesday", etc.
  periods: period[];
}

export interface assignment {
  _id: string;
  title: string;
  description?: string;
  class: Class;
  subject: subject;
  teacher: user;
  dueDate: Date;
  points: number;
  attachments?: string[];
  isActive: boolean;
}

export interface assignmentSubmission {
  _id: string;
  assignment: assignment;
  student: user;
  content: string;
  attachments?: string[];
  status: "submitted" | "graded" | "late";
  score?: number;
  feedback?: string;
  submittedAt: Date;
}

export interface material {
  _id: string;
  title: string;
  description?: string;
  class: Class;
  subject: subject;
  teacher: user;
  fileUrl: string;
  fileType: string;
  originalName: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
}

export interface ComplaintResponse {
  respondent: user | string;
  message: string;
  timestamp: string;
}

export interface Complaint {
  _id: string;
  studentId: user | string;
  targetId?: user | string;
  title: string;
  description: string;
  category: 'Academic' | 'Facilities' | 'Faculty' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'In Review' | 'Resolved' | 'Rejected';
  remarks?: string;
  responses: ComplaintResponse[];
  aiCategory?: string;
  aiSeverity?: 'Low' | 'Medium' | 'High' | 'Critical';
  aiPriorityScore?: number;
  aiSuggestedAction?: string;
  aiSuggestedReply?: string;
  aiConfidenceScore?: number;
  createdAt: string;
}

export interface Leave {
  _id: string;
  teacherId: user | string;
  leaveType: 'Casual' | 'Sick' | 'Emergency';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: user | string;
  authorName: string;
  imageUrl?: string;
  isPublished: boolean;
  slug: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  _id: string;
  blogPost: string;
  user?: user;
  parentComment?: string;
  name: string;
  email: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  student: string | user;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

export interface Attendance {
  _id: string;
  classId: string | Class;
  subjectId: string | subject;
  date: string;
  records: AttendanceRecord[];
  markedBy: string | user;
  teacherId: string | user;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceAnalytics {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export type ExpenseCategory =
  | "Salaries & Wages"
  | "Rent"
  | "Utilities"
  | "Marketing"
  | "Travel"
  | "Office Supplies"
  | "Software Subscriptions"
  | "Maintenance"
  | "Taxes"
  | "Insurance"
  | "Student Services"
  | "Operational Costs"
  | "Miscellaneous";

export type ExpenseStatus = "Paid" | "Pending" | "Overdue";
export type ExpenseApprovalStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Paid";

export interface ExpenseComment {
  _id: string;
  user: user;
  note: string;
  date: string;
}

export interface Expense {
  _id: string;
  expenseId: string;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  paymentMethod: "Cash" | "UPI" | "Card" | "Mobile Money" | "Orange Money" | "Bank Transfer";
  amount: number;
  date: string;
  status: ExpenseStatus;
  createdBy: user;
  approvalStatus: ExpenseApprovalStatus;
  approvedBy?: user | null;
  approvalDate?: string | null;
  comments: ExpenseComment[];
  attachmentUrl?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  yearlyLimit: number;
  academicYear: string;
  createdBy?: user | { name: string };
  spent: number;
  remaining: number;
  utilizationPercent: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  outstandingPayments: number;
  pendingExpenses: number;
  availableBalance: number;
  projectedBalance: number;
  profitMargin: number;
  currentMonthRevenue: number;
  currentMonthExpenses: number;
  prevMonthRevenue: number;
  prevMonthExpenses: number;
  monthlyRevenueChange: number;
  monthlyExpensesChange: number;
  ytdRevenue: number;
  ytdExpenses: number;
}

export interface CategoryDistributionPoint {
  name: ExpenseCategory;
  value: number;
  count: number;
  percent: number;
}

export interface CashFlowTrendPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface ExpenseStats {
  summary: FinancialSummary;
  categoryDistribution: CategoryDistributionPoint[];
  cashFlowTrend: CashFlowTrendPoint[];
}
