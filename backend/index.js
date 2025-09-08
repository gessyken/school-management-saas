import express from "express";
import http from "http";
import "dotenv/config";
import cors from "cors";
// import notFound from "./src/middlewares/notFound.middleware.js";
import connection from "./src/database/connection.database.mjs";
import userRoutes from './src/routes/userRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import subjectRoutes from './src/routes/subjectRoutes.js';
// import reportCardRoutes from './src/routes/reportCardRoutes.js';
import academicYearRoutes from './src/routes/academicYearRoutes.js';
import settingRoutes from './src/routes/settingRoutes.js';
import classRoutes from './src/routes/classRoutes.js';
import logRoutes from './src/routes/logRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import financesRoutes from './src/routes/financesRoutes.js';
import reportsRoutes from './src/routes/reportsRoutes.js';
import schoolRoutes from './src/routes/schoolRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import "express-async-errors";
import { requestLogger } from "./src/middleware/requestLogger.js";

// Create Express app
const app = express();
const server = http.createServer(app);


// Configure Express CORS middleware
app.use(
    cors({
        origin: [
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3002",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-School-Id"],
        credentials: true,
    })
);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debugging: Log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 🔥 Add global request logger
app.use(requestLogger);

// Register API routes
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
// app.use('/api/report-cards', reportCardRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/finances', financesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/auth', authRoutes);

// Middleware for handling not found routes
// app.use(notFound);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

// Connect to MongoDB and start watching
connection()
    .then((mongooseConnection) => {
        console.log("Connected to MongoDB via Mongoose");
        const port = process.env.PORT || 8000;
        server.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("Could not connect to MongoDB:", err);
        process.exit(1);
    });
