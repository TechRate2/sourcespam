/**
 * PRODUCTION-GRADE DID MANAGEMENT SYSTEM
 * Handles DID allocation, blocking, and auto-recovery for high-traffic scenarios
 */

import { db } from '../db';
import { dids } from '../../shared/schema';
import { eq, and, sql, or, isNull, lt } from 'drizzle-orm';

export class DIDManager {
  private static instance: DIDManager;
  private releaseTimer: NodeJS.Timeout | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  static getInstance(): DIDManager {
    if (!DIDManager.instance) {
      DIDManager.instance = new DIDManager();
    }
    return DIDManager.instance;
  }

  constructor() {
    this.startHealthCheck();
    this.startAutoRelease();
    console.log('✅ DID Manager initialized with production-grade allocation');
  }

  // ✅ CRITICAL FIX: Cleanup method to prevent memory leaks
  cleanup(): void {
    console.log('🧹 DID Manager cleanup initiated...');
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('✅ Health check timer cleared');
    }
    
    if (this.releaseTimer) {
      clearInterval(this.releaseTimer);
      this.releaseTimer = null;
      console.log('✅ Release timer cleared');
    }
    
    console.log('✅ DID Manager cleanup completed');
  }

  /**
   * ✅ CRITICAL FIX: Atomic DID allocation to prevent race conditions
   */
  async allocateDID(targetNumber: string, excludeNumbers: string[] = []): Promise<any> {
    console.log(`🎯 ATOMIC DID ALLOCATION: Target=${targetNumber}, Exclude=[${excludeNumbers.join(', ')}]`);
    
    try {
      // Use database transaction with row locking
      return await db.transaction(async (tx) => {
        // Lock and get available DID atomically
        const [did] = await tx
          .select()
          .from(dids)
          .where(and(
            eq(dids.isActive, true),
            sql`(${dids.blockedUntil} IS NULL OR ${dids.blockedUntil} < NOW())`
          ))
          .orderBy(sql`COALESCE(last_used, '1970-01-01'::timestamp) ASC`)
          .limit(1)
          .for('update'); // CRITICAL: Lock the row immediately

        if (!did) {
          throw new Error('No DIDs available for allocation');
        }

        // Check if excluded
        if (excludeNumbers.includes(did.phoneNumber)) {
          throw new Error('All available DIDs are excluded');
        }

        // Atomically mark DID as allocated
        const [allocatedDid] = await tx
          .update(dids)
          .set({
            lastUsed: new Date(),
            currentTargetNumber: targetNumber,
            blockedUntil: new Date(Date.now() + 120000), // 2 minutes
            usageCount: sql`${dids.usageCount} + 1`,
            updatedAt: new Date()
          })
          .where(eq(dids.id, did.id))
          .returning();

        console.log(`✅ ATOMIC DID ALLOCATION SUCCESS: ${allocatedDid.phoneNumber} for ${targetNumber}`);
        return allocatedDid;
      });
    } catch (error) {
      console.error(`❌ ATOMIC DID ALLOCATION FAILED:`, error);
      throw new Error(`DID allocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * FIXED: Smart DID allocation - prevents conflicts with recovery system
   */
  private async trySmartAllocation(targetNumber: string, excludeNumbers: string[]): Promise<any> {
    const now = new Date();
    const allDids = await db
      .select()
      .from(dids)
      .where(eq(dids.isActive, true))
      .orderBy(sql`COALESCE(last_used, '1970-01-01'::timestamp) ASC`);

    console.log(`📋 Total DIDs available: ${allDids.length}`);

    // CRITICAL FIX: Only exclude DIDs that are ACTUALLY in active calls
    const availableDids = allDids.filter(did => {
      const isExcluded = excludeNumbers.includes(did.phoneNumber);
      // Only block if currently allocated to THIS target AND recently used (within 2 minutes)
      const recentlyAllocated = did.currentTargetNumber === targetNumber && 
                               did.lastUsed && 
                               (now.getTime() - new Date(did.lastUsed).getTime()) < 120000; // 2 minutes

      const isAvailable = !isExcluded && !recentlyAllocated;
      
      console.log(`📞 DID ${did.phoneNumber}: excluded=${isExcluded}, recently_allocated_to_target=${recentlyAllocated}, available=${isAvailable}`);
      return isAvailable;
    });

    console.log(`✅ Available DIDs after filtering: ${availableDids.length}`);

    if (availableDids.length === 0) return null;

    const selectedDid = availableDids[0];
    
    // Atomic DID allocation with minimal blocking
    const result = await db
      .update(dids)
      .set({
        lastUsed: now,
        currentTargetNumber: targetNumber,
        blockedUntil: new Date(now.getTime() + 60000), // Only 1 minute block
        usageCount: sql`${dids.usageCount} + 1`,
        updatedAt: now
      })
      .where(eq(dids.id, selectedDid.id))
      .returning();

    if (result.length === 0) {
      console.log(`⚠️ DID ${selectedDid.phoneNumber} allocation failed`);
      return null;
    }

    console.log(`✅ DID ${selectedDid.phoneNumber} allocated for ${targetNumber}`);
    return result[0];
  }

  /**
   * Get any available DID (ultimate fallback)
   */
  private async getAnyAvailableDID(excludeNumbers: string[]): Promise<any> {
    const [did] = await db
      .select()
      .from(dids)
      .where(and(
        eq(dids.isActive, true),
        sql`phone_number NOT IN (${excludeNumbers.map(n => `'${n}'`).join(',')})`
      ))
      .limit(1);

    if (did) {
      await db
        .update(dids)
        .set({
          lastUsed: new Date(),
          currentTargetNumber: 'emergency-fallback',
          blockedUntil: new Date(Date.now() + 60000), // 1 minute emergency timeout
          updatedAt: new Date()
        })
        .where(eq(dids.id, did.id));
      
      console.log(`🚨 Emergency DID allocated: ${did.phoneNumber}`);
    }

    return did;
  }

  /**
   * Release DID after call completion
   */
  async releaseDID(didId: number, reason: string = 'call-completed'): Promise<void> {
    const result = await db
      .update(dids)
      .set({
        currentTargetNumber: null,
        blockedUntil: null,
        updatedAt: new Date()
      })
      .where(eq(dids.id, didId))
      .returning();

    if (result.length > 0) {
      console.log(`🔓 DID ${result[0].phoneNumber} released (${reason})`);
    }
  }

  /**
   * Release stale DIDs (blocked > 5 minutes)
   */
  private async releaseStaleDIDs(): Promise<number> {
    const staleTime = new Date(Date.now() - 300000); // 5 minutes ago
    
    const result = await db
      .update(dids)
      .set({
        currentTargetNumber: null,
        blockedUntil: null,
        updatedAt: new Date()
      })
      .where(and(
        eq(dids.isActive, true),
        sql`blocked_until < ${staleTime} OR last_used < ${staleTime}`
      ))
      .returning();

    console.log(`🧹 Released ${result.length} stale DIDs`);
    return result.length;
  }

  /**
   * Force release all blocked DIDs (emergency)
   */
  async forceReleaseAllDIDs(): Promise<number> {
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

    console.log(`🚨 Emergency: Force released ${result.length} DIDs`);
    return result.length;
  }

  /**
   * Health check: Auto-release DIDs every 30 seconds
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        const releasedCount = await this.releaseStaleDIDs();
        if (releasedCount > 0) {
          console.log(`💚 Health Check: Auto-released ${releasedCount} stale DIDs`);
        }
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Auto-release mechanism: Every 2 minutes
   */
  private startAutoRelease(): void {
    this.releaseTimer = setInterval(async () => {
      try {
        // Get pool status
        const poolStatus = await this.getPoolStatus();
        
        if (poolStatus.availableCount === 0 && poolStatus.blockedCount > 0) {
          console.log(`🔄 Auto-release triggered: 0 available, ${poolStatus.blockedCount} blocked`);
          await this.releaseStaleDIDs();
        }
      } catch (error) {
        console.error('Auto-release error:', error);
      }
    }, 120000); // Every 2 minutes
  }

  /**
   * Get DID pool status for monitoring
   */
  async getPoolStatus(): Promise<{
    totalCount: number;
    availableCount: number;
    blockedCount: number;
    staleCount: number;
  }> {
    const totalDids = await db
      .select({ count: sql`count(*)` })
      .from(dids)
      .where(eq(dids.isActive, true));

    const blockedDids = await db
      .select({ count: sql`count(*)` })
      .from(dids)
      .where(and(
        eq(dids.isActive, true),
        sql`current_target_number IS NOT NULL`
      ));

    const staleTime = new Date(Date.now() - 300000);
    const staleDids = await db
      .select({ count: sql`count(*)` })
      .from(dids)
      .where(and(
        eq(dids.isActive, true),
        sql`blocked_until < ${staleTime}`
      ));

    const totalCount = Number(totalDids[0]?.count || 0);
    const blockedCount = Number(blockedDids[0]?.count || 0);
    const staleCount = Number(staleDids[0]?.count || 0);
    const availableCount = totalCount - blockedCount;

    return {
      totalCount,
      availableCount,
      blockedCount,
      staleCount
    };
  }

  /**
   * Cleanup timers on shutdown
   */
  destroy(): void {
    if (this.releaseTimer) {
      clearInterval(this.releaseTimer);
      this.releaseTimer = null;
    }
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

// Export singleton instance
export const didManager = DIDManager.getInstance();