import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../Sidebar'
import RequestList from '../RequestList'
import ApiConfig from '../ApiConfig'
import './styles.css'
import { useApiConfig } from '@/context/ApiConfigContext'
import { useShouldShowProxy } from '@/hooks/useShouldShowProxy'

const FloatingWindow = () => {
  const [activeTab, setActiveTab] = useState('API')
  const [isVisible, setIsVisible] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isButtonHidden, setIsButtonHidden] = useState(false)

  const floatingButtonRef = useRef(null)
  const hideTimerRef = useRef(null)
  const { addRequest } = useApiConfig()
  const { shouldShowProxy } = useShouldShowProxy()

  // 监听来自 background 的消息
  useEffect(() => {
    const onMessage = (message) => {
      if (message.type === 'API_RESPONSE') {
        const { url, responseText } = message.data
        addRequest({ url, response: { url, responseText } })
      }
    }

    chrome.runtime.onMessage.addListener(onMessage)
    return () => chrome.runtime.onMessage.removeListener(onMessage)
  }, [addRequest])

  // 按钮自动隐藏逻辑
  useEffect(() => {
    // 清除之前的定时器
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }

    if (!isVisible && !isButtonHovered) {
      // 设置新的定时器，3秒后隐藏按钮
      hideTimerRef.current = setTimeout(() => {
        setIsButtonHidden(true)
      }, 3000)
    } else if (isButtonHovered && isButtonHidden) {
      // 鼠标悬停时立即显示按钮
      setIsButtonHidden(false)
    }

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [isVisible, isButtonHovered, isButtonHidden])

  const renderContent = () => {
    switch (activeTab) {
      case 'API':
        return <ApiConfig />
      case '全局':
        return <RequestList />
      case '设置':
        return <div>其他功能待完善~</div>
      default:
        return null
    }
  }

  // 检查是否显示代理功能 - 使用从 hook 获取的状态
  const isShouldShowProxy = shouldShowProxy.some(pattern => {
    try {
      const regex = new RegExp(pattern)
      return regex.test(window.location.href)
    } catch (error) {
      console.warn('Invalid regex pattern:', pattern)
      return false
    }
  })

  if (!isShouldShowProxy) return null

  return (
    <>
      <button
        ref={floatingButtonRef}
        className={`floating-button ${isButtonHidden ? 'hidden' : ''}`}
        onClick={() => {
          setIsVisible(!isVisible)
          if (!isVisible) {
            setIsButtonHidden(false) // 打开窗口时显示按钮
          }
        }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        🔧
      </button>

      {isVisible && (
        <div className="floating-window">
          <div className="window-header">
            <h3>接口配置</h3>
            <button className="close-button" onClick={() => setIsVisible(false)}>
              ×
            </button>
          </div>
          <div className="window-body">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="main-content">{renderContent()}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingWindow