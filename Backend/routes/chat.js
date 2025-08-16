import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/gemini.js";

const router = express.Router();

// Test route to create a sample thread
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread2"
        });

        const response = await thread.save();
        res.send(response);
    } catch (err) {
        console.error("❌ DB Error (Test):", err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// Get all threads (latest first)
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.error("❌ Fetch Threads Error:", err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages of a specific thread
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (err) {
        console.error("❌ Fetch Thread Messages Error:", err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });

        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.error("❌ Delete Thread Error:", err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Main chat route
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            // Create a new thread
            thread = new Thread({
                threadId,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        console.log("📩 Sending to Gemini:", message);

        const assistantReply = await getGeminiAPIResponse(message);

        console.log("🤖 Gemini replied:", assistantReply);

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: assistantReply });
    } catch (err) {
        console.error("❌ Chat Route Error:", err);
        res.status(500).json({ error: "Something went wrong while processing your message" });
    }
});

export default router; 