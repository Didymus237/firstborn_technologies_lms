import User from '../models/user';
import { type  Request, type Response,  } from 'express';
import { generateToken } from '../utils/generateToken';
import { logActivity } from '../utils/activitieslog';
import mongoose from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/auth';
import jwt from "jsonwebtoken";
import { generateUniqueId } from '../utils/idGenerator';

//@desc    Register a new user
//@route   POST /api/users/register
//@access  Public
// 

export const registerUser = async (req: Request, res: Response) => {
  try {
    
    const { 
      name, email, password, role, studentClass, teacherSubjects, isActive, department,
      country, phone, fatherName, dob, presentAddress, permanentAddress,
      internshipSchool, trainingDuration, amountPaid, amountPending, totalTrainingFee,
      trainingStartDate, trainingEndDate, passportNumber
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // SECURITY MITIGATION: Inspect Token Context to prevent Privilege Escalation
    let requestingRole = "public";
    if (req.cookies && req.cookies.jwt) {
      try {
        const decoded: any = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET as string);
        const uid = decoded.userId || decoded.id;
        const authUser = await User.findById(uid).select("role");
        if (authUser) requestingRole = authUser.role;
      } catch (e) {
        // Allow fallback to public role
      }
    }

    // Force non-admins strictly into harmless roles
    let safeRole = role || "student";
    if (requestingRole !== "admin") {
      if (safeRole !== "student" && safeRole !== "parent") {
        safeRole = "student"; // Strict Enforcement Fallback
      }
    }

    // Only include role if it's a non-empty string
    const userData: any = { 
      name, email, password, studentClass, teacherSubjects, isActive, department,
      country, phone, fatherName, dob, presentAddress, permanentAddress,
      internshipSchool, trainingDuration, amountPaid, amountPending, totalTrainingFee,
      trainingStartDate, trainingEndDate, passportNumber
    };
    if (typeof safeRole === 'string' && safeRole.trim() !== '') {
      userData.role = safeRole;
    }

    const currentYear = new Date().getFullYear().toString();

    if (safeRole === 'student') {
      userData.enrollmentNumber = await generateUniqueId(`ENR-${currentYear}-`, 4, 'enrollmentNumber');
      const dept = (department || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 3);
      userData.rollNumber = await generateUniqueId(`${currentYear}-${dept}-`, 3, 'rollNumber');
    } else if (safeRole === 'teacher') {
      userData.enrollmentNumber = await generateUniqueId(`TCH-${currentYear}-`, 3, 'enrollmentNumber');
    }

    const newUser = await User.create(userData);

    if (newUser){
        // Log the activity of user registration
        await logActivity({
          userId: newUser._id.toString(),
          action: `User registered with email: ${newUser.email}`,
          details: `User registered with role: ${newUser.role}`
        });

        res.status(201).json({
             ...newUser.toObject(),
             Message: "User registered successfully"
            })
    } else {
        res.status(400).json({ message: 'Failed to register user' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//desc Authenticate user & get token
//route POST /api/users/login
//access Public (all users)
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const safeEmail = email ? email.trim().toLowerCase() : "";
        console.log(`Login attempt for: [${email}] -> Safe: [${safeEmail}]`);
        const user = await User.findOne({ email: safeEmail });

        if (!user) {
            console.warn(`User NOT found for email: ${safeEmail}`);
        } else {
            console.log(`User found: ${user.email}. Checking password...`);
        }

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            console.log(`Password match successful for ${safeEmail}`);
            // Generate token
            generateToken(user.id.toString(), res);
            
            // Log the login activity (Fire-and-forget to avoid blocking response)
            logActivity({
              userId: user._id.toString(),
              action: 'User logged in',
              details: `User with email: ${user.email} logged in`
            }).catch(err => console.error("Login logging failed:", err));

            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


//@desc update user Admin only
//@route PUT /api/users/:id
//@access Private (admin only)

export const updateUser = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    if (Object.keys(body).length === 0) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id);

    if (user) {
      user.name = body.name || user.name;
      user.email = body.email || user.email;
      user.role = body.role || user.role;
      user.studentClass = body.studentClass !== undefined ? body.studentClass : user.studentClass;
      user.teacherSubjects = body.teacherSubjects || user.teacherSubjects;
      user.isActive = body.isActive !== undefined ? body.isActive : user.isActive;
      user.department = body.department !== undefined ? body.department : user.department;
      
      // Save new fields if provided
      user.country = body.country !== undefined ? body.country : user.country;
      user.phone = body.phone !== undefined ? body.phone : user.phone;
      user.fatherName = body.fatherName !== undefined ? body.fatherName : user.fatherName;
      user.dob = body.dob !== undefined ? body.dob : user.dob;
      user.presentAddress = body.presentAddress !== undefined ? body.presentAddress : user.presentAddress;
      user.permanentAddress = body.permanentAddress !== undefined ? body.permanentAddress : user.permanentAddress;
      user.internshipSchool = body.internshipSchool !== undefined ? body.internshipSchool : user.internshipSchool;
      user.trainingDuration = body.trainingDuration !== undefined ? body.trainingDuration : user.trainingDuration;
      user.amountPaid = body.amountPaid !== undefined ? body.amountPaid : user.amountPaid;
      user.amountPending = body.amountPending !== undefined ? body.amountPending : user.amountPending;
      user.totalTrainingFee = body.totalTrainingFee !== undefined ? body.totalTrainingFee : user.totalTrainingFee;
      user.trainingStartDate = body.trainingStartDate !== undefined ? body.trainingStartDate : user.trainingStartDate;
      user.trainingEndDate = body.trainingEndDate !== undefined ? body.trainingEndDate : user.trainingEndDate;
      user.passportNumber = body.passportNumber !== undefined ? body.passportNumber : user.passportNumber;

        if (body.password) {
          user.password = body.password;
        }

        const updatedUser = await user.save();
        // Populate the updated user to return name instead of ID
        await updatedUser.populate([
          { path: 'studentClass', select: 'name' },
          { path: 'teacherSubjects', select: 'name' }
        ]);

        if ((req as any).user) {
          await logActivity({
            userId: (req as any).user._id.toString(),
            action: `Updated user with`,
            details: ` Updated user with email: ${updatedUser.email} `
          });
        }
        //we are not returning something like "User updated successfully" because the frontend can check if the response is successful and show a message accordingly, also we are returning the updated user data so that the frontend can update the UI with the new data without making another request to fetch the updated user details
        res.json({
              ...updatedUser.toObject(),
              Message: "User updated successfully"
        });
        // const userId = req.params._id;
        // res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//@desc get all users (Admin only)
//@route GET /api/users/pages
//@access Private (admin only)

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    //1. query params for pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = req.query.role as string | undefined; // Optional role filter
    const search  = req.query.search as string | undefined; // Optional search filter

    const skip = (page - 1) * limit;
    //2. Build the filter object based on query params
    const filter: any = {};
    if (role && role !== 'all' && role !== '') {
      filter.role = role;
    }

    if (search){
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    //3. Fetch users from the database based on the filter and pagination
    let query = User.find(filter)
      .select('-password')
      .populate('studentClass', 'name')
      .populate('teacherSubjects', 'name')
      .sort({ createdAt: -1 })
      .skip(skip);

    if (limit > 0) {
      query = query.limit(limit);
    }

    const[total, users] = await Promise.all([
       // Get total count for pagination
      User.countDocuments(filter),
      query
    ]);

    //send response with users and pagination info
    res.json({
      users,
      pagination: {
        total,
        page,
        limit: limit > 0 ? limit : total,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,      
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

}

// next
// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (admin only)

export const deleteUser = async (req: Request, res: Response) => {
   try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
         return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await User.findById(id);
      if (user) {
        await user.deleteOne();
        if ((req as any).user) {
          await logActivity({
            userId: (req as any).user._id.toString(),
            action: `Deleted user `,
            details: `Deleted user with email: ${user.email}`
          });
        }
        res.json({ message: 'User deleted successfully' });
      } else {
        console.warn('DeleteUser: User not found for id', id);
        res.status(404).json({ message: 'User not found' });
      }

   } catch (error) {
    res.status(500).json({ message: 'Server error' , error});
   }

}

//@desc    get user profile (via cookies token)
//@route   GET /api/users/profile
//@access  Private (authenticated users can view their profile)

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user) {
        // Fetch full fresh user object
        const latestUser = await User.findById(req.user._id)
          .populate('studentClass', 'name')
          .populate('teacherSubjects', 'name code');
          
        if (!latestUser) {
           res.status(404).json({ message: 'User completely not found' });
           return;
        }

        res.json({
          user: latestUser
        });
      } else {
        res.status(404).json({ message: 'User not found in request context' });
      }
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: 'Server error' });
    }
};

//@desc update user's own profile
//@route PUT /api/users/profile
//@access Private (authenticated users can update their own profile)
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(404).json({ message: 'Not authenticated' });
            return;
        }

        const user = await User.findById(req.user._id);

        if (user) {
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.presentAddress = req.body.presentAddress !== undefined ? req.body.presentAddress : user.presentAddress;
            user.permanentAddress = req.body.permanentAddress !== undefined ? req.body.permanentAddress : user.permanentAddress;
            user.fatherName = req.body.fatherName !== undefined ? req.body.fatherName : user.fatherName;
            user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
            user.photoUrl = req.body.photoUrl !== undefined ? req.body.photoUrl : user.photoUrl;
            user.country = req.body.country !== undefined ? req.body.country : user.country;
            user.passportNumber = req.body.passportNumber !== undefined ? req.body.passportNumber : user.passportNumber;

            const updatedUser = await user.save();

            res.json({
                user: updatedUser,
                message: "Profile updated successfully"
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

//@desc Logout user (clear token cookie)
//@route POST /api/users/logout
//@access Private (authenticated users can log out)

export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            expires: new Date(0) // Set the cookie to expire in the past
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

//@desc Get student by enrollment number or ID
//@route GET /api/users/enrollment/:id
//@access Private (Admin/Teacher)
export const getUserByEnrollment = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        
        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: id };
        } else {
            query = { enrollmentNumber: id };
        }

        const user = await User.findOne({ ...query, role: 'student' }).populate('studentClass');
        
        if (!user) {
             res.status(404).json({ message: 'Student not found with this ID/Enrollment Number' });
             return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
