import { Request, Response } from 'express';
import { storage } from './storage';

/**
 * TWILIO WEBHOOK HANDLER
 * Xử lý real-time updates từ Twilio về trạng thái cuộc gọi
 */

export class WebhookHandler {
  /**
   * Voice webhook - xử lý TwiML response
   */
  static async handleVoice(req: Request, res: Response): Promise<void> {
    try {
      console.log('📞 Voice webhook received:', req.body);
      
      // TwiML để trả lời cuộc gọi và phát âm thanh
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>https://demo.twilio.com/docs/classic.mp3</Play>
    <Pause length="2"/>
    <Hangup/>
</Response>`;

      res.set('Content-Type', 'text/xml');
      res.send(twiml);
    } catch (error) {
      console.error('❌ Voice webhook error:', error);
      res.status(500).send('Error processing voice webhook');
    }
  }

  /**
   * Status callback webhook - tracking chi tiết thời gian
   */
  static async handleStatusCallback(req: Request, res: Response): Promise<void> {
    try {
      const {
        CallSid,
        CallStatus,
        CallDuration,
        From,
        To,
        AnsweredBy,
        Timestamp,
        MachineDetectionDuration
      } = req.body;

      console.log(`📊 Status Update: ${CallSid} → ${CallStatus}`, {
        from: From,
        to: To,
        duration: CallDuration,
        answeredBy: AnsweredBy,
        timestamp: Timestamp
      });

      // Tìm call record trong database
      const call = await storage.getCallByTwilioSid(CallSid);
      if (!call) {
        console.log(`⚠️ Call not found for SID: ${CallSid}`);
        res.status(200).send('OK');
        return;
      }

      // Tính toán thời gian dựa trên status
      const updateData: any = {
        status: CallStatus,
        updatedAt: new Date(),
      };

      const currentTime = new Date();

      switch (CallStatus) {
        case 'initiated':
          updateData.startTime = currentTime;
          console.log(`🎯 Call ${CallSid} initiated at ${currentTime.toISOString()}`);
          break;

        case 'ringing':
          updateData.ringingTime = currentTime;
          console.log(`🔔 Call ${CallSid} ringing at ${currentTime.toISOString()}`);
          break;

        case 'in-progress':
        case 'answered':
          updateData.answerTime = currentTime;
          updateData.answeredBy = AnsweredBy || 'human';
          
          // Tính thời gian đổ chuông
          if (call.ringingTime) {
            const ringingDuration = Math.floor((currentTime.getTime() - new Date(call.ringingTime).getTime()) / 1000);
            updateData.ringingDuration = ringingDuration;
            console.log(`📞 Call ${CallSid} answered! Đổ chuông: ${ringingDuration} giây`);
          }
          break;

        case 'completed':
        case 'busy':
        case 'no-answer':
        case 'canceled':
        case 'failed':
          updateData.endTime = currentTime;
          updateData.endReason = CallStatus;
          
          if (CallDuration) {
            updateData.callDuration = parseInt(CallDuration);
          }

          if (MachineDetectionDuration) {
            updateData.machineDetectionDuration = parseInt(MachineDetectionDuration);
          }

          // Tính tổng thời gian cuộc gọi
          if (call.startTime) {
            const totalDuration = Math.floor((currentTime.getTime() - new Date(call.startTime).getTime()) / 1000);
            updateData.totalDuration = totalDuration;
          }

          // Tính thời gian đổ chuông nếu chưa có
          if (!call.ringingDuration && call.ringingTime && call.answerTime) {
            const ringingDuration = Math.floor((new Date(call.answerTime).getTime() - new Date(call.ringingTime).getTime()) / 1000);
            updateData.ringingDuration = ringingDuration;
          }

          console.log(`🏁 Call ${CallSid} ${CallStatus}:`, {
            callDuration: updateData.callDuration,
            ringingDuration: updateData.ringingDuration,
            totalDuration: updateData.totalDuration,
            answeredBy: updateData.answeredBy
          });
          break;
      }

      // Update call record
      await storage.updateCall(call.id, updateData);

      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Status callback error:', error);
      res.status(500).send('Error processing status callback');
    }
  }

  /**
   * Voice fallback webhook
   */
  static async handleVoiceFallback(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔧 Voice fallback webhook received:', req.body);
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="vi-VN">Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.</Say>
    <Hangup/>
</Response>`;

      res.set('Content-Type', 'text/xml');
      res.send(twiml);
    } catch (error) {
      console.error('❌ Voice fallback error:', error);
      res.status(500).send('Error processing voice fallback');
    }
  }
}

export default WebhookHandler;