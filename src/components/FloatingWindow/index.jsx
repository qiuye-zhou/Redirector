import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import RequestList from '../RequestList';
import ApiConfig from '../ApiConfig';
import './styles.css';
import { useApiConfig } from '../../context/ApiConfigContext';
const FloatingWindow = () => {
  const [activeTab, setActiveTab] = useState('API');
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 50,
    y: window.innerHeight - 50,
  });
  const [isDragging, setIsDragging] = useState(false);

  const floatingButtonRef = useRef(null);

  const { addRequest } = useApiConfig();

  useEffect(() => {
    // 监听来自 background 的消息
    const onMessage = (message) => {
      if (message.type === 'API_RESPONSE') {
        const { url, responseText } = message.data;
        addRequest({ url, response: { url, responseText } }); // 更新 context 数据
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };

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

  // 处理鼠标按下
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    if (!isDragging || !floatingButtonRef.current) return;

    const padding = 20;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

    const buttonEl = floatingButtonRef.current;
    const rect = buttonEl.getBoundingClientRect();

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    const edgeSize = 100;

    const centerX = newX + rect.width / 2;
    const centerY = newY + rect.height / 2;

    const nearTop = newY <= edgeSize;
    const nearBottom = newY + rect.height >= viewportHeight - edgeSize;
    const nearLeft = newX <= edgeSize;
    const nearRight = newX + rect.width >= viewportWidth - edgeSize;

    // 四个角：单轴移动
    if (
      (nearLeft && nearTop) ||
      (nearRight && nearTop) ||
      (nearLeft && nearBottom) ||
      (nearRight && nearBottom)
    ) {
      const isHorizontalMove = Math.abs(e.clientX - centerX) > Math.abs(e.clientY - centerY);
      if (isHorizontalMove) {
        newY = position.y; // 锁定 Y
      } else {
        newX = position.x; // 锁定 X
      }
    }
    // 上下边：仅允许水平移动
    else if (nearTop || nearBottom) {
      newY = position.y;
    }
    // 左右边：仅允许垂直移动
    else if (nearLeft || nearRight) {
      newX = position.x;
    }

    // 限制边界
    newX = Math.max(padding, Math.min(newX, viewportWidth - rect.width - padding));
    newY = Math.max(padding, Math.min(newY, viewportHeight - rect.height - padding));

    setPosition({ x: newX, y: newY });
  };

  // 处理鼠标松开
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 添加/移除事件监听器
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // 更新按钮样式
  useEffect(() => {
    const buttonEl = floatingButtonRef.current;
    if (!buttonEl) return;

    buttonEl.style.left = `${position.x}px`;
    buttonEl.style.top = `${position.y}px`;
  }, [position]);

  return (
    <div>
      {
        // 检查当前页面是否需要显示代理功能
        /^https?:\/\/localhost/.test(window.location.href) &&
        <div>
          <button
            ref={floatingButtonRef}
            className="floating-button"
            onClick={() => setIsVisible(!isVisible)}
          >
            🔧
          </button>
        </div>
      }


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
    </div>
  );
};

export default FloatingWindow;