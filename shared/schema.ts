import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"), // Thêm phone field
  role: text("role").notNull().default("user"), // "user" | "admin"
  balance: decimal("balance", { precision: 15, scale: 0 }).notNull().default("0"), // VNĐ - no decimals
  callsRemaining: integer("calls_remaining").notNull().default(0),
  plan: text("plan").notNull().default("basic"), // "basic" | "pro" | "enterprise"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const twilioAccounts = pgTable("twilio_accounts", {
  id: serial("id").primaryKey(),
  sid: text("sid").notNull().unique(),
  authToken: text("auth_token").notNull(),
  accountName: text("account_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dids = pgTable("dids", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  twilioAccountId: integer("twilio_account_id").notNull().references(() => twilioAccounts.id),
  friendlyName: text("friendly_name"),
  capabilities: text("capabilities"), // JSON string for Twilio capabilities
  region: text("region").default("US"),
  isActive: boolean("is_active").notNull().default(true),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  currentTargetNumber: text("current_target_number"), // For DID blocking logic
  blockedUntil: timestamp("blocked_until"), // For DID blocking logic
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fromNumber: text("from_number").notNull(),
  toNumber: text("to_number").notNull(),
  twilioCallSid: text("twilio_call_sid"),
  status: text("status").notNull(), // "queued" | "ringing" | "in-progress" | "completed" | "busy" | "failed" | "no-answer" | "canceled"
  duration: integer("duration"), // in seconds
  cost: decimal("cost", { precision: 10, scale: 0 }), // VNĐ cost per call
  endTime: timestamp("end_time"),
  endReason: text("end_reason"), // Reason for call ending
  answeredBy: text("answered_by"), // AMD result: human/machine/fax/unknown
  machineDetectionDuration: integer("machine_detection_duration"), // AMD detection time in ms
  
  // THỜI GIAN ĐỔ CHUÔNG VÀ TRACKING CHI TIẾT
  startTime: timestamp("start_time"), // Thời điểm bắt đầu call
  ringingTime: timestamp("ringing_time"), // Thời điểm bắt đầu đổ chuông
  answerTime: timestamp("answer_time"), // Thời điểm được trả lời
  ringingDuration: integer("ringing_duration"), // Thời gian đổ chuông (giây)
  callDuration: integer("call_duration"), // Thời gian nói chuyện thực (giây)
  totalDuration: integer("total_duration"), // Tổng thời gian từ bắt đầu đến kết thúc (giây)
  
  didId: integer("did_id").notNull().references(() => dids.id),
  twilioAccountId: integer("twilio_account_id").notNull().references(() => twilioAccounts.id),
  isTest: boolean("is_test").notNull().default(false),
  callAttempt: integer("call_attempt").notNull().default(1),
  totalAttempts: integer("total_attempts").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const blacklistedNumbers = pgTable("blacklisted_numbers", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  didId: integer("did_id").notNull().references(() => dids.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const callCampaigns = pgTable("call_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetNumber: text("target_number").notNull(),
  totalAttempts: integer("total_attempts").notNull(),
  completedAttempts: integer("completed_attempts").notNull().default(0),
  status: text("status").notNull().default("pending"), // "pending" | "running" | "completed" | "cancelled"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const monthlyPackages = pgTable("monthly_packages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  packageCount: integer("package_count").notNull().default(1), // Số gói tháng (có thể cộng dồn)
  dailyCredit: decimal("daily_credit", { precision: 15, scale: 0 }).notNull().default("1000000"), // 1,000,000 VNĐ mỗi ngày
  startDate: timestamp("start_date").notNull().defaultNow(), // Ngày bắt đầu gói
  endDate: timestamp("end_date").notNull(), // Ngày hết hạn (30 ngày sau startDate)
  lastCreditDate: timestamp("last_credit_date"), // Lần cuối cộng tiền (để check 24h)
  totalDaysRemaining: integer("total_days_remaining").notNull().default(30), // Số ngày còn lại
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  calls: many(calls),
  campaigns: many(callCampaigns),
  monthlyPackages: many(monthlyPackages),
}));

export const twilioAccountsRelations = relations(twilioAccounts, ({ many }) => ({
  dids: many(dids),
  calls: many(calls),
}));

export const didsRelations = relations(dids, ({ one, many }) => ({
  twilioAccount: one(twilioAccounts, {
    fields: [dids.twilioAccountId],
    references: [twilioAccounts.id],
  }),
  calls: many(calls),
  blacklistedNumbers: many(blacklistedNumbers),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  user: one(users, {
    fields: [calls.userId],
    references: [users.id],
  }),
  did: one(dids, {
    fields: [calls.didId],
    references: [dids.id],
  }),
  twilioAccount: one(twilioAccounts, {
    fields: [calls.twilioAccountId],
    references: [twilioAccounts.id],
  }),
}));

export const blacklistedNumbersRelations = relations(blacklistedNumbers, ({ one }) => ({
  did: one(dids, {
    fields: [blacklistedNumbers.didId],
    references: [dids.id],
  }),
}));

export const callCampaignsRelations = relations(callCampaigns, ({ one }) => ({
  user: one(users, {
    fields: [callCampaigns.userId],
    references: [users.id],
  }),
}));

export const monthlyPackagesRelations = relations(monthlyPackages, ({ one }) => ({
  user: one(users, {
    fields: [monthlyPackages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTwilioAccountSchema = createInsertSchema(twilioAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDidSchema = createInsertSchema(dids).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallCampaignSchema = createInsertSchema(callCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyPackageSchema = createInsertSchema(monthlyPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTwilioAccount = z.infer<typeof insertTwilioAccountSchema>;
export type TwilioAccount = typeof twilioAccounts.$inferSelect;

export type InsertDid = z.infer<typeof insertDidSchema>;
export type Did = typeof dids.$inferSelect;
export type DID = typeof dids.$inferSelect; // Alias for consistency

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;

export type InsertCallCampaign = z.infer<typeof insertCallCampaignSchema>;
export type CallCampaign = typeof callCampaigns.$inferSelect;

export type InsertMonthlyPackage = z.infer<typeof insertMonthlyPackageSchema>;
export type MonthlyPackage = typeof monthlyPackages.$inferSelect;

export type BlacklistedNumber = typeof blacklistedNumbers.$inferSelect;
