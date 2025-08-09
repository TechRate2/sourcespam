import twilio from 'twilio';
import { storage } from '../storage';
import { platformConfig } from '../utils/platform-config';
import type { TwilioAccount, Did } from '@shared/schema';

export class TwilioService {
  private clients: Map<number, any> = new Map();

  private getClient(twilioAccount: TwilioAccount) {
    if (!this.clients.has(twilioAccount.id)) {
      // Allow demo accounts for testing
      if (twilioAccount.sid.startsWith('DEMO_')) {
        console.log('⚠️ Using DEMO Twilio account - calls will not be made');
        // Return mock client for demo
        const mockClient = {
          calls: {
            create: async () => {
              throw new Error('Demo account - cannot make real calls. Please add real Twilio credentials in Admin Panel.');
            }
          },
          incomingPhoneNumbers: {
            list: async () => []
          }
        };
        this.clients.set(twilioAccount.id, mockClient);
      } else {
        const client = twilio(twilioAccount.sid, twilioAccount.authToken);
        this.clients.set(twilioAccount.id, client);
      }
    }
    return this.clients.get(twilioAccount.id);
  }

  // Get webhook URL with dynamic platform detection
  private getWebhookUrl(path: string): string {
    return platformConfig.getWebhookUrl(path);
  }

  async syncDIDsForAccount(twilioAccount: TwilioAccount): Promise<Did[]> {
    try {
      const client = this.getClient(twilioAccount);
      
      // Lấy tất cả số điện thoại đã mua (incoming phone numbers) từ Twilio
      const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({ limit: 1000 });
      
      console.log(`Found ${incomingPhoneNumbers.length} phone numbers for account ${twilioAccount.sid}`);
      
      const syncedDids: Did[] = [];
      const existingDids = await storage.getDidsByTwilioAccount(twilioAccount.id);
      
      for (const phoneNumber of incomingPhoneNumbers) {
        // Kiểm tra xem DID đã tồn tại chưa
        const exists = existingDids.find(did => did.phoneNumber === phoneNumber.phoneNumber);
        
        if (!exists) {
          // Tạo DID mới với thông tin chi tiết
          const newDid = await storage.createDid({
            phoneNumber: phoneNumber.phoneNumber,
            twilioAccountId: twilioAccount.id,
            friendlyName: phoneNumber.friendlyName || phoneNumber.phoneNumber,
            isActive: true,
          });
          syncedDids.push(newDid);
          console.log(`Synced new DID: ${phoneNumber.phoneNumber}`);
        } else {
          // Cập nhật thông tin DID hiện tại nếu cần
          if (exists.friendlyName !== phoneNumber.friendlyName) {
            await storage.updateDid(exists.id, {
              friendlyName: phoneNumber.friendlyName || phoneNumber.phoneNumber,
            });
            console.log(`Updated DID: ${phoneNumber.phoneNumber}`);
          }
        }
      }
      
      // Vô hiệu hóa các DID không còn tồn tại trong Twilio
      const twilioNumbers = incomingPhoneNumbers.map((pn: any) => pn.phoneNumber);
      for (const existingDid of existingDids) {
        if (!twilioNumbers.includes(existingDid.phoneNumber) && existingDid.isActive) {
          await storage.updateDid(existingDid.id, { isActive: false });
          console.log(`Deactivated removed DID: ${existingDid.phoneNumber}`);
        }
      }
      
      return syncedDids;
    } catch (error) {
      console.error('Error syncing DIDs:', error);
      throw new Error(`Failed to sync DIDs for account ${twilioAccount.sid}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async makeCall(params: {
    from: string;
    to: string;
    twilioAccountId: number;
    callId: number;
  }): Promise<{ sid: string; status: string }> {
    try {
      const twilioAccount = await storage.getTwilioAccount(params.twilioAccountId);
      if (!twilioAccount) {
        throw new Error('Twilio account not found');
      }

      const client = this.getClient(twilioAccount);
      
      // Format Vietnamese phone number to international format
      const formattedTo = this.formatVietnamesePhoneNumber(params.to);
      
      // Tối ưu hóa cuộc gọi outbound theo best practices Twilio
      const call = await client.calls.create({
        from: params.from, // Số DID đã được chọn
        to: formattedTo,   // Số điện thoại đích đã format
        
        // TIMEOUT: 30 giây để đổ chuông chính xác theo yêu cầu
        timeout: 30,
        
        // MACHINE DETECTION: Tắt để tránh voice mail detection
        machineDetection: 'Enable',
        machineDetectionTimeout: 5, // Giảm xuống 5 giây
        machineDetectionSpeechThreshold: 1000,
        machineDetectionSpeechEndThreshold: 800,
        
        // Recording: Tắt recording để tiết kiệm chi phí
        record: false,
        
        // VOICE URL: Dynamic platform detection
        url: this.getWebhookUrl('/api/twilio/voice'),
        method: 'POST',
        
        // STATUS CALLBACK: Dynamic platform detection
        statusCallback: this.getWebhookUrl('/api/twilio/status-callback'),
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed', 'busy', 'no-answer', 'canceled', 'failed'],
        statusCallbackMethod: 'POST',
        
        // FALLBACK URL: Dynamic platform detection
        fallbackUrl: this.getWebhookUrl('/api/twilio/voice-fallback'),
        fallbackMethod: 'POST',
      });

      console.log(`Call initiated: ${call.sid} from ${params.from} to ${formattedTo}`);

      // Only update if callId is valid (not 0)
      if (params.callId > 0) {
        await storage.updateCall(params.callId, {
          twilioCallSid: call.sid,
          status: call.status,
        });
      }

      return {
        sid: call.sid,
        status: call.status,
      };
    } catch (error) {
      console.error('Error making call:', error);
      
      // Only update if callId is valid (not 0)
      if (params.callId > 0) {
        await storage.updateCall(params.callId, {
          status: 'failed',
        });
      }
      
      throw new Error(`Failed to make call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async hangupCall(twilioAccount: TwilioAccount, callSid: string): Promise<void> {
    try {
      const client = this.getClient(twilioAccount);
      await client.calls(callSid).update({ status: 'completed' });
      console.log(`Call ${callSid} hung up successfully`);
    } catch (error) {
      console.error(`Error hanging up call ${callSid}:`, error);
      throw error;
    }
  }

  private formatVietnamesePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Vietnamese phone number formats
    if (cleaned.startsWith('84')) {
      // Already in international format
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      // Vietnamese national format (09xxxxxxxx, 03xxxxxxxx, etc.)
      return '+84' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      // Missing leading 0
      return '+84' + cleaned;
    }
    
    // Default: assume it's already in the correct format
    return phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber;
  }

  async getAccountInfo(twilioAccount: TwilioAccount) {
    try {
      const client = this.getClient(twilioAccount);
      const account = await client.api.accounts(twilioAccount.sid).fetch();
      
      return {
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateAccount(sid: string, authToken: string): Promise<boolean> {
    try {
      const client = twilio(sid, authToken);
      
      // Kiểm tra account info và permissions
      const account = await client.api.accounts(sid).fetch();
      
      // Kiểm tra xem account có active không
      if (account.status !== 'active') {
        console.error(`Twilio account ${sid} is not active. Status: ${account.status}`);
        return false;
      }
      
      // Kiểm tra xem có quyền truy cập incoming phone numbers không
      try {
        await client.incomingPhoneNumbers.list({ limit: 1 });
        console.log(`Twilio account ${sid} validated successfully`);
        return true;
      } catch (permissionError) {
        console.error(`Account ${sid} lacks phone number permissions:`, permissionError);
        return false;
      }
      
    } catch (error) {
      console.error('Error validating Twilio account:', error);
      return false;
    }
  }

  // Thêm method để lấy thông tin chi tiết về tài khoản và số
  async getAccountDetails(twilioAccount: TwilioAccount) {
    try {
      const client = this.getClient(twilioAccount);
      
      // Lấy thông tin account
      const account = await client.api.accounts(twilioAccount.sid).fetch();
      
      // Lấy danh sách phone numbers
      const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 1000 });
      
      // Lấy thông tin balance (nếu có quyền)
      let balance = null;
      try {
        const balanceInfo = await client.balance.fetch();
        balance = balanceInfo.balance;
      } catch (balanceError) {
        console.log('Cannot fetch balance info (may require upgraded permissions)');
      }
      
      return {
        accountInfo: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
          dateCreated: account.dateCreated,
          dateUpdated: account.dateUpdated,
        },
        phoneNumbers: phoneNumbers.map((pn: any) => ({
          sid: pn.sid,
          phoneNumber: pn.phoneNumber,
          friendlyName: pn.friendlyName,
          capabilities: pn.capabilities,
          voiceUrl: pn.voiceUrl,
          statusCallback: pn.statusCallback,
        })),
        balance: balance,
        totalPhoneNumbers: phoneNumbers.length,
      };
    } catch (error) {
      console.error('Error getting account details:', error);
      throw new Error(`Failed to get account details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const twilioService = new TwilioService();
