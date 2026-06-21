import type { Request, Response } from 'express';
import Setting from '../models/setting';
import { logActivity } from '../utils/activitieslog';

// @desc    Get system settings
// @route   GET /api/settings/school
// @access  Protected
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();
    
    // Auto-initialize if completely empty
    if (!settings) {
      settings = await Setting.create({
        rolePermissions: [
          { role: 'admin', permissions: ['view_dashboard', 'manage_academics', 'manage_lms', 'manage_users', 'manage_finance', 'manage_settings'] },
          { role: 'teacher', permissions: ['view_dashboard', 'manage_academics', 'manage_lms', 'view_users'] },
          { role: 'student', permissions: ['view_dashboard', 'view_academics', 'view_lms'] },
          { role: 'parent', permissions: ['view_dashboard', 'view_academics'] }
        ]
      });
    }
    
    res.status(200).json(settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error retrieving settings', error: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings/school
// @access  Protected (Admin only)
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const { schoolName, address, phone, email, currentTerm, rolePermissions } = req.body;

    let settings = await Setting.findOne();

    if (settings) {
      settings.schoolName = schoolName || settings.schoolName;
      settings.address = address || settings.address;
      settings.phone = phone || settings.phone;
      settings.email = email || settings.email;
      settings.currentTerm = currentTerm || settings.currentTerm;
      
      if (rolePermissions) {
        settings.rolePermissions = rolePermissions;
      }

      const updatedSettings = await settings.save();
      
      // Log the action
      await logActivity({
        userId: (req as any).user.id,
        action: 'Updated School Settings',
        details: `Variables Updated: ${schoolName}, ${currentTerm}`
      });

      res.status(200).json(updatedSettings);
    } else {
      // Create if none exists
      const newSettings = await Setting.create({
        schoolName, address, phone, email, currentTerm, rolePermissions
      });
      res.status(201).json(newSettings);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server error updating settings', error: error.message });
  }
};
