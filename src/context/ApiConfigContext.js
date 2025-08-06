// src/context/ApiConfigContext.js
import React, { createContext, useContext, useReducer } from 'react';

// 初始状态
const initialState = {
  requests: [],
};

// reducer 函数
function apiConfigReducer(state, action) {
  switch (action.type) {
    case 'ADD_REQUEST':
      return {
        ...state,
        requests: [action.payload, ...state.requests],
      };
    case 'CLEAR_REQUESTS':
      return {
        ...state,
        requests: [],
      };
    default:
      return state;
  }
}

// 创建 Context
const ApiConfigContext = createContext();

// Provider 组件
const ApiConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(apiConfigReducer, initialState);

  const addRequest = (request) => {
    dispatch({ type: 'ADD_REQUEST', payload: request });
  };

  const clearRequests = () => {
    dispatch({ type: 'CLEAR_REQUESTS' });
  };

  return (
    <ApiConfigContext.Provider
      value={{
        requests: state.requests,
        addRequest,
        clearRequests,
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};

// 自定义 hook，方便在组件中使用
const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig 必须在 ApiConfigProvider 内部使用');
  }
  return context;
};

export { ApiConfigProvider, useApiConfig };