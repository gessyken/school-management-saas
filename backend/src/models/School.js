import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import schoolRoutes from "./routes/schoolRoutes.js";

dotenv.config();

const app = express();

// Middleware JSON
app.use(express.json());

// Routes
app.use("/api/schools", schoolRoutes);

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(8000, () => console.log("🚀 Serveur sur http://localhost:8000"));
  })
  .catch((err) => console.error("Erreur MongoDB:", err));
