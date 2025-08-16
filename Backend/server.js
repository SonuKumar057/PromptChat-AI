import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://chatter-champ.vercel.app"
];

// ✅ CORS middleware with DELETE method allowed
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());

// ✅ Middlewares
app.use(express.json());

// ✅ Routes
app.use("/api", chatRoutes);

// ✅ Default route for root URL
app.get("/", (req, res) => {
    res.send("ChatterChamp Backend is Running 🚀");
});

// ✅ MongoDB connection and server start
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected with MongoDB");

        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to connect DB", err);
        process.exit(1);
    }
};

connectDB(); 