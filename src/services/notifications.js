/**
 * ZenStudy - Emergency Notification Service
 * Abstracts the SMS dispatch system for clinical & academic safety.
 * This can be wired directly to Twilio or another SMS gateway.
 */
export const NotificationService = {
  /**
   * Simulates sending an SMS alert to the student's configured emergency contact.
   * Logs payload details in console for review.
   * 
   * @param {Object} contact { name, relationship, phone }
   * @param {string} studentName 
   * @param {string} examName 
   * @returns {Promise<Object>} Status response
   */
  async sendEmergencySMS(contact, studentName, examName) {
    return new Promise((resolve, reject) => {
      // Simulate network request delay (1.5s)
      setTimeout(() => {
        if (!contact || !contact.name || !contact.phone) {
          reject(new Error('Invalid contact credentials. SMS notification failed.'));
          return;
        }

        const messageBody = `Hello ${contact.name}, this is ZenStudy AI. ${studentName} has chosen to notify you because they are experiencing significant stress during their ${examName} preparation. Please check in with them today and offer support. This is a wellness alert and not a medical diagnosis.`;

        // Log envelope for audit & hackathon review
        console.log('%c--- TWILIO SMS GATEWAY DISPATCH SIMULATOR ---', 'color: #f43f5e; font-weight: bold;');
        console.log(`%cTo: ${contact.name} (${contact.relationship})`, 'color: #38bdf8;');
        console.log(`%cPhone: ${contact.phone}`, 'color: #38bdf8;');
        console.log(`%cMessage: "${messageBody}"`, 'color: #e2e8f0; font-style: italic;');
        console.log('%c---------------------------------------------', 'color: #f43f5e; font-weight: bold;');

        resolve({
          success: true,
          messageId: `SM_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          payload: messageBody
        });
      }, 1500);
    });
  }
};
