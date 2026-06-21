import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory = 
  | 'Salaries & Wages'
  | 'Rent'
  | 'Utilities'
  | 'Marketing'
  | 'Travel'
  | 'Office Supplies'
  | 'Software Subscriptions'
  | 'Maintenance'
  | 'Taxes'
  | 'Insurance'
  | 'Student Services'
  | 'Operational Costs'
  | 'Miscellaneous';

export type ExpenseStatus = 'Paid' | 'Pending' | 'Overdue';
export type ExpenseApprovalStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';

export interface IExpenseComment {
  user: mongoose.Types.ObjectId;
  note: string;
  date: Date;
}

export interface IExpense extends Document {
  expenseId: string;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  paymentMethod: string;
  amount: number;
  date: Date;
  status: ExpenseStatus;
  createdBy: mongoose.Types.ObjectId;
  approvalStatus: ExpenseApprovalStatus;
  approvedBy?: mongoose.Types.ObjectId | null;
  approvalDate?: Date | null;
  comments: IExpenseComment[];
  attachmentUrl?: string;
  isRecurring?: boolean;
}

const ExpenseCommentSchema = new Schema<IExpenseComment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ExpenseSchema = new Schema<IExpense>({
  expenseId: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Salaries & Wages',
      'Rent',
      'Utilities',
      'Marketing',
      'Travel',
      'Office Supplies',
      'Software Subscriptions',
      'Maintenance',
      'Taxes',
      'Insurance',
      'Student Services',
      'Operational Costs',
      'Miscellaneous'
    ]
  },
  description: { type: String, required: true },
  vendor: { type: String, required: true },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['Cash', 'UPI', 'Card', 'Mobile Money', 'Orange Money', 'Bank Transfer']
  },
  amount: { type: Number, required: true, default: 0 },
  date: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    required: true, 
    enum: ['Paid', 'Pending', 'Overdue'], 
    default: 'Pending' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvalStatus: { 
    type: String, 
    required: true, 
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'], 
    default: 'Submitted' 
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  approvalDate: { type: Date, default: null },
  comments: [ExpenseCommentSchema],
  attachmentUrl: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
