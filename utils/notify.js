require("dotenv").config();
const axios = require("axios");

async function sendDiscordNotification(items, city) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) return;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    await axios.post(discordWebhookUrl, {
      content: `📢 **在 ${city} 發現 ${items.length} 筆新房源**`,
    });

    for (const item of items) {
      await axios.post(discordWebhookUrl, {
        content: item.link,
      });
      await delay(300); // 等 300 毫秒，避免觸發 Discord 的 rate limit
    }

    console.log(`✅ Discord 已通知在 ${city} 的新物件`);
  } catch (error) {
    console.error("❌ 傳送 Discord 通知失敗:", error.message);
  }
}

module.exports = { sendDiscordNotification };
