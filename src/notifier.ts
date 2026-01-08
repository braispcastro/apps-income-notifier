import axios from 'axios';
import 'dotenv/config';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendNotification(message: string) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping notification.');
    console.log('Message was:', message);
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });
    console.log('Notification sent successfully');
  } catch (error: any) {
    console.error('Error sending notification:', error.response?.data || error.message);
  }
}
