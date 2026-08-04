import React, { useState, useEffect } from 'react'
import { useShouldShowProxy } from '@/hooks/useShouldShowProxy'
import './styles.css'

const Popup = () => {
  const [redirectRuleCount, setRedirectRuleCount] = useState(0)
  const [newPattern, setNewPattern] = useState('')
  const [editingPattern, setEditingPattern] = useState(null)
  const [editValue, setEditValue] = useState('')

  // 从 webpack 注入的环境变量获取版本信息
  const version = process.env.VERSION || '0.1.0'
  const packageName = process.env.PACKAGE_NAME || 'redirector'
  const buildTime = process.env.BUILD_TIME || new Date().toLocaleString()

  const { shouldShowProxy, addShouldShowProxy, removeShouldShowProxy } =
    useShouldShowProxy()

  // 获取重定向规则数量（仅用于展示）
  useEffect(() => {
    const refresh = () => {
      chrome.storage.local.get(['redirectRules'], (result) => {
        const rules = result.redirectRules || []
        setRedirectRuleCount(rules.length)
      })
    }
    refresh()
    chrome.storage.onChanged.addListener(refresh)
    return () => chrome.storage.onChanged.removeListener(refresh)
  }, [])

  // 添加新的正则模式
  const handleAddPattern = () => {
    if (newPattern.trim()) {
      addShouldShowProxy(newPattern.trim())
      setNewPattern('')
    }
  }

  // 删除正则模式
  const handleRemovePattern = (pattern) => {
    removeShouldShowProxy(pattern)
  }

  // 开始编辑模式
  const handleStartEdit = (pattern) => {
    setEditingPattern(pattern)
    setEditValue(pattern)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (editValue.trim() && editingPattern) {
      removeShouldShowProxy(editingPattern)
      addShouldShowProxy(editValue.trim())
      setEditingPattern(null)
      setEditValue('')
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingPattern(null)
    setEditValue('')
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h2>{packageName}</h2>
        <div className="version">v{version}</div>
      </div>

      <div className="popup-content">
        <div className="status-section">
          <div className="status-item">
            <label>已配置重定向规则:</label>
            <span className="info-value">{redirectRuleCount} 条</span>
          </div>
        </div>

        {/* 页面匹配模式配置 */}
        <div className="proxy-config-section">
          <h3>页面启用模式</h3>
          <p className="section-tip">
            匹配以下正则的页面才会显示悬浮窗工具。重定向规则请在页面内悬浮窗中配置。
          </p>
          <div className="pattern-input-group">
            <input
              type="text"
              placeholder="输入正则 (如: ^https?://localhost 或 ^https?://shipinfor\.com)"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="pattern-input"
            />
            <button onClick={handleAddPattern} className="add-pattern-btn">
              添加
            </button>
          </div>

          <div className="patterns-list">
            {shouldShowProxy.map((pattern, index) => (
              <div key={index} className="pattern-item">
                {editingPattern === pattern ? (
                  <div className="pattern-edit">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="pattern-edit-input"
                    />
                    <button onClick={handleSaveEdit} className="save-edit-btn">
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-edit-btn"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="pattern-display">
                    <span className="pattern-text">{pattern}</span>
                    <div className="pattern-actions">
                      <button
                        onClick={() => handleStartEdit(pattern)}
                        className="edit-pattern-btn"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleRemovePattern(pattern)}
                        className="remove-pattern-btn"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="build-info">
          <span>构建时间: {buildTime}</span>
        </div>
      </div>
    </div>
  )
}

export default Popup
