// 存储当前API URL的缓存
let currentApiUrlCache = null;

// 全局规则ID计数器，确保唯一性
let ruleIdCounter = 1;

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

  // 监听代理配置变化，更新重定向规则
  if (changes.shouldShowProxy) {
    console.log('[Background] 代理配置已更新，重新生成重定向规则');
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

      // 等待规则清除完成
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 如果有API URL，添加新规则
    if (currentApiUrlCache) {
      // 获取代理配置
      const result = await chrome.storage.local.get(['shouldShowProxy']);
      const patterns = result.shouldShowProxy || ['^https?://localhost', '^https?://127\\.0\\.0\\.1'];

      const rules = [];

      // 为每个模式创建重定向规则
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        try {
          // 将模式转换为适合 declarativeNetRequest 的格式
          const regexFilter = pattern.replace(/^\^/, '').replace(/\$$/, '') + '([^/]*(.*))';

          // 使用全局计数器生成唯一ID
          const uniqueId = ruleIdCounter++;

          rules.push({
            id: uniqueId,
            priority: 1,
            action: {
              type: "redirect",
              redirect: {
                regexSubstitution: currentApiUrlCache + "\\2"
              }
            },
            condition: {
              regexFilter: regexFilter,
              resourceTypes: ["xmlhttprequest"]
            }
          });
        } catch (error) {
          console.warn('[Background] 跳过无效的正则表达式模式:', pattern, error);
        }
      }

      if (rules.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: rules
        });

        console.log('[Background] 重定向规则已更新:', currentApiUrlCache, '规则数量:', rules.length);
      } else {
        console.log('[Background] 没有有效的代理模式，无法创建重定向规则');
      }
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

      // 通知content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const message = {
            type: 'API_RESPONSE',
            data: {
              url: originalUrl,
              redirectedUrl: details.url,
              responseText: { message: '请求已重定向', url: details.url }
            }
          };

          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
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
  async (details) => {
    const requestUrl = details.url;

    try {
      const result = await chrome.storage.local.get(['shouldShowProxy']);
      const patterns = result.shouldShowProxy || ['^https?://localhost', '^https?://127\\.0\\.0\\.1'];

      const shouldProxy = patterns.some(pattern => {
        try {
          const regex = new RegExp(pattern);
          return regex.test(requestUrl);
        } catch (error) {
          console.warn('[Background] 无效的正则表达式模式:', pattern);
          return false;
        }
      });

      if (shouldProxy) {
        // 静默处理，不输出日志
      }
    } catch (error) {
      console.error('[Background] 检查代理配置失败:', error);
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