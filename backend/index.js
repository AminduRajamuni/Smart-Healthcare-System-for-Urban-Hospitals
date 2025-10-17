import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";

// Import middleware
import { errorHandler } from "./middleware/auth.js";

// Import utilities
import SeedData from "./utils/seedData.js";

dotenv.config();

const app = express();

// SOLID Principle: Single Responsibility Principle (SRP)
// This main file is responsible only for application configuration and startup

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
let mongoUrl = process.env.mongo_url || "mongodb://localhost:27017/healthcare_system";

mongoose.connect(mongoUrl);
let connection = mongoose.connection;

connection.once("open", async () => {
  console.log("✅ MongoDB connection established successfully!");
  
  // Initialize default data
  try {
    await SeedData.initializeDefaultData();
  } catch (error) {
    console.error("❌ Failed to initialize default data:", error.message);
  }
});

connection.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
