import React, { useState, useEffect } from 'react';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useShouldShowProxy } from '../../hooks/useShouldShowProxy';
import './styles.css';

const Popup = () => {
  const [status, setStatus] = useState('检查中...');
  const [statusColor, setStatusColor] = useState('#666');
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [editingPattern, setEditingPattern] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 从 webpack 注入的环境变量获取版本信息
  const version = process.env.VERSION || '0.1.0';
  const packageName = process.env.PACKAGE_NAME || 'redirector';
  const buildTime = process.env.BUILD_TIME || new Date().toLocaleString();

  const { addRequest } = useApiConfig();
  const { shouldShowProxy, addShouldShowProxy, removeShouldShowProxy } = useShouldShowProxy();

  // 获取存储信息
  const getStorageInfo = async () => {
    try {
      const result = await chrome.storage.local.get(['currentApiUrl']);

      if (result.currentApiUrl) {
        setCurrentApiUrl(result.currentApiUrl);
        setStatus(`重定向地址: ${result.currentApiUrl}`);
        setStatusColor('#81c784');
      } else {
        setCurrentApiUrl('');
        setStatus('未设置重定向地址');
        setStatusColor('#e57373');
      }
    } catch (error) {
      console.error('获取存储信息失败:', error);
    }
  };

  // 添加新的正则模式
  const handleAddPattern = () => {
    if (newPattern.trim()) {
      addShouldShowProxy(newPattern.trim());
      setNewPattern('');
    }
  };

  // 删除正则模式
  const handleRemovePattern = (pattern) => {
    removeShouldShowProxy(pattern);
  };

  // 开始编辑模式
  const handleStartEdit = (pattern) => {
    setEditingPattern(pattern);
    setEditValue(pattern);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editValue.trim() && editingPattern) {
      removeShouldShowProxy(editingPattern);
      addShouldShowProxy(editValue.trim());
      setEditingPattern(null);
      setEditValue('');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingPattern(null);
    setEditValue('');
  };

  useEffect(() => {
    // 初始化检查
    getStorageInfo();
  }, []);

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h2>{packageName}</h2>
        <div className="version">v{version}</div>
      </div>

      <div className="popup-content">
        <div className="status-section">
          <div className="status-item">
            <label>状态:</label>
            <span className="status-text" style={{ color: statusColor }}>
              {status}
            </span>
          </div>
        </div>

        <div className="info-section">
          <div className="info-item">
            <label>API 地址:</label>
            <span className="info-value">
              {currentApiUrl || '未设置'}
            </span>
          </div>
        </div>

        {/* 代理配置部分 */}
        <div className="proxy-config-section">
          <h3>代理配置</h3>
          <div className="pattern-input-group">
            <input
              type="text"
              placeholder="输入正则表达式模式 (如: ^https?://localhost)"
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
                    <button onClick={handleCancelEdit} className="cancel-edit-btn">
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="pattern-display">
                    <span className="pattern-text">{pattern}</span>
                    <div className="pattern-actions">
                      <button onClick={() => handleStartEdit(pattern)} className="edit-pattern-btn">
                        编辑
                      </button>
                      <button onClick={() => handleRemovePattern(pattern)} className="remove-pattern-btn">
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
  );
};

export default Popup;
