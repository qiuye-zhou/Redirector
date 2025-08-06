import React, { useState, useRef, useCallback } from 'react';
import './styles.css';

const JsonViewer = ({ src, name = 'root', expanded = true, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef(null);

  // 如果是根元素，添加根容器样式
  const isRoot = depth === 0;

  // 复制到剪贴板功能
  const copyToClipboard = useCallback((value) => {
    const textToCopy = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(textToCopy).then(() => {
      // 显示复制成功提示
      const tooltip = document.createElement('div');
      tooltip.className = 'copy-tooltip';
      tooltip.textContent = '已复制!';
      document.body.appendChild(tooltip);
      
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.top - 30}px`;
      }
      
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 1000);
    });
  }, []);

  // 右键菜单处理
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    copyToClipboard(src);
  }, [src, copyToClipboard]);

  // 键盘事件处理
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      copyToClipboard(src);
    }
  }, [isExpanded, src, copyToClipboard]);

  // 获取数据类型图标
  const getTypeIcon = (value) => {
    if (value === null) return '∅';
    if (value === undefined) return '?';
    if (typeof value === 'string') return '"';
    if (typeof value === 'number') return '#';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (Array.isArray(value)) return '[]';
    if (typeof value === 'object') return '{}';
    return '•';
  };

  if (src === null) return (
    <span 
      className="json-null"
      ref={elementRef}
      onContextMenu={handleContextMenu}
      title="右键复制"
    >
      <span className="type-icon">∅</span> null
    </span>
  );
  
  if (src === undefined) return (
    <span 
      className="json-undefined"
      ref={elementRef}
      onContextMenu={handleContextMenu}
      title="右键复制"
    >
      <span className="type-icon">?</span> undefined
    </span>
  );
  
  if (typeof src === 'string') {
    return (
      <span 
        className="json-string"
        ref={elementRef}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`字符串 (${src.length} 字符) - 右键复制`}
      >
        <span className="type-icon">"</span>"{src}"
        {isHovered && <span className="copy-hint">📋</span>}
      </span>
    );
  }
  
  if (typeof src === 'number') {
    return (
      <span 
        className="json-number"
        ref={elementRef}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="数字 - 右键复制"
      >
        <span className="type-icon">#</span>{src}
        {isHovered && <span className="copy-hint">📋</span>}
      </span>
    );
  }
  
  if (typeof src === 'boolean') {
    return (
      <span 
        className="json-boolean"
        ref={elementRef}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="布尔值 - 右键复制"
      >
        <span className="type-icon">{src ? '✓' : '✗'}</span>{src.toString()}
        {isHovered && <span className="copy-hint">📋</span>}
      </span>
    );
  }

  if (Array.isArray(src)) {
    if (src.length === 0) return (
      <span 
        className="json-empty"
        ref={elementRef}
        onContextMenu={handleContextMenu}
        title="空数组 - 右键复制"
      >
        <span className="type-icon">[]</span>[]
      </span>
    );
    
    const content = (
      <div className="json-container">
        <span 
          className="json-toggle" 
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? '折叠' : '展开'}数组`}
          ref={elementRef}
          onContextMenu={handleContextMenu}
          title={`数组 (${src.length} 项) - 点击展开/折叠, 右键复制`}
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="type-icon">[]</span>
          <span className="item-count">[{src.length}]</span>
          <span className="copy-hint-toggle">📋</span>
        </span>
        {isExpanded && (
          <div className="json-content json-content-animated" style={{ marginLeft: `${depth * 20}px` }}>
            {src.map((item, index) => (
              <div key={index} className="json-item">
                <span className="json-key">
                  <span className="array-index">[{index}]</span>: 
                </span>
                <JsonViewer 
                  src={item} 
                  name={index.toString()} 
                  expanded={depth < 2} 
                  depth={depth + 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return isRoot ? <div className="json-viewer-root">{content}</div> : content;
  }

  if (typeof src === 'object') {
    const keys = Object.keys(src);
    if (keys.length === 0) return (
      <span 
        className="json-empty"
        ref={elementRef}
        onContextMenu={handleContextMenu}
        title="空对象 - 右键复制"
      >
        <span className="type-icon">{}</span>{}
      </span>
    );
    
    const content = (
      <div className="json-container">
        <span 
          className="json-toggle" 
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? '折叠' : '展开'}对象`}
          ref={elementRef}
          onContextMenu={handleContextMenu}
          title={`对象 (${keys.length} 属性) - 点击展开/折叠, 右键复制`}
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="type-icon">{}</span>
          <span className="object-name">{name}</span>
          <span className="item-count">({keys.length})</span>
          <span className="copy-hint-toggle">📋</span>
        </span>
        {isExpanded && (
          <div className="json-content json-content-animated" style={{ marginLeft: `${depth * 20}px` }}>
            {keys.map(key => (
              <div key={key} className="json-item">
                <span className="json-key">
                  <span className="object-key">{key}</span>: 
                </span>
                <JsonViewer 
                  src={src[key]} 
                  name={key} 
                  expanded={depth < 2} 
                  depth={depth + 1}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return isRoot ? <div className="json-viewer-root">{content}</div> : content;
  }

  return (
    <span 
      ref={elementRef}
      onContextMenu={handleContextMenu}
      title="右键复制"
    >
      {src}
    </span>
  );
};

export default JsonViewer; 