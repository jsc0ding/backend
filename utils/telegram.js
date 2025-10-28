import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Send appointment information to Telegram
 * @param {Object} appointment - Appointment object containing patient details
 * @returns {Promise<boolean>} - Whether the message was sent successfully
 */
const sendTelegramNotification = async (appointment) => {
  try {
    console.log('=== Telegram Notification Function Called ===');
    console.log('Appointment data received:', JSON.stringify(appointment, null, 2));
    
    const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    console.log('Environment variables check:');
    console.log('- BOT_TOKEN:', token ? 'SET' : 'MISSING');
    console.log('- CHAT_ID:', chatId ? 'SET' : 'MISSING');

    // Validate environment variables
    if (!token || !chatId) {
      console.error('Telegram configuration missing: BOT_TOKEN and/or CHAT_ID not found in .env');
      return false;
    }

    // Check if chat ID is the same as bot ID (common mistake)
    const botId = token.split(':')[0];
    console.log('Bot ID:', botId);
    console.log('Chat ID:', chatId);
    
    if (chatId === botId) {
      console.error('❌ CHAT_ID is the same as bot ID! Telegram cannot send messages to itself.');
      return false;
    }

    // Validate appointment data
    const requiredFields = ['fullName', 'phone', 'doctorName', 'time'];
    const missingFields = requiredFields.filter(field => !appointment[field]);
    
    if (!appointment || missingFields.length > 0) {
      console.error('Invalid appointment data provided to sendTelegramNotification:');
      console.error('Missing fields:', missingFields);
      console.error('Received data:', appointment);
      return false;
    }

    // Format the message according to requirements
    const message = `✅ Navbatingiz qabul qilindi!

🏥 Yangi navbat olindi!

👤 ${appointment.fullName}

📞 ${appointment.phone}

🧑‍⚕️ ${appointment.doctorName} (${appointment.specialty || 'N/A'})

🏢 ${appointment.department}

📅 ${appointment.date ? new Date(appointment.date).toLocaleDateString('uz-UZ') : 'N/A'}

🕒 ${appointment.time}`;

    console.log("📤 Sending message to Telegram:", message);
    console.log("🤖 BOT_TOKEN:", token ? `${token.substring(0, 10)}...` : 'NOT SET');
    console.log("💬 CHAT_ID:", chatId);

    // Send message using axios
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    console.log('Sending request to:', url);
    
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    });

    console.log('Telegram API response status:', response.status);
    console.log('Telegram API response data:', JSON.stringify(response.data, null, 2));

    if (response.data.ok) {
      console.log('✅ Appointment notification sent to Telegram successfully');
      return true;
    } else {
      console.error('❌ Telegram API returned an error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending message to Telegram:');
    console.error('- Message:', error.message);
    if (error.response) {
      console.error('- Response status:', error.response.status);
      console.error('- Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.request) {
      console.error('- Request data:', error.request);
    }
    return false;
  }
};

/**
 * Send complaint information to Telegram
 * @param {Object} complaint - Complaint object containing user details
 * @returns {Promise<boolean>} - Whether the message was sent successfully
 */
const sendComplaintNotification = async (complaint) => {
  try {
    const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    // Validate environment variables
    if (!token || !chatId) {
      console.error('Telegram configuration missing: BOT_TOKEN and/or CHAT_ID not found in .env');
      return false;
    }

    // Check if chat ID is the same as bot ID (common mistake)
    const botId = token.split(':')[0];
    if (chatId === botId) {
      console.error('❌ CHAT_ID is the same as bot ID! Telegram cannot send messages to itself.');
      return false;
    }

    // Format the message similar to appointment notifications
    const message = `📢 Yangi shikoyat!

👤 ${complaint.name}
${complaint.phone ? `📞 ${complaint.phone}` : ''}
📝 ${complaint.message}
📅 ${new Date(complaint.createdAt).toLocaleString('uz-UZ')}`;

    console.log("📤 Sending complaint message to Telegram:", message);
    console.log("🤖 BOT_TOKEN:", token ? `${token.substring(0, 10)}...` : 'NOT SET');
    console.log("💬 CHAT_ID:", chatId);

    // Send message using axios
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    });

    if (response.data.ok) {
      console.log('✅ Complaint notification sent to Telegram successfully');
      return true;
    } else {
      console.error('❌ Telegram API returned an error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending complaint message to Telegram:', error.message);
    if (error.response) {
      console.error('Telegram API response:', error.response.data);
    }
    return false;
  }
};

/**
 * Send service appointment information to Telegram
 * @param {Object} serviceAppointment - Service appointment object containing patient details
 * @returns {Promise<boolean>} - Whether the message was sent successfully
 */
const sendServiceAppointmentNotification = async (serviceAppointment) => {
  try {
    const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    // Validate environment variables
    if (!token || !chatId) {
      console.error('Telegram configuration missing: BOT_TOKEN and/or CHAT_ID not found in .env');
      return false;
    }

    // Check if chat ID is the same as bot ID (common mistake)
    const botId = token.split(':')[0];
    if (chatId === botId) {
      console.error('❌ CHAT_ID is the same as bot ID! Telegram cannot send messages to itself.');
      return false;
    }

    // Validate service appointment data
    const requiredFields = ['patientName', 'patientPhone', 'serviceType', 'time'];
    const missingFields = requiredFields.filter(field => !serviceAppointment[field]);
    
    if (!serviceAppointment || missingFields.length > 0) {
      console.error('Invalid service appointment data provided:');
      console.error('Missing fields:', missingFields);
      console.error('Received data:', serviceAppointment);
      return false;
    }

    // Format the message for service appointments
    const message = `🛠️ Yangi xizmat navbati olindi!

👤 ${serviceAppointment.patientName}

📞 ${serviceAppointment.patientPhone}

🔧 ${serviceAppointment.serviceType}

📅 ${serviceAppointment.date ? new Date(serviceAppointment.date).toLocaleDateString('uz-UZ') : 'N/A'}

🕒 ${serviceAppointment.time}`;

    console.log("📤 Sending service appointment message to Telegram:", message);
    console.log("🤖 BOT_TOKEN:", token ? `${token.substring(0, 10)}...` : 'NOT SET');
    console.log("💬 CHAT_ID:", chatId);

    // Send message using axios
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message
    });

    if (response.data.ok) {
      console.log('✅ Service appointment notification sent to Telegram successfully');
      return true;
    } else {
      console.error('❌ Telegram API returned an error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending service appointment message to Telegram:', error.message);
    if (error.response) {
      console.error('Telegram API response:', error.response.data);
    }
    return false;
  }
};

export {
  sendTelegramNotification,
  sendComplaintNotification,
  sendServiceAppointmentNotification
};