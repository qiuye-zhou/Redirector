import { useState, useEffect } from 'react';

export const useApiConfig = () => {
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [savedApis, setSavedApis] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['currentApiUrl', 'apiUrls'], (result) => {
      if (result.currentApiUrl) {
        setCurrentApiUrl(result.currentApiUrl);
      }
      if (result.apiUrls) {
        setSavedApis(result.apiUrls);
      }
    });
  }, []);

  const addApiUrl = (url) => {
    chrome.storage.local.get('apiUrls', (result) => {
      const apiUrls = result.apiUrls || [];
      if (!apiUrls.includes(url)) {
        const newApiUrls = [...apiUrls, url];
        chrome.storage.local.set({ apiUrls: newApiUrls }, () => {
          setSavedApis(newApiUrls);
        });
      }
    });
  };

  const removeApiUrl = (url) => {
    chrome.storage.local.get('apiUrls', (result) => {
      const apiUrls = result.apiUrls || [];
      const newApiUrls = apiUrls.filter(api => api !== url);
      chrome.storage.local.set({ apiUrls: newApiUrls }, () => {
        setSavedApis(newApiUrls);
      });
    });
  };

  const setCurrentApi = (url) => {
    chrome.storage.local.set({ currentApiUrl: url }, () => {
      setCurrentApiUrl(url);
      // 通知background script更新重定向规则
      chrome.runtime.sendMessage({ 
        type: 'UPDATE_API_URL', 
        apiUrl: url 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('通知background script失败:', chrome.runtime.lastError.message);
        } else {
          console.log('API URL已更新，重定向规则已生效:', url);
        }
      });
    });
  };

  return {
    currentApiUrl,
    savedApis,
    requests,
    setRequests,
    addApiUrl,
    removeApiUrl,
    setCurrentApi
  };
};