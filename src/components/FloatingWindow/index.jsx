import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import RequestList from '../RequestList';
import ApiConfig from '../ApiConfig';
import './styles.css';
import { useApiConfig } from '../../context/ApiConfigContext';
import { useShouldShowProxy } from '../../hooks/useShouldShowProxy';

const FloatingWindow = () => {
  const [activeTab, setActiveTab] = useState('API');
  const [isVisible, setIsVisible] = useState(false);

  const floatingButtonRef = useRef(null);
  const { addRequest } = useApiConfig();
  const { shouldShowProxy } = useShouldShowProxy();

  // 监听来自 background 的消息
  useEffect(() => {
    const onMessage = (message) => {
      if (message.type === 'API_RESPONSE') {
        const { url, responseText } = message.data;
        addRequest({ url, response: { url, responseText } });
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [addRequest]);

  const renderContent = () => {
    switch (activeTab) {
      case 'API':
        return <ApiConfig />;
      case '全局':
        return <RequestList />;
      case '用户':
        return <div>用户配置页面</div>;
      case '设置':
        return <div>设置页面</div>;
      default:
        return null;
    }
  };

  // 检查是否显示代理功能 - 使用从 hook 获取的状态
  const isShouldShowProxy = shouldShowProxy.some(pattern => {
    try {
      const regex = new RegExp(pattern);
      return regex.test(window.location.href);
    } catch (error) {
      console.warn('Invalid regex pattern:', pattern);
      return false;
    }
  });

  if (!isShouldShowProxy) return null;

  return (
    <>
      <button
        ref={floatingButtonRef}
        className="floating-button"
        onClick={() => setIsVisible(!isVisible)}
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
  );
};

export default FloatingWindow;