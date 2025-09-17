import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import './content.css';

// 防止重复初始化
let isInitialized = false

// 初始化 React 组件
function initializeReactApp() {
  if (isInitialized) return

  // 检查是否已经存在容器
  let container = document.getElementById('g-plugin-root')
  if (container) return

  container = document.createElement('div')
  container.id = 'g-plugin-root'
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<App />)

  isInitialized = true
  console.log('[Content] React 应用已初始化')
}

// 初始化函数
function initialize() {
  // 如果已经初始化过，直接返回
  if (isInitialized) return

  // 初始化 React 应用
  initializeReactApp()

  // 获取 API URL
  chrome.runtime.sendMessage({ type: "GET_CURRENT_API_URL" }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[Content] 获取API URL失败:', chrome.runtime.lastError.message)
      return
    }
    if (response && response.currentApiUrl) {
      console.log('[Content] 获取到 currentApiUrl:', response.currentApiUrl)
    }
  })
}

// 监听页面加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'API_RESPONSE') {
    // 发送消息到 React 组件
    window.dispatchEvent(new CustomEvent('g-plugin-request', {
      detail: message.data
    }))
  }

  if (message.type === 'NEW_REQUEST' || message.type === 'REQUEST_COMPLETED') {
    // 发送消息到 React 组件
    window.dispatchEvent(new CustomEvent('g-plugin-request', {
      detail: message.data
    }))
  }

  return true
})