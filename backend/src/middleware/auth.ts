import {type Request, type Response, type NextFunction } from "express";    
import jwt from "jsonwebtoken";
import type { IUser, UserRoles } from "../models/user";
import User from "../models/user";

export interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const protect = async(
    req: AuthenticatedRequest, 
    res: Response,
     next: NextFunction) => {
        let token;

        // Check for token in cookies

        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (token){
            try{
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string) ;
                const userId = decoded.userId || decoded.id; // Support both old and new token formats
                req.user = (await User.findById(userId).select('-password')) as IUser;
                next();

            } catch (error) {
                console.error(error);
                res.status(401).json({ message: 'Not authorized, token failed' });
            }
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
        }

     }

export const optionalProtect = async(
    req: AuthenticatedRequest, 
    res: Response,
    next: NextFunction) => {
        let token;

        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (token){
            try{
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string) ;
                const userId = decoded.userId || decoded.id;
                req.user = (await User.findById(userId).select('-password')) as IUser;
            } catch (error) {
                console.error("Optional auth failed:", error);
            }
        }
        next();
     }

     /** 
      * accepts a list of allowed roles and checks if the user has one of those roles
      * usage: router.post('/admin-only', protect, authorize('admin'), adminController);
      */

     export const authorize = (roles: UserRoles[]) => {
        return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            if(!roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
            }

            next();
        }

     }