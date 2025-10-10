const config = require("./config.json");
const crawlOnePage = require("./crawler/crawlOnePage");
const { loadHistory, saveHistory } = require("./utils/history");
const { sendDiscordNotification } = require("./utils/notify");

const intervalMs = config.intervalMinutes * 60 * 1000;

async function checkForNewListings() {
  const history = loadHistory();
  // 使用 for...of 迴圈可以讓程式碼更簡潔，並直接取得索引
  for (const [i, url] of config.urls.entries()) {
    const now = new Date().toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
    });

    try {
      const [city, data] = await crawlOnePage(url);

      // 將上一次獲取的物件連結放到一個 Set 中，查詢效能比 Array.includes() 更好
      const oldLinks = new Set(history[i]?.map((item) => item.link) || []);

      // 將新資料與舊資料比對，找出剛出現的新物件
      const newItems = data.filter((item) => !oldLinks.has(item.link));

      if (newItems.length > 0) {
        // 沒有舊物件的紀錄，表示此 url 為新加入的搜尋條件或首次執行
        // 我們將所有新抓到的資料存入歷史紀錄，但不發通知
        if (oldLinks.size === 0) {
          console.log(`[${now}] ${city} 首次運行，建立 ${data.length} 筆房源基準資料。`);
          history[i] = data; // 將首次抓取的資料作為基礎
          continue; // 繼續下一個 URL 的處理
        }

        // 如果有歷史紀錄，表示真的有新物件出現
        console.log(`[${now}] ${city} 新增 ${newItems.length} 筆新房源`);
        await sendDiscordNotification(newItems, city);

        // *** 【核心修改】 ***
        // 將新物件(newItems)添加到對應的歷史紀錄中，而不是覆蓋
        history[i].push(...newItems);

      } else {
        console.log(`[${now}] ${city} 沒有新資料`);
      }

    } catch (error) {
      console.error(`[${now}] 處理 ${url} 時發生錯誤:`, error);
      // 即使單一 URL 抓取失敗，也應該繼續處理下一個，所以這裡不中斷迴圈
    }
  }

  // 在所有 URL 都檢查完畢後，將累積了新資料的 history 儲存起來
  saveHistory(history);
  console.log("所有 URL 檢查完畢，已儲存最新歷史紀錄。");
}

// 立即執行一次檢查
checkForNewListings();
// 設定定時器，定期執行
// setInterval(checkForNewListings, intervalMs);
