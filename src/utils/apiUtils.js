/**
 * 计算属性：是否启用代理请求
 */
export const shouldEnableProxy = () => {
  const currentUrl = getCurrentUrl();

  // 判断是否匹配 http://localhost 或 https://lm.ok
  return /^https?:\/\/localhost/.test(currentUrl) || /^https?:\/\/lm\.ok/.test(currentUrl);
};

/**
 * 获取当前页面的 URL（适用于 content script 和 background）
 */
const getCurrentUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.href; // 在 content script 中可用
  } else if (chrome && chrome.tabs && chrome.tabs.query) {
    let url = '';
    // 同步获取当前标签页 URL（注意：实际是异步，需配合 Promise 使用）
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) url = tabs[0].url;
    });
    return url;
  }
  return '';
};