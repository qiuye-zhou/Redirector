import React, { useState } from 'react'
import { useRedirectRules } from '@/hooks/useRedirectRules'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Tooltip from 'antd/es/tooltip'
import 'antd/es/button/style'
import 'antd/es/input/style'
import 'antd/es/switch/style'
import 'antd/es/tooltip/style'
import './styles.css'

const ApiConfig = () => {
  const {
    redirectRules,
    addRedirectRule,
    removeRedirectRule,
    toggleRedirectRule,
  } = useRedirectRules()

  const [newName, setNewName] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newTarget, setNewTarget] = useState('')

  const handleAdd = () => {
    if (!newSource.trim() || !newTarget.trim()) {
      return
    }
    addRedirectRule({
      name: newName.trim(),
      sourcePattern: newSource.trim(),
      targetUrl: newTarget.trim(),
      enabled: true,
    })
    setNewName('')
    setNewSource('')
    setNewTarget('')
  }

  return (
    <div className="api-config">
      <div className="api-config-section">
        <h3>重定向规则</h3>
        <div className="rule-form">
          <Input
            placeholder="名称（可选，如：shipinfor→测试服）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rule-input-name"
          />
          <Input
            placeholder="源地址正则（如：^https?://shipinfor\.com）"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            className="rule-input-source"
          />
          <span className="rule-arrow">→</span>
          <Input
            placeholder="目标地址（如：http://139.196.140.28:444）"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="rule-input-target"
          />
          <Button
            type="primary"
            onClick={handleAdd}
            disabled={!newSource.trim() || !newTarget.trim()}
          >
            添加
          </Button>
        </div>
      </div>

      <div className="api-config-section">
        <h3>已配置规则 ({redirectRules.length})</h3>
        {redirectRules.length === 0 ? (
          <div className="empty-tip">暂无重定向规则，请在上方添加</div>
        ) : (
          <div className="rules-list">
            {redirectRules.map((rule) => (
              <div key={rule.id} className="rule-item">
                <div className="rule-item-header">
                  <span className="rule-item-name">
                    {rule.name || '未命名规则'}
                  </span>
                  <div className="rule-item-actions">
                    <Tooltip title={rule.enabled ? '点击禁用' : '点击启用'}>
                      <Switch
                        size="small"
                        checked={rule.enabled}
                        onChange={() => toggleRedirectRule(rule.id)}
                      />
                    </Tooltip>
                    <Button
                      size="small"
                      danger
                      onClick={() => removeRedirectRule(rule.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <div className="rule-item-body">
                  <div className="rule-item-source" title={rule.sourcePattern}>
                    {rule.sourcePattern}
                  </div>
                  <div className="rule-item-arrow">→</div>
                  <div className="rule-item-target" title={rule.targetUrl}>
                    {rule.targetUrl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="api-config-tip">
        <p>提示：</p>
        <ul>
          <li>
            源地址正则：匹配要拦截的请求 URL，如{' '}
            <code>^https?://shipinfor\.com</code>
          </li>
          <li>
            目标地址：重定向目标，只填到端口，如{' '}
            <code>http://139.196.140.28:444</code>，路径会自动保留
          </li>
          <li>
            HTTPS→HTTP 降级：目标地址无路径前缀时自动使用 transform
            方式，支持降级
          </li>
        </ul>
      </div>
    </div>
  )
}

export default ApiConfig
