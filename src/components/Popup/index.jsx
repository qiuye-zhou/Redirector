import React, { useState, useEffect } from 'react';
import { useApiConfig } from '../../context/ApiConfigContext';
import './styles.css';

const Popup = () => {
  const [status, setStatus] = useState('检查中...');
  const [statusColor, setStatusColor] = useState('#666');
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [buildTime] = useState(new Date().toLocaleString());

  // 从 webpack 注入的环境变量获取版本信息
  const version = process.env.VERSION || '0.1.0';
  const packageName = process.env.PACKAGE_NAME || 'redirector';

  const { addRequest } = useApiConfig();

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

  useEffect(() => {
    // 初始化检查
    getStorageInfo();

    return () => clearInterval(interval);
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

        <div className="build-info">
          <span>构建时间: {buildTime}</span>
        </div>
      </div>
    </div>
  );
};

export default Popup;
