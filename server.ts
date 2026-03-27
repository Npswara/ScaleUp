import express from "express";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import fs from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Initialize Firebase Admin (kept for other potential uses)
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
process.env.GOOGLE_CLOUD_PROJECT = firebaseConfig.projectId;
process.env.GCLOUD_PROJECT = firebaseConfig.projectId;

const app = admin.apps.length === 0 
  ? admin.initializeApp({
      projectId: firebaseConfig.projectId,
    })
  : admin.app();

const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
let firestore = getFirestore(app, dbId);
firestore.settings({ ignoreUndefinedProperties: true });

async function startServer() {
  console.log("Starting server...");
  
  // Initialize SQLite
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      passwordHash TEXT,
      isVerified BOOLEAN DEFAULT 0,
      verificationToken TEXT,
      tokenExpiry TEXT,
      createdAt TEXT
    )
  `);

  // Create profiles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      userId INTEGER PRIMARY KEY,
      profileData TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
  console.log("SQLite database initialized.");

  const server = express();
  const PORT = Number.parseInt(process.env.PORT || "", 10) || 3000;

  server.use(cors());
  server.use(express.json());

  const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_12345";

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- Auth Routes (SQL) ---

  // 1. Register
  server.post("/api/auth/register", async (req, res) => {
    try {
      let { email, password } = req.body;

      email = validator.normalizeEmail(email) || "";
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      if (!password || password.length <= 8) {
        return res.status(400).json({ 
          error: "Password must be more than 8 characters." 
        });
      }

      // Check for duplicate email
      const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email]);
      if (existingUser) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const createdAt = new Date().toISOString();

      await db.run(
        "INSERT INTO users (email, passwordHash, isVerified, createdAt) VALUES (?, ?, ?, ?)",
        [email, passwordHash, 1, createdAt] // Users are verified by default
      );

      res.status(201).json({ message: "Registration successful. You can now log in." });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 2. Verify (Removed token logic, but keeping endpoint for backward compatibility, now just returns success)
  server.get("/api/auth/verify", async (req, res) => {
    res.json({ message: "Account verified successfully." });
  });

  // 3. Login
  server.post("/api/auth/login", async (req, res) => {
    try {
      let { email, password } = req.body;
      email = validator.normalizeEmail(email) || "";

      const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

      if (!user) {
        return res.status(401).json({ error: "Unauthorized: Email not registered" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Unauthorized: Incorrect password" });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        accessToken,
        user: { email: user.email }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Profile Routes (SQL) ---

  // 1. Get Profile
  server.get("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profile = await db.get("SELECT profileData FROM profiles WHERE userId = ?", [req.user.userId]);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(JSON.parse(profile.profileData));
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 2. Save/Update Profile
  server.post("/api/profile", authenticateToken, async (req: any, res) => {
    try {
      const profileData = JSON.stringify(req.body);
      const updatedAt = new Date().toISOString();

      await db.run(
        `INSERT INTO profiles (userId, profileData, updatedAt) 
         VALUES (?, ?, ?) 
         ON CONFLICT(userId) DO UPDATE SET 
         profileData = excluded.profileData, 
         updatedAt = excluded.updatedAt`,
        [req.user.userId, profileData, updatedAt]
      );

      res.json({ message: "Profile saved successfully" });
    } catch (error: any) {
      console.error("Save profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: PORT + 1,
          clientPort: PORT + 1,
        },
      },
      appType: "spa",
    });
    server.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    server.use(express.static(distPath));
    server.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Set PORT in .env (e.g. PORT=${PORT + 1}) and restart.`
      );
      process.exit(1);
    }
    throw err;
  });
}

startServer();
