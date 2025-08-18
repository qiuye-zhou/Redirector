// 存储当前API URL的缓存
let currentApiUrlCache = null;

// 初始化时读取API URL
chrome.storage.local.get('currentApiUrl', (result) => {
  currentApiUrlCache = result.currentApiUrl || null;
  updateRedirectRules();
});

// 监听storage变化，更新缓存和规则
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentApiUrl) {
    currentApiUrlCache = changes.currentApiUrl.newValue || null;
    updateRedirectRules();
  }
});

// 使用declarativeNetRequest API更新重定向规则
async function updateRedirectRules() {
  try {
    // 清除现有规则
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);

    if (ruleIdsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
    }

    // 如果有API URL，添加新规则
    if (currentApiUrlCache) {
      const rules = [
        {
          id: 1001,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              regexSubstitution: currentApiUrlCache + "\\1"
            }
          },
          condition: {
            regexFilter: "^https?://localhost[^/]*(.*)",
            resourceTypes: ["xmlhttprequest"]
          }
        },
      ];

      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });

      console.log('[Background] 重定向规则已更新:', currentApiUrlCache);
    } else {
      console.log('[Background] API URL未设置，清除重定向规则');
    }
  } catch (error) {
    console.error('[Background] 更新重定向规则失败:', error);
  }
}

// 监听请求完成事件，用于记录和通知
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // 检查是否是重定向后的请求
    if (currentApiUrlCache && details.url.startsWith(currentApiUrlCache)) {
      // 获取原始URL（从重定向前推导）
      let originalUrl = details.url;

      // 尝试推导原始URL
      if (details.url.startsWith(currentApiUrlCache)) {
        const pathPart = details.url.substring(currentApiUrlCache.length);
        // 假设原始请求是localhost
        originalUrl = 'http://localhost' + pathPart;
      }

      console.log('[Background] 检测到重定向请求完成:', originalUrl, '->', details.url);

      // 通知content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'API_RESPONSE',
            data: { 
              url: originalUrl, 
              redirectedUrl: details.url,
              responseText: { message: '请求已重定向', url: details.url }
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn('[Background] 消息发送失败:', chrome.runtime.lastError.message);
            }
          });
        }
      });
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest"]
  }
);

// 监听请求开始事件，用于调试
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const requestUrl = details.url;
    const shouldProxy = /^https?:\/\/localhost/.test(requestUrl);
    
    if (shouldProxy) {
      console.log('[Background] 检测到需要代理的请求:', details.url);
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest"]
  }
);

// 消息监听
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_API_URL') {
    sendResponse({ currentApiUrl: currentApiUrlCache || '未找到' });
    return true;
  }

  if (message.type === 'UPDATE_API_URL') {
    currentApiUrlCache = message.apiUrl;
    chrome.storage.local.set({ currentApiUrl: message.apiUrl }, () => {
      updateRedirectRules();
      sendResponse({ success: true });
    });
    return true;
  }

  return true;
});

// 安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 插件已安装');
  updateRedirectRules();
});