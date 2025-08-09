import twilio from 'twilio';

// Get platform-aware base URL for webhooks
function getPlatformBaseUrl(): string {
  const isReplit = !!process.env.REPLIT_DOMAINS;
  const domain = process.env.DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  
  if (isReplit) {
    return `https://${domain}`;
  } else if (process.env.NODE_ENV === 'production') {
    return `https://${domain}`;
  } else {
    return `http://${domain}`;
  }
}

export class TwilioService {
  // Test Twilio credentials
  static async testCredentials(accountSid: string, authToken: string) {
    try {
      const client = twilio(accountSid, authToken);
      const account = await client.api.accounts(accountSid).fetch();
      return {
        success: true,
        account: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get phone numbers from Twilio account
  static async getPhoneNumbers(accountSid: string, authToken: string) {
    try {
      const client = twilio(accountSid, authToken);
      const phoneNumbers = await client.incomingPhoneNumbers.list({
        limit: 100 // Get up to 100 numbers
      });

      return {
        success: true,
        phoneNumbers: phoneNumbers.map(number => ({
          sid: number.sid,
          phoneNumber: number.phoneNumber,
          friendlyName: number.friendlyName,
          capabilities: {
            voice: number.capabilities?.voice || false,
            sms: number.capabilities?.sms || false,
            mms: number.capabilities?.mms || false
          }
        }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Make a call using Twilio
  static async makeCall(params: {
    from: string;
    to: string;
    twilioAccountId: number;
    callId: number;
    accountSid: string;
    authToken: string;
  }) {
    try {
      const { from, to, accountSid, authToken } = params;
      const client = twilio(accountSid, authToken);

      const call = await client.calls.create({
        from: from,
        to: to,
        url: `${process.env.BASE_URL || getPlatformBaseUrl()}/api/webhook/call-response`,
        statusCallback: `${process.env.BASE_URL || getPlatformBaseUrl()}/api/webhook/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        timeout: 40, // TĂNG GẤP ĐÔI: 20 → 40 giây cho thời gian đổ chuông
        record: false,
        machineDetection: 'Enable',
        machineDetectionTimeout: 5000
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}