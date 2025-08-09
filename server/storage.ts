import {
  users,
  twilioAccounts,
  dids,
  calls,
  blacklistedNumbers,
  callCampaigns,
  monthlyPackages,
  type User,
  type InsertUser,
  type TwilioAccount,
  type InsertTwilioAccount,
  type Did,
  type InsertDid,
  type Call,
  type InsertCall,
  type BlacklistedNumber,
  type CallCampaign,
  type InsertCallCampaign,
  type MonthlyPackage,
  type InsertMonthlyPackage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sum, avg, asc, or, isNull, lt, ne, sql } from "drizzle-orm";
import { platformConfig } from "./utils/platform-config";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(id: number, amount: number): Promise<User>;
  setUserBalance(id: number, amount: number): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Twilio Account operations
  createTwilioAccount(account: InsertTwilioAccount): Promise<TwilioAccount>;
  getTwilioAccounts(): Promise<TwilioAccount[]>;
  getTwilioAccount(id: number): Promise<TwilioAccount | undefined>;
  updateTwilioAccount(id: number, updates: Partial<TwilioAccount>): Promise<TwilioAccount>;
  deleteTwilioAccount(id: number): Promise<void>;
  
  // DID operations
  createDid(did: InsertDid): Promise<Did>;
  getDids(): Promise<Did[]>;
  getDidsByTwilioAccount(twilioAccountId: number): Promise<Did[]>;
  getActiveDids(): Promise<Did[]>;
  updateDid(id: number, updates: Partial<Did>): Promise<Did>;
  getNextAvailableDid(excludeNumbers?: string[]): Promise<Did | undefined>;
  
  // Call operations
  createCall(call: InsertCall): Promise<Call>;
  getCallsByUser(userId: number, limit?: number): Promise<Call[]>;
  getAllCalls(limit?: number): Promise<Call[]>;
  updateCall(id: number, updates: Partial<Call>): Promise<Call>;
  getCallStats(): Promise<{
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    totalRevenue: string;
  }>;
  
  // Blacklist operations
  addToBlacklist(phoneNumber: string, didId: number, reason?: string): Promise<BlacklistedNumber>;
  isNumberBlacklisted(phoneNumber: string, didId: number): Promise<boolean>;
  getBlacklistedNumbers(didId: number): Promise<BlacklistedNumber[]>;
  
  // Campaign operations
  createCallCampaign(campaign: InsertCallCampaign): Promise<CallCampaign>;
  getUserCampaigns(userId: number): Promise<CallCampaign[]>;
  updateCampaign(id: number, updates: Partial<CallCampaign>): Promise<CallCampaign>;
  getPendingCampaigns(): Promise<CallCampaign[]>;
  
  // Monthly Package operations
  createMonthlyPackage(pkg: InsertMonthlyPackage): Promise<MonthlyPackage>;
  getAllMonthlyPackages(): Promise<MonthlyPackage[]>;
  getUserMonthlyPackages(userId: number): Promise<MonthlyPackage[]>;
  getActiveMonthlyPackage(userId: number): Promise<MonthlyPackage | undefined>;
  updateMonthlyPackage(id: number, updates: Partial<MonthlyPackage>): Promise<MonthlyPackage>;
  processMonthlyPackageCredits(): Promise<void>;
  
  // Admin statistics
  getTotalUsers(): Promise<number>;
  getTotalBalance(): Promise<string>;
  getTotalCalls(): Promise<number>;
  getMonthlyRevenue(): Promise<string>;
  
  // ✅ CRITICAL: Atomic balance operations to prevent race conditions
  deductBalanceAtomic(userId: number, amount: number): Promise<{ success: boolean; user?: User; error?: string }>;
  
  // Twilio integration
  syncDIDsFromTwilio(accountId: number): Promise<Did[]>;
  makeCall(userId: number, toNumber: string): Promise<Call>;
  getCallHistory(userId: number): Promise<Call[]>;
}

export class DatabaseStorage implements IStorage {
  
  // Get webhook URL with dynamic platform detection  
  private getWebhookUrl(path: string): string {
    return platformConfig.getWebhookUrl(path);
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, updatedAt: new Date() })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // ✅ CRITICAL FIX: Atomic balance deduction with row locking to prevent race conditions
  async deductBalanceAtomic(userId: number, amount: number): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      return await db.transaction(async (tx) => {
        // Step 1: Lock the user row and get current balance
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .for('update'); // CRITICAL: Row-level lock prevents race conditions

        if (!user) {
          return { success: false, error: 'User not found' };
        }

        const currentBalance = parseFloat(user.balance);
        
        // Step 2: Check if sufficient balance (within the locked transaction)
        if (currentBalance < amount) {
          return { success: false, error: 'Insufficient balance' };
        }

        // Step 3: Deduct balance atomically
        const newBalance = currentBalance - amount;
        const [updatedUser] = await tx
          .update(users)
          .set({ 
            balance: newBalance.toString(),
            updatedAt: new Date() 
          })
          .where(eq(users.id, userId))
          .returning();

        return { success: true, user: updatedUser };
      });
    } catch (error) {
      console.error('Balance deduction transaction failed:', error);
      return { success: false, error: 'Transaction failed' };
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserBalance(id: number, amount: number): Promise<User> {
    console.log(`💰 BALANCE UPDATE: User ${id}, adding ${amount} VNĐ`);
    
    const currentUser = await this.getUser(id);
    if (!currentUser) throw new Error('User not found');
    
    const currentBalance = parseFloat(currentUser.balance);
    const newBalance = currentBalance + amount;
    
    console.log(`💰 Balance: ${currentBalance.toLocaleString()} → ${newBalance.toLocaleString()} VNĐ`);
    
    const [user] = await db
      .update(users)
      .set({ balance: newBalance.toString(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    console.log(`✅ Balance updated successfully for user ${id}`);
    return user;
  }

  async setUserBalance(id: number, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: amount.toString(), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Twilio Account operations
  async createTwilioAccount(account: InsertTwilioAccount): Promise<TwilioAccount> {
    const [twilioAccount] = await db
      .insert(twilioAccounts)
      .values({ ...account, updatedAt: new Date() })
      .returning();
    return twilioAccount;
  }

  async getTwilioAccounts(): Promise<TwilioAccount[]> {
    return await db.select().from(twilioAccounts).orderBy(desc(twilioAccounts.createdAt));
  }

  async getTwilioAccount(id: number): Promise<TwilioAccount | undefined> {
    const [account] = await db.select().from(twilioAccounts).where(eq(twilioAccounts.id, id));
    return account || undefined;
  }

  async updateTwilioAccount(id: number, updates: Partial<TwilioAccount>): Promise<TwilioAccount> {
    const [account] = await db
      .update(twilioAccounts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(twilioAccounts.id, id))
      .returning();
    return account;
  }

  async deleteTwilioAccount(id: number): Promise<void> {
    await db.delete(twilioAccounts).where(eq(twilioAccounts.id, id));
  }

  // DID operations
  async createDid(did: InsertDid): Promise<Did> {
    const [newDid] = await db
      .insert(dids)
      .values({ ...did, updatedAt: new Date() })
      .returning();
    return newDid;
  }

  async getDids(): Promise<Did[]> {
    return await db.select().from(dids).orderBy(desc(dids.createdAt));
  }

  async getDidsByTwilioAccount(twilioAccountId: number): Promise<Did[]> {
    return await db
      .select()
      .from(dids)
      .where(eq(dids.twilioAccountId, twilioAccountId))
      .orderBy(desc(dids.createdAt));
  }

  async getActiveDids(): Promise<Did[]> {
    return await db
      .select()
      .from(dids)
      .where(eq(dids.isActive, true))
      .orderBy(dids.lastUsed);
  }

  async updateDid(id: number, updates: Partial<Did>): Promise<Did> {
    const [did] = await db
      .update(dids)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dids.id, id))
      .returning();
    return did;
  }

  async getNextAvailableDid(excludeNumbers?: string[], targetNumber?: string): Promise<Did | undefined> {
    console.log(`🔍 DID Request - Target: ${targetNumber}, Exclude: [${excludeNumbers?.join(', ') || 'none'}]`);
    
    const now = new Date();
    
    // Get all active DIDs with proper round-robin (handle NULL lastUsed)
    const allActiveDids = await db
      .select()
      .from(dids)
      .where(eq(dids.isActive, true))
      .orderBy(sql`COALESCE(last_used, '1970-01-01'::timestamp) ASC`);
    
    console.log(`📋 Total active DIDs: ${allActiveDids.length}`);
    
    // Filter available DIDs based on new blocking logic
    const availableDids = allActiveDids.filter(did => {
      // DID is only blocked if it's currently being used for the SAME target number
      const isBlockedForSameTarget = did.currentTargetNumber === targetNumber;
      
      // Check if DID is not in exclude list  
      const isExcluded = excludeNumbers && excludeNumbers.includes(did.phoneNumber);
      
      // DID is available if: not excluded AND (no current target OR different target)
      const isAvailable = !isExcluded && !isBlockedForSameTarget;
      
      console.log(`📞 DID ${did.phoneNumber}: blocked_for_same_target=${!!isBlockedForSameTarget}, excluded=${!!isExcluded}, available=${isAvailable}`);
      
      return isAvailable;
    });
    
    console.log(`✅ Available DIDs after filtering: ${availableDids.length}`);
    
    // Select first available DID (round-robin by lastUsed)
    const selectedDid = availableDids[0];
    
    if (selectedDid) {
      // Block DID only during active call (no time limit)
      await db
        .update(dids)
        .set({ 
          lastUsed: new Date(),
          currentTargetNumber: targetNumber,
          blockedUntil: null, // No time-based blocking - only during active call
          usageCount: (selectedDid.usageCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(dids.id, selectedDid.id));
      
      console.log(`🔒 DID ${selectedDid.phoneNumber} blocked for active call to ${targetNumber}`);
    } else {
      console.log(`❌ No available DID found`);
    }
    
    return selectedDid || undefined;
  }

  async releaseDid(didId: number): Promise<void> {
    // Release DID by clearing blocking fields
    await db
      .update(dids)
      .set({ 
        currentTargetNumber: null,
        blockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(dids.id, didId));
    
    console.log(`🔓 DID ${didId} released and available for new calls`);
  }

  async forceReleaseOldestDids(count: number): Promise<void> {
    // Force release the oldest blocked DIDs to free up pool
    console.log(`🔄 Force releasing ${count} oldest blocked DIDs...`);
    
    const blockedDids = await db
      .select()
      .from(dids)
      .where(and(
        eq(dids.isActive, true),
        sql`current_target_number IS NOT NULL`
      ))
      .orderBy(dids.lastUsed)
      .limit(count);

    for (const did of blockedDids) {
      await this.releaseDid(did.id);
      console.log(`🔓 Force released DID ${did.phoneNumber}`);
    }
  }

  async releaseAllBlockedDids(): Promise<number> {
    // Emergency function to release all blocked DIDs
    const result = await db
      .update(dids)
      .set({ 
        currentTargetNumber: null,
        blockedUntil: null,
        updatedAt: new Date()
      })
      .where(and(
        eq(dids.isActive, true),
        sql`current_target_number IS NOT NULL`
      ))
      .returning();

    console.log(`🆘 Emergency released ${result.length} blocked DIDs`);
    return result.length;
  }

  // Call operations
  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db
      .insert(calls)
      .values({ ...call, updatedAt: new Date() })
      .returning();
    return newCall;
  }

  async getCallsByUser(userId: number, limit: number = 50): Promise<Call[]> {
    return await db
      .select()
      .from(calls)
      .where(eq(calls.userId, userId))
      .orderBy(desc(calls.createdAt))
      .limit(limit);
  }

  async getAllCalls(limit: number = 100): Promise<Call[]> {
    return await db
      .select()
      .from(calls)
      .orderBy(desc(calls.createdAt))
      .limit(limit);
  }

  async updateCall(id: number, updates: Partial<Call>): Promise<Call> {
    const [call] = await db
      .update(calls)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(calls.id, id))
      .returning();
    return call;
  }

  async getCallByTwilioSid(twilioCallSid: string): Promise<Call | undefined> {
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.twilioCallSid, twilioCallSid));
    return call || undefined;
  }

  async getCall(id: number): Promise<Call | undefined> {
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.id, id));
    return call;
  }

  async getCallStats(): Promise<{
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    totalRevenue: string;
  }> {
    const [totalResult] = await db.select({ count: count() }).from(calls);
    const [successResult] = await db
      .select({ count: count() })
      .from(calls)
      .where(eq(calls.status, 'completed'));
    const [failedResult] = await db
      .select({ count: count() })
      .from(calls)
      .where(eq(calls.status, 'failed'));
    const [revenueResult] = await db
      .select({ total: sum(calls.cost) })
      .from(calls)
      .where(eq(calls.status, 'completed'));

    return {
      totalCalls: totalResult.count,
      successfulCalls: successResult.count,
      failedCalls: failedResult.count,
      totalRevenue: revenueResult.total || '0',
    };
  }

  // Blacklist operations
  async addToBlacklist(phoneNumber: string, didId: number, reason?: string): Promise<BlacklistedNumber> {
    const [blacklisted] = await db
      .insert(blacklistedNumbers)
      .values({ phoneNumber, didId, reason })
      .returning();
    return blacklisted;
  }

  async isNumberBlacklisted(phoneNumber: string, didId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(blacklistedNumbers)
      .where(and(
        eq(blacklistedNumbers.phoneNumber, phoneNumber),
        eq(blacklistedNumbers.didId, didId)
      ));
    return !!result;
  }

  async getBlacklistedNumbers(didId: number): Promise<BlacklistedNumber[]> {
    return await db
      .select()
      .from(blacklistedNumbers)
      .where(eq(blacklistedNumbers.didId, didId));
  }

  // Campaign operations
  async createCallCampaign(campaign: InsertCallCampaign): Promise<CallCampaign> {
    const [newCampaign] = await db
      .insert(callCampaigns)
      .values({ ...campaign, updatedAt: new Date() })
      .returning();
    return newCampaign;
  }

  async getUserCampaigns(userId: number): Promise<CallCampaign[]> {
    return await db
      .select()
      .from(callCampaigns)
      .where(eq(callCampaigns.userId, userId))
      .orderBy(desc(callCampaigns.createdAt));
  }

  async updateCampaign(id: number, updates: Partial<CallCampaign>): Promise<CallCampaign> {
    const [campaign] = await db
      .update(callCampaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(callCampaigns.id, id))
      .returning();
    return campaign;
  }

  async getPendingCampaigns(): Promise<CallCampaign[]> {
    return await db
      .select()
      .from(callCampaigns)
      .where(eq(callCampaigns.status, 'pending'))
      .orderBy(callCampaigns.createdAt); // FIFO - First In, First Out
  }
  // Admin statistics
  async getTotalUsers(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(users);
    return result[0]?.count || 0;
  }

  async getTotalBalance(): Promise<string> {
    const result = await db
      .select({ total: sum(users.balance) })
      .from(users);
    return result[0]?.total || "0";
  }

  async getTotalCalls(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(calls);
    return result[0]?.count || 0;
  }

  async getMonthlyRevenue(): Promise<string> {
    const result = await db
      .select({ total: sum(calls.cost) })
      .from(calls)
      .where(eq(calls.status, 'completed'));
    return result[0]?.total || "0";
  }

  // Get DID count by account
  async getDIDCountByAccount(accountId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(dids)
      .where(eq(dids.twilioAccountId, accountId));
    return result[0]?.count || 0;
  }

  // Get all DIDs for admin management
  async getAllDIDs(): Promise<Did[]> {
    return await db.select().from(dids).orderBy(dids.phoneNumber);
  }

  // Twilio integration
  async syncDIDsFromTwilio(accountId: number): Promise<Did[]> {
    const twilioAccount = await this.getTwilioAccount(accountId);
    if (!twilioAccount) throw new Error("Twilio account not found");

    // Import Twilio SDK
    const twilio = require('twilio');
    const client = twilio(twilioAccount.sid, twilioAccount.authToken);

    try {
      // Fetch incoming phone numbers from Twilio
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list();
      
      const syncedDIDs: Did[] = [];
      
      for (const phoneNumber of incomingPhoneNumbers) {
        // Check if DID already exists
        const existingDID = await db
          .select()
          .from(dids)
          .where(eq(dids.phoneNumber, phoneNumber.phoneNumber))
          .limit(1);

        if (existingDID.length === 0) {
          // Create new DID
          const newDID = await this.createDid({
            phoneNumber: phoneNumber.phoneNumber,
            twilioAccountId: accountId,
            isActive: true,
            capabilities: JSON.stringify(phoneNumber.capabilities),
            region: phoneNumber.region || 'US',
            lastUsed: new Date()
          });
          syncedDIDs.push(newDID);
        } else {
          // Update existing DID
          const updatedDID = await this.updateDid(existingDID[0].id, {
            isActive: true,
            capabilities: JSON.stringify(phoneNumber.capabilities),
            region: phoneNumber.region || 'US'
          });
          syncedDIDs.push(updatedDID);
        }
      }

      console.log(`Synced ${syncedDIDs.length} DIDs for account ${twilioAccount.accountName}`);
      return syncedDIDs;
    } catch (error: any) {
      console.error("Error syncing DIDs from Twilio:", error);
      throw new Error(`Failed to sync DIDs: ${error?.message || 'Unknown error'}`);
    }
  }

  async makeCall(userId: number, toNumber: string): Promise<Call> {
    // Get user and available DID
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const availableDid = await this.getNextAvailableDid();
    if (!availableDid) throw new Error("No available phone numbers");

    // Get Twilio account for this DID
    const twilioAccount = await this.getTwilioAccount(availableDid.twilioAccountId);
    if (!twilioAccount) throw new Error("Twilio account not found");

    // Create call record first
    const newCall = await this.createCall({
      userId,
      fromNumber: availableDid.phoneNumber,
      toNumber,
      status: 'queued',
      cost: "5000", // 5,000 VNĐ
      didId: availableDid.id,
      twilioAccountId: availableDid.twilioAccountId,
    });

    // Deduct cost from user balance
    await this.updateUserBalance(userId, -5000);

    try {
      // Initialize Twilio client
      const twilio = require('twilio');
      const client = twilio(twilioAccount.sid, twilioAccount.authToken);

      // Make the actual call with Twilio - FIXED ring time
      const call = await client.calls.create({
        to: toNumber,
        from: availableDid.phoneNumber,
        url: this.getWebhookUrl('/api/twilio/voice'),
        timeout: 40, // TĂNG GẤP ĐÔI: 20 → 40 giây cho thời gian đổ chuông
        machineDetection: 'DetectMessageEnd', // Better machine detection
        machineDetectionTimeout: 5, // 5 seconds to detect machine
        statusCallback: this.getWebhookUrl('/api/twilio/status-callback'),
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed', 'busy', 'failed', 'no-answer'],
        statusCallbackMethod: 'POST'
      });

      // Update call with Twilio SID
      const updatedCall = await this.updateCall(newCall.id, {
        twilioCallSid: call.sid,
        status: 'initiated'
      });

      // Update DID last used time
      await this.updateDid(availableDid.id, { lastUsed: new Date() });

      console.log(`Call initiated: ${call.sid} from ${availableDid.phoneNumber} to ${toNumber}`);
      return updatedCall;

    } catch (error: any) {
      // Update call status to failed
      await this.updateCall(newCall.id, {
        status: 'failed',
        endReason: error?.message || "Unknown error"
      });
      
      // Refund user balance
      await this.updateUserBalance(userId, 5000);
      
      console.error("Error making Twilio call:", error);
      throw new Error(`Call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCallHistory(userId: number): Promise<Call[]> {
    return await this.getCallsByUser(userId, 50);
  }

  async getDIDByPhoneNumber(phoneNumber: string): Promise<Did | undefined> {
    const [did] = await db.select().from(dids).where(eq(dids.phoneNumber, phoneNumber));
    return did;
  }

  async createDID(didData: {
    phoneNumber: string;
    twilioAccountId: number;
    friendlyName?: string;
    capabilities?: string;
    region?: string;
  }): Promise<Did> {
    const [did] = await db
      .insert(dids)
      .values({
        ...didData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return did;
  }

  async resetDatabase(): Promise<void> {
    // Xóa tất cả dữ liệu theo thứ tự (foreign key constraints)
    await db.delete(calls);
    await db.delete(blacklistedNumbers);
    await db.delete(callCampaigns);  
    await db.delete(dids);
    await db.delete(twilioAccounts);
    await db.delete(users).where(eq(users.role, 'user'));

    // Reset admin user về default
    const [admin] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (admin) {
      await db.update(users)
        .set({
          username: 'admin',
          email: 'admin@example.com',
          password: await require('bcryptjs').hash('admin', 10),
          balance: '0',
          callsRemaining: 0,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, admin.id));
    } else {
      // Tạo admin mới nếu không có
      await this.createUser({
        username: 'admin',
        email: 'admin@example.com', 
        password: await require('bcryptjs').hash('admin', 10),
        fullName: 'System Administrator',
        role: 'admin',
        balance: '0',
        callsRemaining: 0,
        isActive: true
      });
    }
  }

  // Monthly Package operations
  async createMonthlyPackage(pkg: InsertMonthlyPackage): Promise<MonthlyPackage> {
    const [newPackage] = await db
      .insert(monthlyPackages)
      .values({ ...pkg, updatedAt: new Date() })
      .returning();
    return newPackage;
  }

  async getAllMonthlyPackages(): Promise<MonthlyPackage[]> {
    return await db
      .select()
      .from(monthlyPackages)
      .orderBy(desc(monthlyPackages.createdAt));
  }

  async getUserMonthlyPackages(userId: number): Promise<MonthlyPackage[]> {
    return await db
      .select()
      .from(monthlyPackages)
      .where(eq(monthlyPackages.userId, userId))
      .orderBy(desc(monthlyPackages.createdAt));
  }

  async getActiveMonthlyPackage(userId: number): Promise<MonthlyPackage | undefined> {
    const [pkg] = await db
      .select()
      .from(monthlyPackages)
      .where(and(
        eq(monthlyPackages.userId, userId),
        eq(monthlyPackages.isActive, true),
        sql`end_date > now()`
      ))
      .orderBy(desc(monthlyPackages.createdAt))
      .limit(1);
    return pkg;
  }

  async updateMonthlyPackage(id: number, updates: Partial<MonthlyPackage>): Promise<MonthlyPackage> {
    const [pkg] = await db
      .update(monthlyPackages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(monthlyPackages.id, id))
      .returning();
    return pkg;
  }

  async processMonthlyPackageCredits(): Promise<void> {
    console.log('🎁 Processing daily credits for monthly packages...');
    
    const now = new Date();
    const activePackages = await db
      .select()
      .from(monthlyPackages)
      .where(and(
        eq(monthlyPackages.isActive, true),
        sql`end_date > now()`,
        sql`total_days_remaining > 0`
      ));

    let processedCount = 0;
    
    for (const pkg of activePackages) {
      try {
        const lastCreditDate = pkg.lastCreditDate ? new Date(pkg.lastCreditDate) : null;
        const shouldProcessCredit = !lastCreditDate || 
          (now.getTime() - lastCreditDate.getTime()) >= 24 * 60 * 60 * 1000; // 24 hours

        if (shouldProcessCredit) {
          console.log(`💰 PROCESSING MONTHLY PACKAGE: User ${pkg.userId}, Package ${pkg.id}`);
          console.log(`💰 Daily Credit: ${parseInt(pkg.dailyCredit).toLocaleString()} VNĐ`);
          console.log(`📅 Days Remaining: ${pkg.totalDaysRemaining}/30`);
          
          // Add daily credit to user balance
          await this.updateUserBalance(pkg.userId, parseInt(pkg.dailyCredit));
          
          // Update package record
          const newDaysRemaining = Math.max(0, pkg.totalDaysRemaining - 1);
          const isStillActive = newDaysRemaining > 0 && now < new Date(pkg.endDate);
          
          await this.updateMonthlyPackage(pkg.id, {
            lastCreditDate: now,
            totalDaysRemaining: newDaysRemaining,
            isActive: isStillActive,
          });
          
          console.log(`✅ Added ${parseInt(pkg.dailyCredit).toLocaleString()} VNĐ to user ${pkg.userId}, ${newDaysRemaining} days remaining`);
          processedCount++;
          
          if (!isStillActive) {
            console.log(`📅 Package ${pkg.id} for user ${pkg.userId} has expired (0 days remaining)`);
          }
        } else {
          const timeSinceLastCredit = lastCreditDate ? Math.floor((now.getTime() - lastCreditDate.getTime()) / (60 * 60 * 1000)) : 0;
          console.log(`⏳ Package ${pkg.id} for user ${pkg.userId}: ${timeSinceLastCredit}h since last credit (need 24h)`);
        }
      } catch (error) {
        console.error(`❌ Error processing package ${pkg.id}:`, error);
      }
    }
    
    console.log(`✅ Processed ${processedCount} monthly packages`);
  }
}

export const storage = new DatabaseStorage();
