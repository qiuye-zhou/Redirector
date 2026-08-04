import { useState, useEffect } from 'react'

// 生成唯一 ID
const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const useRedirectRules = () => {
  const [redirectRules, setRedirectRules] = useState([])

  useEffect(() => {
    chrome.storage.local.get(['redirectRules'], (result) => {
      if (result.redirectRules && Array.isArray(result.redirectRules)) {
        setRedirectRules(result.redirectRules)
      }
    })
  }, [])

  const persist = (rules) => {
    setRedirectRules(rules)
    chrome.storage.local.set({ redirectRules: rules })
  }

  // 新增重定向规则
  const addRedirectRule = (rule) => {
    const newRule = {
      id: genId(),
      name: rule.name || '',
      sourcePattern: rule.sourcePattern,
      targetUrl: rule.targetUrl,
      enabled: rule.enabled !== false,
    }
    chrome.storage.local.get('redirectRules', (result) => {
      const rules = result.redirectRules || []
      persist([...rules, newRule])
    })
  }

  // 删除重定向规则
  const removeRedirectRule = (id) => {
    chrome.storage.local.get('redirectRules', (result) => {
      const rules = result.redirectRules || []
      persist(rules.filter((r) => r.id !== id))
    })
  }

  // 更新重定向规则
  const updateRedirectRule = (id, updates) => {
    chrome.storage.local.get('redirectRules', (result) => {
      const rules = result.redirectRules || []
      persist(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)))
    })
  }

  // 切换启用/禁用
  const toggleRedirectRule = (id) => {
    chrome.storage.local.get('redirectRules', (result) => {
      const rules = result.redirectRules || []
      persist(
        rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
      )
    })
  }

  return {
    redirectRules,
    addRedirectRule,
    removeRedirectRule,
    updateRedirectRule,
    toggleRedirectRule,
  }
}
