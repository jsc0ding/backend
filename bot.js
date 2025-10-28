const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

const sendToBot = (text) => {
  bot.sendMessage(process.env.CHAT_ID, text);
};

module.exports = { bot, sendToBot };