import express from 'express';


// Create a router for user-related routes
const userRoutes = express.Router();

import { registerUser, login, updateUser, deleteUser, logoutUser, getUserProfile, getAllUsers } from '../controllers/user';
import { protect, authorize } from '../middleware/auth';
import { register } from 'node:module';

userRoutes.post('/register', registerUser);
userRoutes.post('/login', login);
userRoutes.post('/logout', logoutUser);
userRoutes.get('/profile', protect, getUserProfile);

userRoutes.get('/',
     protect, 
     authorize(['admin', 'teacher', ]),
     getAllUsers
);
userRoutes.get('/pages',
     protect, 
     authorize(['admin', 'teacher', ]),
     getAllUsers
);
userRoutes.post('/register',
     protect, 
     authorize(['admin', 'teacher', ]),
     registerUser
);

userRoutes.patch('/update/:id',
     protect, 
     authorize(['admin', 'teacher', ]),
     updateUser
);

userRoutes.delete('/delete/:id',
     protect, 
     authorize(['admin', 'teacher', ]),
     deleteUser
);





export default userRoutes;   