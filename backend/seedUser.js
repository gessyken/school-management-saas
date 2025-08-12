// seedUser.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const run = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mit_project_saas");

    // Création de l'utilisateur
    const user = await User.create({
      firstName: "Ken",
      lastName: "Coder",
      email: "ken@example.com",
      password: "motdepasse123", // sera hashé automatiquement
      phoneNumber: "+237681191547",
      gender: "male",
      roles: ["ADMIN"],
      status: "active"
    });

    console.log("✅ Utilisateur inséré avec succès :", user);
  } catch (err) {
    console.error("❌ Erreur lors de l’insertion :", err);
  } finally {
    mongoose.connection.close();
  }
};

run();
