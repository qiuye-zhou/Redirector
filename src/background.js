// 存储当前API URL的缓存
let currentApiUrlCache = null

// 初始化时读取API URL
chrome.storage.local.get(['currentApiUrl', 'shouldShowProxy'], (result) => {
  currentApiUrlCache = result.currentApiUrl || null
  updateRedirectRules()
})

// 监听storage变化，更新缓存和规则
chrome.storage.onChanged.addListener((changes) => {
  if (changes.currentApiUrl) {
    currentApiUrlCache = changes.currentApiUrl.newValue || null
    updateRedirectRules()
  }

  if (changes.shouldShowProxy) {
    console.log('[Background] 代理配置已更新，重新生成重定向规则')
    updateRedirectRules()
  }
})

// 使用declarativeNetRequest API更新重定向规则
async function updateRedirectRules() {
  try {
    console.log('[Background] 开始更新重定向规则...', currentApiUrlCache)

    // 获取所有现有的动态规则并移除
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const ruleIdsToRemove = existingRules.map((rule) => rule.id)

    if (ruleIdsToRemove.length > 0) {
      console.log('[Background] 清除旧规则 IDs:', ruleIdsToRemove)
    }

    // 如果没有要移除的且没有新的要添加，直接返回
    if (!currentApiUrlCache && ruleIdsToRemove.length === 0) {
      console.log('[Background] 无变化，跳过更新')
      return
    }

    const updateOptions = {
      removeRuleIds: ruleIdsToRemove,
      addRules: [],
    }

    // 如果有API URL，构建新规则
    if (currentApiUrlCache) {
      const result = await chrome.storage.local.get(['shouldShowProxy'])
      const patterns = result.shouldShowProxy || [
        '^https?://localhost',
        '^https?://127\\.0\\.0\\.1',
      ]

      const newRules = []

      let currentId = 1

      for (const pattern of patterns) {
        try {
          // 清理 Pattern
          let cleanPattern = pattern
          if (cleanPattern.startsWith('^')) {
            cleanPattern = cleanPattern.substring(1)
          }
          if (cleanPattern.endsWith('$')) {
            cleanPattern = cleanPattern.substring(0, cleanPattern.length - 1)
          }

          // 构建 Regex Filter
          const regexFilter = `${cleanPattern}(/.*)?`

          // 测试正则是否合法
          new RegExp(regexFilter)

          // 构建 Substitution
          let targetUrl = currentApiUrlCache
          if (targetUrl.endsWith('/')) {
            targetUrl = targetUrl.slice(0, -1)
          }

          newRules.push({
            id: currentId,
            priority: 1,
            action: {
              type: 'redirect',
              redirect: {
                regexSubstitution: `${targetUrl}\\1`,
              },
            },
            condition: {
              regexFilter: regexFilter,
              resourceTypes: ['xmlhttprequest'],
            },
          })

          console.log(
            `[Background] 准备规则 ID:${currentId}: ${regexFilter} -> ${targetUrl}\\1`,
          )

          currentId++ // 递增 ID
        } catch (error) {
          console.error('[Background] 构建规则失败，跳过模式:', pattern, error)
        }
      }

      if (newRules.length > 0) {
        updateOptions.addRules = newRules
      }
    }

    // 执行更新
    if (
      updateOptions.removeRuleIds.length > 0 ||
      updateOptions.addRules.length > 0
    ) {
      await chrome.declarativeNetRequest.updateDynamicRules(updateOptions)
      console.log(
        '[Background] ✅ 重定向规则已更新。移除:',
        updateOptions.removeRuleIds.length,
        '添加:',
        updateOptions.addRules.length,
      )

      // 验证规则是否真正生效
      const verifyRules = await chrome.declarativeNetRequest.getDynamicRules()
      console.log('[Background] 当前生效的规则数量:', verifyRules.length)
    } else {
      console.log('[Background] 没有规则需要更新')
    }
  } catch (error) {
    console.error('[Background] ❌ 更新重定向规则发生严重错误:', error)
  }
}

// 监听请求完成事件，用于记录和通知
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (currentApiUrlCache && details.url.startsWith(currentApiUrlCache)) {
      // 尝试推导原始 URL (这里依然保持你原有的简单逻辑，但要知道它可能不准确)
      const pathPart = details.url.substring(currentApiUrlCache.length)
      // 更好的方式是检查匹配了哪个 pattern，但这里简化处理
      const originalUrl = `http://localhost${pathPart}`

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: 'API_RESPONSE',
              data: {
                url: originalUrl,
                redirectedUrl: details.url,
                responseText: { message: '请求已重定向', url: details.url },
              },
            },
            () => {
              if (chrome.runtime.lastError) {
                // 忽略错误，通常是因为 tab 刷新或关闭
              }
            },
          )
        }
      })
    }
  },
  {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest'],
  },
)

// 消息监听
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_API_URL') {
    sendResponse({ currentApiUrl: currentApiUrlCache || '未找到' })
    return true
  }

  if (message.type === 'UPDATE_API_URL') {
    currentApiUrlCache = message.apiUrl
    // 先更新 storage，触发 onChanged 监听器去更新规则，或者直接在这里调用
    chrome.storage.local.set({ currentApiUrl: message.apiUrl }, () => {
      updateRedirectRules()
      sendResponse({ success: true })
    })
    return true
  }

  return true
})

// 安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 插件已安装')
  updateRedirectRules()
})
