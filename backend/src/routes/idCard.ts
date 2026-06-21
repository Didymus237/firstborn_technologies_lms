import express from "express";
import { 
    createTemplate, 
    getTemplates, 
    getTemplateById, 
    updateTemplate, 
    deleteTemplate 
} from "../controllers/idCard";
import { protect, authorize } from "../middleware/auth";

const idCardRouter = express.Router();

// All ID Card module routes are strictly protected and restricted to Admin roles
idCardRouter.use(protect);
idCardRouter.use(authorize(["admin"]));

idCardRouter.route("/templates")
    .post(createTemplate)
    .get(getTemplates);

idCardRouter.route("/templates/:id")
    .get(getTemplateById)
    .put(updateTemplate)
    .delete(deleteTemplate);

export default idCardRouter;
