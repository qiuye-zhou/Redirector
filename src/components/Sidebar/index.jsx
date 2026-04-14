import React from 'react'
import './styles.css'

const Sidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'API', icon: '🔗', label: 'API' },
    { id: '全局', icon: '🌐', label: '全局' },
    { id: '设置', icon: '⚙️', label: '设置' },
  ]

  return (
    <div className="sidebar">
      {tabs.map((tab) => (
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
  )
}

export default Sidebar
