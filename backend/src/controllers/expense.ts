import type { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Expense from '../models/expense';
import Budget from '../models/budget';
import Receipt from '../models/receipt';
import User from '../models/user';
import { logActivity } from '../utils/activitieslog';

// Helper to generate unique Expense ID
const generateExpenseId = () => {
  return 'EXP-' + new Date().getFullYear() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// @desc    Create new expense
// @route   POST /api/expenses/create
// @access  Private (Admin/Teacher)
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { category, description, vendor, paymentMethod, amount, date, status, attachmentUrl, isRecurring } = req.body;
    const user = (req as any).user;

    if (!category || !description || !vendor || !paymentMethod || amount === undefined) {
      return res.status(400).json({ message: 'Missing required expense fields.' });
    }

    const expense = await Expense.create({
      expenseId: generateExpenseId(),
      category,
      description,
      vendor,
      paymentMethod,
      amount: Number(amount) || 0,
      date: date ? new Date(date) : new Date(),
      status: status || 'Pending',
      createdBy: user._id,
      approvalStatus: 'Submitted',
      attachmentUrl: attachmentUrl || '',
      isRecurring: !!isRecurring
    });

    await logActivity({
      userId: user._id.toString(),
      action: `Submitted a new expense: ${expense.expenseId}`,
      details: `Category: ${category}, Amount: ₹${amount}`
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ message: 'Server error creating expense.' });
  }
};

// @desc    Get all expenses (Admin Ledger)
// @route   GET /api/expenses
// @access  Private (Admin)
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { category, status, approvalStatus, paymentMethod, search, dateStart, dateEnd, sortField, sortOrder, page, limit } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (dateStart && dateEnd) {
      filter.date = {
        $gte: new Date(dateStart as string),
        $lte: new Date(dateEnd as string)
      };
    }

    if (search) {
      filter.$or = [
        { expenseId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } }
      ];
    }

    const sortObj: any = {};
    const field = (sortField as string) || 'createdAt';
    const order = (sortOrder as string) === 'asc' ? 1 : -1;
    sortObj[field] = order;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Expense.countDocuments(filter)
    ]);

    return res.status(200).json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ message: 'Server error fetching expenses.' });
  }
};

// @desc    Update / Approve expense
// @route   PUT /api/expenses/update/:id
// @access  Private (Admin)
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, description, vendor, paymentMethod, amount, date, status, approvalStatus, comment, attachmentUrl } = req.body;
    const user = (req as any).user;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    // Update simple fields if provided
    if (category) expense.category = category;
    if (description) expense.description = description;
    if (vendor) expense.vendor = vendor;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (amount !== undefined) expense.amount = Number(amount) || 0;
    if (date) expense.date = new Date(date);
    if (status) expense.status = status;
    if (attachmentUrl !== undefined) expense.attachmentUrl = attachmentUrl;

    // Handle approval state shifts
    if (approvalStatus && approvalStatus !== expense.approvalStatus) {
      expense.approvalStatus = approvalStatus;
      if (['Approved', 'Paid'].includes(approvalStatus)) {
        expense.approvedBy = user._id;
        expense.approvalDate = new Date();
        if (approvalStatus === 'Paid') {
          expense.status = 'Paid';
        }
      } else if (approvalStatus === 'Rejected') {
        expense.approvedBy = user._id;
        expense.approvalDate = new Date();
      }
    }

    // Add comment if provided
    if (comment && comment.trim() !== '') {
      expense.comments.push({
        user: user._id,
        note: comment,
        date: new Date()
      });
    }

    const updatedExpense = await expense.save();
    const populated = await updatedExpense.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'approvedBy', select: 'name' },
      { path: 'comments.user', select: 'name' }
    ]);

    await logActivity({
      userId: user._id.toString(),
      action: `Updated expense approval stage: ${expense.expenseId}`,
      details: `New approval status: ${expense.approvalStatus}`
    });

    return res.status(200).json(populated);
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ message: 'Server error updating expense.' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/delete/:id
// @access  Private (Admin)
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    await expense.deleteOne();

    await logActivity({
      userId: user._id.toString(),
      action: `Deleted expense: ${expense.expenseId}`,
      details: `Category: ${expense.category}, Amount: ₹${expense.amount}`
    });

    return res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ message: 'Server error deleting expense.' });
  }
};

// @desc    Get all budgets and current month utilization
// @route   GET /api/expenses/budgets
// @access  Private (Admin)
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const budgets = await Budget.find({}).populate('createdBy', 'name');

    // Aggregate current month paid/approved expenses per category
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenseTotals = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
          status: 'Paid'
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const spentMap = new Map<string, number>();
    expenseTotals.forEach(item => {
      spentMap.set(item._id, item.totalSpent);
    });

    const budgetsWithSpent = budgets.map(b => {
      const spent = spentMap.get(b.category) || 0;
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(0, b.monthlyLimit - spent),
        utilizationPercent: b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0
      };
    });

    return res.status(200).json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return res.status(500).json({ message: 'Server error fetching budgets.' });
  }
};

// @desc    Create or update budget limits
// @route   POST /api/expenses/budgets/create
// @access  Private (Admin)
export const upsertBudget = async (req: Request, res: Response) => {
  try {
    const { category, monthlyLimit, yearlyLimit, academicYearId } = req.body;
    const user = (req as any).user;

    if (!category || monthlyLimit === undefined || yearlyLimit === undefined || !academicYearId) {
      return res.status(400).json({ message: 'Missing budget configuration parameters.' });
    }

    const budget = await Budget.findOneAndUpdate(
      { category, academicYear: academicYearId },
      { 
        monthlyLimit: Number(monthlyLimit) || 0, 
        yearlyLimit: Number(yearlyLimit) || 0,
        createdBy: user._id 
      },
      { new: true, upsert: true }
    );

    await logActivity({
      userId: user._id.toString(),
      action: `Configured budget for ${category}`,
      details: `Monthly Limit: ₹${monthlyLimit}, Yearly Limit: ₹${yearlyLimit}`
    });

    return res.status(200).json(budget);
  } catch (error) {
    console.error('Error configuring budget:', error);
    return res.status(500).json({ message: 'Server error configuring budget.' });
  }
};

// @desc    Get detailed financial statistics & dashboard aggregates
// @route   GET /api/expenses/stats
// @access  Private (Admin)
export const getExpenseStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    // Dates boundary setup
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const [
      verifiedReceiptsAll,
      paidExpensesAll,
      pendingReceiptsAll,
      pendingExpensesAll,
      monthlyVerifiedReceipts,
      monthlyPaidExpenses,
      previousMonthlyVerifiedReceipts,
      previousMonthlyPaidExpenses
    ] = await Promise.all([
      // Total Inflows (Verified Student Payments)
      Receipt.find({ status: 'Verified' }),
      // Total Outflows (Approved/Paid Expenses)
      Expense.find({ status: 'Paid' }),
      // Outstanding Income (Expected/Pending Student Receipts)
      Receipt.find({ status: 'Pending' }),
      // Pending Outflows (Unapproved/Submitted Expenses)
      Expense.find({ status: { $in: ['Pending', 'Overdue'] }, approvalStatus: { $in: ['Submitted', 'Under Review'] } }),
      // Current Month Inflow
      Receipt.find({ status: 'Verified', createdAt: { $gte: startOfMonth } }),
      // Current Month Outflow
      Expense.find({ status: 'Paid', date: { $gte: startOfMonth } }),
      // Previous Month Inflow
      Receipt.find({ status: 'Verified', createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } }),
      // Previous Month Outflow
      Expense.find({ status: 'Paid', date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth } })
    ]);

    // Summary calculations
    const totalIncome = verifiedReceiptsAll.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = paidExpensesAll.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    
    const expectedIncome = pendingReceiptsAll.reduce((sum, r) => sum + r.amount, 0);
    const expectedExpenses = pendingExpensesAll.reduce((sum, e) => sum + e.amount, 0);
    
    const availableBalance = netBalance - expectedExpenses;
    const projectedBalance = (totalIncome + expectedIncome) - (totalExpenses + expectedExpenses);
    
    const profitMargin = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    // Monthly aggregates
    const currentMonthRevenue = monthlyVerifiedReceipts.reduce((sum, r) => sum + r.amount, 0);
    const currentMonthExpenses = monthlyPaidExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const prevMonthRevenue = previousMonthlyVerifiedReceipts.reduce((sum, r) => sum + r.amount, 0);
    const prevMonthExpenses = previousMonthlyPaidExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Percentage changes
    const calcPct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const monthlyRevenueChange = calcPct(currentMonthRevenue, prevMonthRevenue);
    const monthlyExpensesChange = calcPct(currentMonthExpenses, prevMonthExpenses);

    // YTD aggregates (Current Calendar Year)
    const ytdRevenue = verifiedReceiptsAll
      .filter(r => new Date(r.createdAt) >= startOfYear)
      .reduce((sum, r) => sum + r.amount, 0);
    const ytdExpenses = paidExpensesAll
      .filter(e => new Date(e.date) >= startOfYear)
      .reduce((sum, e) => sum + e.amount, 0);

    // 1. Expense Category Distribution
    const categoryTotals = await Expense.aggregate([
      { $match: { status: 'Paid' } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const formattedCategoryDist = categoryTotals.map(item => ({
      name: item._id,
      value: item.value,
      count: item.count,
      percent: totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0
    }));

    // 2. 6-Month Cash Flow Trend Aggregation
    const cashFlowTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [monthlyInflows, monthlyOutflows] = await Promise.all([
        Receipt.find({ status: 'Verified', createdAt: { $gte: mStart, $lte: mEnd } }),
        Expense.find({ status: 'Paid', date: { $gte: mStart, $lte: mEnd } })
      ]);

      const inflow = monthlyInflows.reduce((sum, r) => sum + r.amount, 0);
      const outflow = monthlyOutflows.reduce((sum, e) => sum + e.amount, 0);

      cashFlowTrend.push({
        month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        inflow,
        outflow,
        net: inflow - outflow
      });
    }

    return res.status(200).json({
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        outstandingPayments: expectedIncome,
        pendingExpenses: expectedExpenses,
        availableBalance,
        projectedBalance,
        profitMargin,
        currentMonthRevenue,
        currentMonthExpenses,
        prevMonthRevenue,
        prevMonthExpenses,
        monthlyRevenueChange,
        monthlyExpensesChange,
        ytdRevenue,
        ytdExpenses
      },
      categoryDistribution: formattedCategoryDist,
      cashFlowTrend
    });

  } catch (error) {
    console.error('Error compiling financial stats:', error);
    return res.status(500).json({ message: 'Server error compiling financial analytics.' });
  }
};
