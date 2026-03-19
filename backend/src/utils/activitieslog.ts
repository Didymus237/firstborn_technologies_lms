// Adjust import based on available exports in activitieslog model
import ActivitiesLog from "../models/activitieslog";
import mongoose from "mongoose"; // Add this import

export const logActivity = async({
    userId, 
    action, 
    details
}: {
    userId: string,
    action: string,
    details?: string
}) => {
    try {
        await ActivitiesLog.create({
            user: userId,
            action,
            details,
        });
        
    } catch (error) {
        console.error('Error logging activity:', error);
        // Optionally, rethrow or handle the error as needed
        throw error;
    }
};