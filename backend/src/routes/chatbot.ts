import express from "express";
import { optionalProtect } from "../middleware/auth";
import { handleChatQuery } from "../controllers/chatbot";

const chatbotRouter = express.Router();

// Route must accept anyone (public) but IF logged in, it will attach `req.user`
// to give Gemini advanced database context capabilities cleanly.
chatbotRouter.post("/query", handleChatQuery);
chatbotRouter.get("/ping", (req, res) => {
    res.json({ message: "Chatbot API is reachable", status: "ok" });
});

export default chatbotRouter;
