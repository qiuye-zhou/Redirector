// 缓存当前的重定向规则配置
let redirectRulesCache = []

// 初始化时读取重定向规则
chrome.storage.local.get(['redirectRules'], (result) => {
  redirectRulesCache = result.redirectRules || []
  updateRedirectRules()
})

// 监听 storage 变化，更新规则
chrome.storage.onChanged.addListener((changes) => {
  if (changes.redirectRules) {
    redirectRulesCache = changes.redirectRules.newValue || []
    console.log('[Background] 重定向规则配置已更新，重新生成规则')
    updateRedirectRules()
  }
})

// 从源模式中提取路径部分（用于判断源/目标路径是否相同）
// 例如 '^https?://shipinfor\.com/xzh/api/' -> '/xzh/api'
// 如果不是简单的 URL 模式，返回 null
function extractPathFromPattern(pattern) {
  let p = pattern
  if (p.startsWith('^')) {
    p = p.substring(1)
  }
  if (p.endsWith('$')) {
    p = p.substring(0, p.length - 1)
  }
  const m = p.match(/^https?:\/\/[^/]+(\/.*)?$/)
  if (!m) {
    return null
  }
  return m[1] ? m[1].replace(/\/$/, '') : ''
}

// 根据一条重定向规则配置，构建 declarativeNetRequest 规则
// 返回 null 表示构建失败
function buildDnrRule(rule, dnrId) {
  try {
    const { sourcePattern, targetUrl } = rule

    // 清理源模式（去除首尾的 ^ 和 $）
    let cleanPattern = sourcePattern
    if (cleanPattern.startsWith('^')) {
      cleanPattern = cleanPattern.substring(1)
    }
    if (cleanPattern.endsWith('$')) {
      cleanPattern = cleanPattern.substring(0, cleanPattern.length - 1)
    }

    const regexFilter = `${cleanPattern}(/.*)?`

    // 测试正则是否合法
    new RegExp(regexFilter)

    // 解析目标 URL，决定使用 transform 还是 regexSubstitution
    // transform 方式支持 HTTPS -> HTTP 降级（regexSubstitution 不支持）
    let targetUrlObj = null
    let targetPathPrefix = ''
    try {
      targetUrlObj = new URL(targetUrl)
      targetPathPrefix =
        targetUrlObj.pathname === '/'
          ? ''
          : targetUrlObj.pathname.replace(/\/$/, '')
    } catch (e) {
      console.error('[Background] 目标 URL 解析失败:', targetUrl, e)
      return null
    }

    // 检测源模式中的路径是否与目标路径相同（若是，则只需改 scheme/host/port）
    const sourcePathPrefix = extractPathFromPattern(sourcePattern)
    const pathsMatch =
      sourcePathPrefix !== null && sourcePathPrefix === targetPathPrefix

    if (targetUrlObj && (!targetPathPrefix || pathsMatch)) {
      // 目标无路径前缀，或源/目标路径相同：
      // 使用 transform 改变 scheme/host/port，保留原始路径与查询
      // 此方式支持 HTTPS -> HTTP 降级
      const transform = {}
      if (targetUrlObj.protocol === 'http:') {
        transform.scheme = 'http'
      } else if (targetUrlObj.protocol === 'https:') {
        transform.scheme = 'https'
      }
      transform.host = targetUrlObj.hostname
      if (targetUrlObj.port) {
        transform.port = targetUrlObj.port
      } else {
        // 目标无显式端口（默认端口）：必须显式清空，否则会保留原始请求的端口
        transform.port = ''
      }

      console.log(
        `[Background] 准备规则 ID:${dnrId} (transform): ${regexFilter} -> scheme=${transform.scheme}, host=${transform.host}, port=${transform.port || '(默认/清空)'}` +
          (pathsMatch ? ' (源/目标路径相同，自动用 transform)' : ''),
      )

      return {
        id: dnrId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { transform },
        },
        condition: {
          regexFilter: regexFilter,
          resourceTypes: ['xmlhttprequest'],
        },
      }
    } else {
      // 目标有路径前缀且与源不同：使用 regexSubstitution 拼接路径
      // 注意：此方式可能不支持 HTTPS -> HTTP 降级
      // 修复路径拼接：若源模式以 / 结尾，用 (.*) 捕获剩余（无前导 /）；
      // 否则用 (/.*)? 捕获路径（含前导 /）。同时不剥离目标末尾的 /。
      const endsWithSlash = cleanPattern.endsWith('/')
      const capture = endsWithSlash ? '(.*)' : '(/.*)?'
      const regexFilterSub = `${cleanPattern}${capture}`

      // 路径拼接逻辑：
      // - 若源模式以 / 结尾（capture = (.*)，无前导 /），目标末尾需保留 /
      // - 否则（capture = (/.*)?，含前导 /），目标末尾需剥掉 /，避免双 /
      let substitutionBase = `${targetUrlObj.protocol}//${targetUrlObj.hostname}`
      if (targetUrlObj.port) {
        substitutionBase += `:${targetUrlObj.port}`
      }
      if (endsWithSlash) {
        substitutionBase += targetUrlObj.pathname
      } else {
        substitutionBase += targetUrlObj.pathname.replace(/\/$/, '')
      }

      console.log(
        `[Background] 准备规则 ID:${dnrId} (regexSubstitution): ${regexFilterSub} -> ${substitutionBase}\\1`,
      )

      return {
        id: dnrId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution: `${substitutionBase}\\1`,
          },
        },
        condition: {
          regexFilter: regexFilterSub,
          resourceTypes: ['xmlhttprequest'],
        },
      }
    }
  } catch (error) {
    console.error('[Background] 构建规则失败，跳过:', rule, error)
    return null
  }
}

// 使用 declarativeNetRequest API 更新重定向规则
async function updateRedirectRules() {
  try {
    console.log('[Background] 开始更新重定向规则...', redirectRulesCache)

    // 获取所有现有的动态规则并移除
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const ruleIdsToRemove = existingRules.map((rule) => rule.id)

    if (ruleIdsToRemove.length > 0) {
      console.log('[Background] 清除旧规则 IDs:', ruleIdsToRemove)
    }

    // 只处理启用的规则
    const enabledRules = redirectRulesCache.filter((r) => r.enabled)

    if (enabledRules.length === 0 && ruleIdsToRemove.length === 0) {
      console.log('[Background] 无变化，跳过更新')
      return
    }

    const updateOptions = {
      removeRuleIds: ruleIdsToRemove,
      addRules: [],
    }

    const newRules = []
    let currentId = 1

    for (const rule of enabledRules) {
      const dnrRule = buildDnrRule(rule, currentId)
      if (dnrRule) {
        newRules.push(dnrRule)
        currentId++
      }
    }

    if (newRules.length > 0) {
      updateOptions.addRules = newRules
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
      console.log('[Background] 当前生效的规则详情:', verifyRules)
    } else {
      console.log('[Background] 没有规则需要更新')
    }
  } catch (error) {
    console.error('[Background] ❌ 更新重定向规则发生严重错误:', error)
  }
}

// 判断一个 URL 是否是某个重定向规则的目标（用于请求记录）
function findMatchingRedirectRule(url) {
  for (const rule of redirectRulesCache) {
    if (!rule.enabled) {
      continue
    }
    try {
      let baseTarget = rule.targetUrl
      if (baseTarget.endsWith('/')) {
        baseTarget = baseTarget.slice(0, -1)
      }
      if (url.startsWith(baseTarget)) {
        return rule
      }
    } catch (e) {
      // ignore
    }
  }
  return null
}

// 监听请求完成事件，用于记录和通知
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    // 检查是否命中了某条重定向规则的目标
    const matchedRule = findMatchingRedirectRule(details.url)
    if (!matchedRule) {
      return
    }

    // 尝试还原原始 URL
    let baseTarget = matchedRule.targetUrl
    if (baseTarget.endsWith('/')) {
      baseTarget = baseTarget.slice(0, -1)
    }
    const pathPart = details.url.substring(baseTarget.length)

    // 从源模式提取原始 host
    let originalHost = 'localhost'
    try {
      const cleanPattern = matchedRule.sourcePattern
        .replace(/^\^/, '')
        .replace(/\$$/, '')
      const match = cleanPattern.match(/\/\/([^/]+)/)
      if (match) {
        originalHost = match[1]
      }
    } catch (e) {
      // ignore
    }

    const originalUrl = `${matchedRule.targetUrl.startsWith('https') ? 'https' : 'http'}://${originalHost}${pathPart}`

    // 构建消息数据
    const messageData = {
      type: 'API_RESPONSE',
      data: {
        url: originalUrl,
        redirectedUrl: details.url,
        timestamp: Date.now(),
        status: details.statusCode,
        method: details.method,
      },
    }

    // 发送消息
    if (details.tabId && details.tabId !== -1) {
      chrome.tabs.sendMessage(details.tabId, messageData, () => {
        if (chrome.runtime.lastError) {
          // 忽略常见错误：tab 已关闭、接收端未连接等
        }
      })
    } else {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, messageData, () => {
              if (chrome.runtime.lastError) {
              }
            })
          }
        })
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
  if (message.type === 'GET_REDIRECT_RULES') {
    sendResponse({ redirectRules: redirectRulesCache })
    return true
  }

  return true
})

// 安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 插件已安装')
  updateRedirectRules()
})
