import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const listings = pgTable("listings", {
  id: serial().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  category: text().notNull().default("general"),
  price: integer(), // in cents, null means "contact for price"
  location: text().notNull().default(""),
  contactName: text("contact_name").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  contactPhone: text("contact_phone").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  imageUrls: text("image_urls"), // JSON array of image URLs for multi-image listings
  status: text().notNull().default("active"), // active | sold | expired | unposted
  featured: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
