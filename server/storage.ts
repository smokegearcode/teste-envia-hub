import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  clients,
  products,
  carriers,
  shipments,
  shipmentProducts,
  type User,
  type Client,
  type Product,
  type Carrier,
  type Shipment,
  type InsertUser,
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  createClient(client: any): Promise<Client>;
  updateClient(id: number, client: any): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: number): Promise<Client | undefined>;

  // Product methods
  createProduct(product: any): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getSuiteProducts(userId: number): Promise<Product[]>;

  // Carrier methods
  createCarrier(carrier: any): Promise<Carrier>;
  getCarriers(): Promise<Carrier[]>;

  // Shipment methods
  createShipment(shipment: any): Promise<Shipment>;
  getShipments(userId: number): Promise<Shipment[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createClient(client: any): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: any): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUserId(userId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client;
  }

  async createProduct(product: any): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getSuiteProducts(userId: number): Promise<Product[]> {
    const userClient = await this.getClientByUserId(userId);
    if (!userClient) {
      return [];
    }

    // For now, return all products. In a real implementation, we would filter by suite ID
    return this.getProducts();
  }

  async createCarrier(carrier: any): Promise<Carrier> {
    const [newCarrier] = await db.insert(carriers).values(carrier).returning();
    return newCarrier;
  }

  async getCarriers(): Promise<Carrier[]> {
    return db.select().from(carriers);
  }

  async createShipment(shipment: any): Promise<Shipment> {
    const [newShipment] = await db.insert(shipments).values(shipment).returning();
    return newShipment;
  }

  async getShipments(userId: number): Promise<Shipment[]> {
    const userClient = await this.getClientByUserId(userId);
    if (!userClient) {
      return [];
    }

    return db
      .select()
      .from(shipments)
      .where(eq(shipments.clientId, userClient.id));
  }
}

export const storage = new DatabaseStorage();