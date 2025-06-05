const fs = require("fs");
const config = require("../config.json");

function loadHistory() {
  try {
    const raw = JSON.parse(fs.readFileSync("591_data.json", "utf8"));
    const history = [];
    config.urls.forEach((_, index) => {
      history[index] = raw[index] || [];
    });
    return history;
  } catch (error) {
    // 如果讀取失敗（如檔案不存在），回傳每個網址空陣列
    const emptyHistory = [];
    config.urls.forEach((_, index) => {
      emptyHistory[index] = [];
    });
    return emptyHistory;
  }
}

function saveHistory(history) {
  fs.writeFileSync("591_data.json", JSON.stringify(history, null, 2), "utf8");
}

module.exports = { loadHistory, saveHistory };
