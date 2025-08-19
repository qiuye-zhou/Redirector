import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../Sidebar';
import RequestList from '../RequestList';
import ApiConfig from '../ApiConfig';
import './styles.css';
import { useApiConfig } from '../../context/ApiConfigContext';

const FloatingWindow = () => {
  const [activeTab, setActiveTab] = useState('API');
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 60,
    y: window.innerHeight - 60,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const floatingButtonRef = useRef(null);
  const { addRequest } = useApiConfig();

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

  // 拖拽处理
  const handleMouseDown = useCallback((e) => {
    if (!floatingButtonRef.current) return;
    
    const rect = floatingButtonRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !floatingButtonRef.current) return;

    const padding = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonEl = floatingButtonRef.current;
    const rect = buttonEl.getBoundingClientRect();

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // 边界限制
    newX = Math.max(padding, Math.min(newX, viewportWidth - rect.width - padding));
    newY = Math.max(padding, Math.min(newY, viewportHeight - rect.height - padding));

    setPosition({ x: newX, y: newY });
    buttonEl.style.left = `${newX}px`;
    buttonEl.style.top = `${newY}px`;
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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

  // 检查是否显示代理功能
  const shouldShowProxy = /^https?:\/\/localhost/.test(window.location.href);

  if (!shouldShowProxy) return null;

  return (
    <>
      <button
        ref={floatingButtonRef}
        className="floating-button"
        onMouseDown={handleMouseDown}
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