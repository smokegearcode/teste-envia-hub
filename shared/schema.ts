import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Base user and auth tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["ADMIN", "CLIENT"] }).notNull().default("CLIENT"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  document: text("document").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  suiteId: text("suite_id").notNull().unique(),
  addresses: json("addresses").$type<Address[]>().default([]),
  walletBalance: decimal("wallet_balance").notNull().default("0"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ncm: text("ncm").notNull(),
  value: decimal("value").notNull(),
});

export const carriers = pgTable("carriers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  apiKeys: json("api_keys").$type<string[]>().default([]),
  weightPrices: json("weight_prices").$type<WeightPrice[]>().default([]),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  carrierId: integer("carrier_id").references(() => carriers.id).notNull(),
  status: text("status", { enum: ["OPEN", "IN_PROGRESS", "COMPLETED"] }).notNull().default("OPEN"),
  trackingCode: text("tracking_code"),
  totalCost: decimal("total_cost").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shipmentProducts = pgTable("shipment_products", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").references(() => shipments.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  productValueTax: decimal("product_value_tax").notNull(),
  shippingTax: decimal("shipping_tax").notNull(),
  assistedPurchaseTax: decimal("assisted_purchase_tax").notNull(),
  groupPurchaseTax: decimal("group_purchase_tax").notNull(),
  hourlyRate: decimal("hourly_rate").notNull(),
});

// Types
type Address = {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type WeightPrice = {
  minWeight: number;
  maxWeight: number;
  price: number;
};

// Relations
export const userRelations = relations(users, ({ one }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
}));

export const clientRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  shipments: many(shipments),
}));

export const shipmentRelations = relations(shipments, ({ one, many }) => ({
  client: one(clients, {
    fields: [shipments.clientId],
    references: [clients.id],
  }),
  carrier: one(carriers, {
    fields: [shipments.carrierId],
    references: [carriers.id],
  }),
  products: many(shipmentProducts),
}));

// Schemas for validation and insertion
export const insertUserSchema = createInsertSchema(users);
export const insertClientSchema = createInsertSchema(clients);
export const insertProductSchema = createInsertSchema(products);
export const insertCarrierSchema = createInsertSchema(carriers);
export const insertShipmentSchema = createInsertSchema(shipments);
export const insertShipmentProductSchema = createInsertSchema(shipmentProducts);
export const insertSystemSettingsSchema = createInsertSchema(systemSettings);

// Types for use in application code
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Carrier = typeof carriers.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
export type ShipmentProduct = typeof shipmentProducts.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;