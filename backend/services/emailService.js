const sgMail = require('@sendgrid/mail');

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'solarcareconnect@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@aiappointments.com';

const emailService = {
  async sendInvoiceEmail(user, plan) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid not configured - would send invoice email to:', user.email);
        return { success: false, error: 'Email service not configured' };
      }

      const msg = {
        to: user.email,
        from: FROM_EMAIL,
        subject: `Invoice for ${plan.name} Subscription - AI Appointments`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">Thank you for your subscription!</h2>
            
            <p>Dear ${user.name},</p>
            
            <p>Thank you for subscribing to our <strong>${plan.name}</strong> plan!</p>
            
            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Subscription Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Plan:</strong> ${plan.name}</li>
                <li><strong>Price:</strong> $${plan.price.toLocaleString()}/${plan.interval}</li>
                <li><strong>Appointments:</strong> ${plan.appointmentsPerMonth === 999 ? 'Unlimited' : plan.appointmentsPerMonth} per month</li>
                <li><strong>Company:</strong> ${user.company}</li>
              </ul>
            </div>
            
            <p>Your subscription will begin immediately, and you'll start receiving AI-generated appointments based on your location preferences.</p>
            
            <p>If you have any questions, please contact our support team at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
            
            <p>Best regards,<br>AI Appointments Team</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('Invoice email sent successfully to:', user.email);
      return { success: true };
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      return { success: false, error: error.message };
    }
  },

  async sendAdminEmail(user, plan, locationPreferences, notificationPreferences) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid not configured - would send admin email');
        return { success: false, error: 'Email service not configured' };
      }

      const msg = {
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: '🎉 New Subscriber - AI Appointments',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">New Subscriber Alert!</h2>
            
            <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #3B82F6;">Customer Details:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Name:</strong> ${user.name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Company:</strong> ${user.company}</li>
                <li><strong>Phone:</strong> ${user.phone}</li>
              </ul>
            </div>
            
            <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #10B981;">Subscription:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Plan:</strong> ${plan.name}</li>
                <li><strong>Price:</strong> $${plan.price.toLocaleString()}/${plan.interval}</li>
                <li><strong>Appointments:</strong> ${plan.appointmentsPerMonth === 999 ? 'Unlimited' : plan.appointmentsPerMonth} per month</li>
              </ul>
            </div>
            
            <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #F59E0B;">Location Preferences:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Cities:</strong> ${locationPreferences?.cities?.join(', ') || 'None'}</li>
                <li><strong>States:</strong> ${locationPreferences?.states?.join(', ') || 'None'}</li>
                <li><strong>ZIP Codes:</strong> ${locationPreferences?.zipCodes?.join(', ') || 'None'}</li>
                <li><strong>Counties:</strong> ${locationPreferences?.counties?.join(', ') || 'None'}</li>
              </ul>
            </div>
            
            <div style="background-color: #EEE6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6366F1;">Notification Preferences:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Email:</strong> ${notificationPreferences?.email ? 'Yes' : 'No'} ${notificationPreferences?.emailAddress ? `(${notificationPreferences.emailAddress})` : ''}</li>
                <li><strong>SMS:</strong> ${notificationPreferences?.sms ? 'Yes' : 'No'} ${notificationPreferences?.phoneNumber ? `(${notificationPreferences.phoneNumber})` : ''}</li>
              </ul>
            </div>
            
            <p style="background-color: #FEE2E2; padding: 15px; border-radius: 8px; color: #DC2626;">
              <strong>Action Required:</strong> Please set up their account and begin generating appointments.
            </p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('Admin email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to send admin email:', error);
      return { success: false, error: error.message };
    }
  },

  async sendConfirmationEmail(user, plan, emailAddress) {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('SendGrid not configured - would send confirmation email to:', emailAddress);
        return { success: false, error: 'Email service not configured' };
      }

      const msg = {
        to: emailAddress,
        from: FROM_EMAIL,
        subject: 'Subscription Confirmed - AI Appointments',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Subscription Confirmed! 🎉</h2>
            
            <p>Hi ${user.name},</p>
            
            <p>Your <strong>${plan.name}</strong> subscription has been confirmed!</p>
            
            <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>You'll start receiving AI-generated appointments based on your preferences. Our AI will begin calling potential customers in your target areas.</p>
            </div>
            
            <p>If you have any questions, contact us at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
            
            <p>Welcome to AI Appointments!</p>
            
            <p>Best regards,<br>The AI Appointments Team</p>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log('Confirmation email sent successfully to:', emailAddress);
      return { success: true };
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;