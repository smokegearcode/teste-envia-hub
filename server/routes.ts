import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertClientSchema, insertProductSchema, insertCarrierSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Client management
  app.get("/api/clients/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const client = await storage.getClientByUserId(parseInt(req.params.userId));
    if (!client) {
      return res.sendStatus(404);
    }
    res.json(client);
  });

  app.patch("/api/clients/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const client = await storage.updateClient(parseInt(req.params.id), req.body);
    res.json(client);
  });

  app.post("/api/clients", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "ADMIN") {
      return res.sendStatus(403);
    }
    const client = await storage.createClient(req.body);
    res.status(201).json(client);
  });

  // Product management
  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "ADMIN") {
      return res.sendStatus(403);
    }
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const products = await storage.getProducts();
    res.json(products);
  });

  // Suite products - products assigned to a client's suite
  app.get("/api/suite-products", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const products = await storage.getSuiteProducts(req.user.id);
    res.json(products);
  });

  // Carrier management
  app.post("/api/carriers", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "ADMIN") {
      return res.sendStatus(403);
    }
    const carrier = await storage.createCarrier(req.body);
    res.status(201).json(carrier);
  });

  app.get("/api/carriers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const carriers = await storage.getCarriers();
    res.json(carriers);
  });


  // Shipment management
  app.post("/api/shipments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const shipment = await storage.createShipment(req.body);
    res.status(201).json(shipment);
  });

  app.get("/api/shipments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const shipments = await storage.getShipments(req.user.id);
    res.json(shipments);
  });

  const httpServer = createServer(app);
  return httpServer;
}