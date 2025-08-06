// 添加立即执行的调试代码
console.log('[Popup] 初始化开始 -', new Date().toISOString());

// 建立持久连接
const port = chrome.runtime.connect({name: 'popup'});

document.addEventListener('DOMContentLoaded', () => {
  // console.log('[Popup] 加载完成，版本:', EXTENSION_VERSION);
  
  // 发送测试消息
  chrome.runtime.sendMessage({ type: 'TEST' }, response => {
    const status = document.getElementById('status');
    if (response && response.status === 'ok') {
      status.textContent = `正常运行中 (v1)`;
      status.style.color = '#4caf50';
    } else {
      status.textContent = '未运行';
      status.style.color = '#f44336';
    }
  });

  // 显示构建时间
  const buildTime = document.getElementById('build-time');
  buildTime.textContent = new Date().toLocaleString();

  // 更新状态指示器
  const statusDot = document.getElementById('status-dot');
  
  // 定期检查 Service Worker 状态
  function checkServiceWorker() {
    chrome.runtime.sendMessage({
      type: 'STATUS_CHECK',
      time: new Date().toISOString()
    }, response => {
      console.log('[G Plugin Popup] Service Worker 响应:', response);
      
      const statusElement = document.getElementById('sw-status');
      if (response && response.status === 'alive') {
        statusElement.textContent = '运行中 (#' + response.heartbeatCount + ')';
        statusElement.style.color = '#4caf50';
        statusDot.className = 'status-indicator status-running';
      } else {
        statusElement.textContent = '未运行';
        statusElement.style.color = '#f44336';
        statusDot.className = 'status-indicator status-stopped';
      }
    });
  }

  // 立即检查一次
  checkServiceWorker();

  // 每5秒检查一次
  setInterval(checkServiceWorker, 5000);

  // 显示存储信息
  chrome.storage.local.get(['currentApiUrl', 'requestCount', 'lastUpdate'], function(result) {
    // 显示 API 地址
    const status = document.getElementById('status');
    status.textContent = result.currentApiUrl ? 
      '当前API地址: ' + result.currentApiUrl : 
      '未设置API地址';

    // 显示请求计数
    document.getElementById('request-count').textContent = result.requestCount || 0;

    // 显示最后更新时间
    document.getElementById('last-update').textContent = 
      result.lastUpdate ? new Date(result.lastUpdate).toLocaleString() : '-';
  });
}); 