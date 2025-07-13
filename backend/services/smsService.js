const twilio = require('twilio');

// Configure Twilio
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const ADMIN_PHONE = process.env.ADMIN_PHONE || '+17024085207';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

const smsService = {
  async sendAdminSMS(user, plan) {
    try {
      if (!twilioClient || !TWILIO_PHONE) {
        console.log('Twilio not configured - would send SMS to:', ADMIN_PHONE);
        return { success: false, error: 'SMS service not configured' };
      }

      const message = `🎉 New AI Appointments subscriber: ${user.name} from ${user.company} subscribed to ${plan.name} plan ($${plan.price}/${plan.interval}). Check email for details.`;

      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE,
        to: ADMIN_PHONE
      });

      console.log('Admin SMS sent successfully:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Failed to send admin SMS:', error);
      return { success: false, error: error.message };
    }
  },

  async sendConfirmationSMS(user, plan, phoneNumber) {
    try {
      if (!twilioClient || !TWILIO_PHONE) {
        console.log('Twilio not configured - would send SMS to:', phoneNumber);
        return { success: false, error: 'SMS service not configured' };
      }

      const message = `AI Appointments: Your ${plan.name} subscription is confirmed! You'll start receiving appointments soon. Questions? Email solarcareconnect@gmail.com`;

      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE,
        to: phoneNumber
      });

      console.log('Confirmation SMS sent successfully to:', phoneNumber);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Failed to send confirmation SMS:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = smsService;