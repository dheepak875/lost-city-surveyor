import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScoreSchema } from "@shared/schema";
import bcrypt from "bcryptjs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { gamertag, password } = req.body;
      
      if (!gamertag || !password) {
        return res.status(400).json({ error: "Gamertag and password required" });
      }

      const existingUser = await storage.getUserByGamertag(gamertag);
      if (existingUser) {
        return res.status(400).json({ error: "Gamertag already taken" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser(passwordHash, gamertag);

      res.json({ userId: user.id, gamertag: user.gamertag });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { gamertag, password } = req.body;
      
      if (!gamertag || !password) {
        return res.status(400).json({ error: "Gamertag and password required" });
      }

      const user = await storage.getUserByGamertag(gamertag);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ userId: user.id, gamertag: user.gamertag });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Submit score endpoint
  app.post("/api/scores", async (req, res) => {
    try {
      const { userId, finalFunds, structuresFound, actionsUsed } = req.body;
      
      if (!userId || finalFunds === undefined || structuresFound === undefined || actionsUsed === undefined) {
        return res.status(400).json({ error: "Invalid score data" });
      }

      const score = await storage.submitScore({
        userId,
        finalFunds,
        structuresFound,
        actionsUsed,
      });
      res.json(score);
    } catch (error) {
      console.error("Score submission error:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  // Get leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  return httpServer;
}
