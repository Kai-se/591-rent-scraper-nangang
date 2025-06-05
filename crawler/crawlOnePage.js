const { chromium } = require("playwright");
const cheerio = require("cheerio");
const config = require("../config.json");

const fs = require("fs");
const path = require("path");

async function crawlOnePage(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });
  const page = await context.newPage();
  await page.goto(url, { timeout: 60000 });

  const content = await page.content();

  const $ = cheerio.load(content);

  // 取得 <title> 標籤的文字
  const titleText = $("title").text(); // 例如：【新北市出租】-591房屋交易網

  // 用正則表達式擷取縣市名稱
  const match = titleText.match(/【(.+?)出租】/);
  const city = match ? match[1] : "未知";

  const items = $(".list-wrapper .item").slice(0, config.fetchCount);

  const results = [];

  items.each((_, el) => {
    const link = $(el).find("a.link").attr("href") || "";
    const title = $(el).find("a.link").text().trim() || "";

    const idMatch = link.match(/(\d+)$/);
    const id = idMatch ? idMatch[1] : "";

    results.push({ id, title, link });
  });

  await browser.close();
  return [city, results];
}

module.exports = crawlOnePage;
