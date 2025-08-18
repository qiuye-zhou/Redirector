import React from 'react';

const Other = ({ activeTab, onTabChange }) => {

  const tabs = [
    { id: '遮挡层', icon: '🔗', label: 'API' },
    { id: '全局', icon: '🌐', label: '全局' },
    { id: '用户', icon: '👤', label: '用户' },
    { id: '设置', icon: '⚙️', label: '设置' }
  ];

  return (
    <div className="other">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="sidebar-icon">{tab.icon}</span>
          <span className="sidebar-label">{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Other;