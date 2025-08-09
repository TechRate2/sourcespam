import { storage } from '../storage';
import { didManager } from './did-manager';
import { twilioService } from './twilio';

/**
 * ✅ OPTIMIZATION: Background Campaign Queue Processor
 * Xử lý campaigns trong queue khi có DIDs available
 */
class CampaignProcessor {
  private static instance: CampaignProcessor;
  private processingTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  private constructor() {
    console.log('✅ Campaign Processor initialized');
  }

  static getInstance(): CampaignProcessor {
    if (!CampaignProcessor.instance) {
      CampaignProcessor.instance = new CampaignProcessor();
    }
    return CampaignProcessor.instance;
  }

  /**
   * Start background campaign processing
   */
  startProcessing(): void {
    if (this.processingTimer) {
      console.log('⚠️ Campaign processor already running');
      return;
    }

    console.log('🚀 Starting campaign queue processor...');
    this.processingTimer = setInterval(async () => {
      await this.processPendingCampaigns();
    }, 10000); // Process every 10 seconds

    console.log('✅ Campaign processor started');
  }

  /**
   * Stop background processing
   */
  stopProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
      console.log('🛑 Campaign processor stopped');
    }
  }

  /**
   * Process pending campaigns in the queue
   */
  private async processPendingCampaigns(): Promise<void> {
    if (this.isProcessing) {
      console.log('⏳ Campaign processing already in progress, skipping...');
      return;
    }

    try {
      this.isProcessing = true;
      
      // Get available DIDs
      const availableDids = await storage.getActiveDids();
      const freeDidCount = availableDids.filter(did => 
        !did.blockedUntil || new Date(did.blockedUntil) < new Date()
      ).length;

      if (freeDidCount === 0) {
        console.log('📵 No DIDs available for campaign processing');
        return;
      }

      // Get pending campaigns
      const pendingCampaigns = await storage.getPendingCampaigns();
      
      if (pendingCampaigns.length === 0) {
        return; // No campaigns to process
      }

      console.log(`🎯 Processing campaigns: ${pendingCampaigns.length} pending, ${freeDidCount} DIDs available`);

      // Process campaigns up to available DID count
      const campaignsToProcess = pendingCampaigns.slice(0, freeDidCount);
      
      for (const campaign of campaignsToProcess) {
        await this.processCampaign(campaign);
      }

    } catch (error) {
      console.error('❌ Campaign processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single campaign
   */
  private async processCampaign(campaign: any): Promise<void> {
    try {
      console.log(`🎯 Processing campaign ${campaign.id}: ${campaign.name}`);
      
      // Update campaign status to running
      await storage.updateCampaign(campaign.id, { 
        status: 'running',
        updatedAt: new Date()
      });

      const remainingAttempts = campaign.totalAttempts - campaign.completedAttempts;
      
      // Allocate DID for this campaign
      const did = await didManager.allocateDID(campaign.targetNumber);
      
      if (!did) {
        console.log(`❌ No DID available for campaign ${campaign.id}`);
        // Reset to pending for next processing cycle
        await storage.updateCampaign(campaign.id, { status: 'pending' });
        return;
      }

      // Create call record first
      const call = await storage.createCall({
        userId: campaign.userId,
        fromNumber: did.phoneNumber,
        toNumber: campaign.targetNumber,
        twilioCallSid: null, // Will be updated after Twilio call
        status: 'queued',
        cost: '600', // 600 VNĐ flat rate
        didId: did.id,
        twilioAccountId: did.twilioAccountId,
        isTest: false,
        callAttempt: campaign.completedAttempts + 1,
        totalAttempts: campaign.totalAttempts,
      });

      // Make the call
      const callResult = await twilioService.makeCall({
        from: did.phoneNumber,
        to: campaign.targetNumber,
        twilioAccountId: did.twilioAccountId,
        callId: call.id,
      });

      if (callResult && callResult.sid) {
        // Update call record with Twilio SID
        await storage.updateCall(call.id, {
          twilioCallSid: callResult.sid,
          status: 'initiated'
        });

        // Update campaign progress
        const newCompletedAttempts = campaign.completedAttempts + 1;
        const campaignStatus = newCompletedAttempts >= campaign.totalAttempts ? 'completed' : 'pending';
        
        await storage.updateCampaign(campaign.id, {
          completedAttempts: newCompletedAttempts,
          status: campaignStatus,
          updatedAt: new Date()
        });

        console.log(`✅ Campaign ${campaign.id} progress: ${newCompletedAttempts}/${campaign.totalAttempts}`);
        
      } else {
        console.log(`❌ Campaign ${campaign.id} call failed, resetting to pending`);
        await storage.updateCampaign(campaign.id, { status: 'pending' });
        await didManager.releaseDID(did.id, 'call-failed');
      }

    } catch (error) {
      console.error(`❌ Error processing campaign ${campaign.id}:`, error);
      await storage.updateCampaign(campaign.id, { status: 'pending' });
    }
  }

  /**
   * Get campaign processing status
   */
  getStatus(): { 
    isRunning: boolean; 
    isProcessing: boolean; 
  } {
    return {
      isRunning: this.processingTimer !== null,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Cleanup on shutdown
   */
  cleanup(): void {
    console.log('🧹 Campaign processor cleanup initiated...');
    this.stopProcessing();
    console.log('✅ Campaign processor cleanup completed');
  }
}

export const campaignProcessor = CampaignProcessor.getInstance();