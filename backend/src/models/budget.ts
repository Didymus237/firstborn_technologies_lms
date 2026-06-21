import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  category: string;
  monthlyLimit: number;
  yearlyLimit: number;
  academicYear: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const BudgetSchema = new Schema<IBudget>({
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
  monthlyLimit: { type: Number, required: true, default: 0 },
  yearlyLimit: { type: Number, required: true, default: 0 },
  academicYear: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of category per academic year
BudgetSchema.index({ category: 1, academicYear: 1 }, { unique: true });

const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;
