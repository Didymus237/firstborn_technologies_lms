import User from '../models/user';
import { type  Request, type Response,  } from 'express';
import { generateToken } from '../utils/generateToken';
import { logActivity } from '../utils/activitieslog';
import mongoose from 'mongoose';
import type { AuthenticatedRequest } from '../middleware/auth';

//@desc    Register a new user
//@route   POST /api/users/register
//@access  Public
// 

export const registerUser = async (req: Request, res: Response) => {
  try {
    
    const { name, email, password, role, studentClass, teacherSubjects, isActive } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Only include role if it's a non-empty string
    const userData: any = { name, email, password, studentClass, teacherSubjects, isActive };
    if (typeof role === 'string' && role.trim() !== '') {
      userData.role = role;
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
             _id: newUser._id,
             name: newUser.name,
             email: newUser.email,
             role: newUser.role,
             studentClass: newUser.studentClass,
             teacherSubjects: newUser.teacherSubjects,
             isActive: newUser.isActive,
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
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            // Generate token (you can implement JWT or any token generation logic here)
            generateToken(user.id.toString(), res);
            // Log the login activity
            await logActivity({
              userId: user._id.toString(),
              action: 'User logged in',
              details: `User with email: ${user.email} logged in`
            });
            res.json(user)
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
      user.studentClass = body.studentClass || user.studentClass;
      user.teacherSubjects = body.teacherSubjects || user.teacherSubjects;
      user.isActive = body.isActive !== undefined ? body.isActive : user.isActive;

        if (body.password) {
          user.password = body.password;
        }

        const updatedUser = await user.save();
        if ((req as any).user) {
          await logActivity({
            userId: (req as any).user._id.toString(),
            action: `Updated user with`,
            details: ` Updated user with email: ${updatedUser.email} `
          });
        }
        //we are not returning something like "User updated successfully" because the frontend can check if the response is successful and show a message accordingly, also we are returning the updated user data so that the frontend can update the UI with the new data without making another request to fetch the updated user details
        res.json({
              _id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              studentClass: updatedUser.studentClass,
              teacherSubjects: updatedUser.teacherSubjects,
              isActive: updatedUser.isActive,
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
        res.json({
          user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            studentClass: req.user.studentClass,    
          }
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: 'Server error' });
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

