// src/context/ApiConfigContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react'

// 初始状态
const initialState = {
  requests: [],
  currentApiUrl: '',
  savedApis: [],
}

// reducer 函数
function apiConfigReducer(state, action) {
  switch (action.type) {
    case 'ADD_REQUEST':
      return {
        ...state,
        requests: [action.payload, ...state.requests],
      }
    case 'CLEAR_REQUESTS':
      return {
        ...state,
        requests: [],
      }
    case 'SET_CURRENT_API_URL':
      return {
        ...state,
        currentApiUrl: action.payload,
      }
    case 'SET_SAVED_APIS':
      return {
        ...state,
        savedApis: action.payload,
      }
    case 'ADD_API_URL':
      return {
        ...state,
        savedApis: [...state.savedApis, action.payload],
      }
    case 'REMOVE_API_URL':
      return {
        ...state,
        savedApis: state.savedApis.filter((api) => api !== action.payload),
      }
    default:
      return state
  }
}

// 创建 Context
const ApiConfigContext = createContext()

// Provider 组件
const ApiConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(apiConfigReducer, initialState)

  // 初始化时从 chrome.storage 读取数据
  useEffect(() => {
    chrome.storage.local.get(['currentApiUrl', 'apiUrls'], (result) => {
      if (result.currentApiUrl) {
        dispatch({
          type: 'SET_CURRENT_API_URL',
          payload: result.currentApiUrl,
        })
      }
      if (result.apiUrls && Array.isArray(result.apiUrls)) {
        dispatch({ type: 'SET_SAVED_APIS', payload: result.apiUrls })
      }
    })
  }, [])

  const addRequest = (request) => {
    dispatch({ type: 'ADD_REQUEST', payload: request })
  }

  const clearRequests = () => {
    dispatch({ type: 'CLEAR_REQUESTS' })
  }

  const setCurrentApi = (url) => {
    chrome.storage.local.set({ currentApiUrl: url }, () => {
      dispatch({ type: 'SET_CURRENT_API_URL', payload: url })
      // 通知background script更新重定向规则
      chrome.runtime.sendMessage(
        {
          type: 'UPDATE_API_URL',
          apiUrl: url,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              '通知background script失败:',
              chrome.runtime.lastError.message,
            )
          } else {
            console.log('API URL已更新，重定向规则已生效:', url)
          }
        },
      )
    })
  }

  const addApiUrl = (url) => {
    chrome.storage.local.get('apiUrls', (result) => {
      const apiUrls = result.apiUrls || []
      if (!apiUrls.includes(url)) {
        const newApiUrls = [...apiUrls, url]
        chrome.storage.local.set({ apiUrls: newApiUrls }, () => {
          dispatch({ type: 'SET_SAVED_APIS', payload: newApiUrls })
        })
      }
    })
  }

  const removeApiUrl = (url) => {
    chrome.storage.local.get('apiUrls', (result) => {
      const apiUrls = result.apiUrls || []
      const newApiUrls = apiUrls.filter((api) => api !== url)
      chrome.storage.local.set({ apiUrls: newApiUrls }, () => {
        dispatch({ type: 'SET_SAVED_APIS', payload: newApiUrls })
      })
    })
  }

  return (
    <ApiConfigContext.Provider
      value={{
        requests: state.requests,
        currentApiUrl: state.currentApiUrl,
        savedApis: state.savedApis,
        addRequest,
        clearRequests,
        setCurrentApi,
        addApiUrl,
        removeApiUrl,
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  )
}

// 自定义 hook，方便在组件中使用
const useApiConfig = () => {
  const context = useContext(ApiConfigContext)
  if (!context) {
    throw new Error('useApiConfig 必须在 ApiConfigProvider 内部使用')
  }
  return context
}

export { ApiConfigProvider, useApiConfig }
