import express from 'express';
import { getTemplates, createTemplate, sendOfferLetter, generateOfferLetterAI } from '../controllers/offer';
import { protect, authorize } from '../middleware/auth';

const offerRoutes = express.Router();

offerRoutes.get('/templates', protect, authorize(['admin']), getTemplates);
offerRoutes.post('/templates', protect, authorize(['admin']), createTemplate);
offerRoutes.post('/send', protect, authorize(['admin']), sendOfferLetter);
offerRoutes.post('/generate-ai', protect, authorize(['admin']), generateOfferLetterAI);

export default offerRoutes;
