import React, { useState, useEffect } from 'react';
import { useApiConfig } from '../../hooks/useApiConfig';
import Button from 'antd/es/button';
import Input from 'antd/es/input';
import 'antd/es/button/style';
import 'antd/es/input/style';
import './styles.css';
const ApiConfig = () => {
  const {
    currentApiUrl,
    savedApis,
    addApiUrl,
    removeApiUrl,
    setCurrentApi
  } = useApiConfig();

  const [newApiUrl, setNewApiUrl] = useState('');

  const handleSave = () => {
    if (newApiUrl.trim()) {
      addApiUrl(newApiUrl.trim());
      setCurrentApi(newApiUrl.trim());
      setNewApiUrl('');
    }
  };


  return (
    <div className="api-config">
      <div className="current-api">
        当前API: {currentApiUrl || '未设置'}
      </div>

      <div className="api-input-group flex gap-2 items-center mb-4">
        <Input
          placeholder="输入新的API地址"
          value={newApiUrl}
          onChange={(e) => setNewApiUrl(e.target.value)}
          className='w-300!'
        />
        <Button type="primary" onClick={handleSave} className="px-4">保存</Button>
      </div>

      <div className="saved-apis">
        <h3>已保存的API</h3>
        {savedApis.map(api => (
          <Button className='mr-10' type={api === currentApiUrl ? 'primary' : ''} onClick={() => { setCurrentApi(api) }}>{api}</Button>
        ))}
      </div>

      <div className='font-bold'>Doc</div>
      <div className='flex gap-10'>
        {savedApis.map(api => (
          <div className={api === currentApiUrl ? 'c-#0958d9!' : ''} onClick={() => { setCurrentApi(api) }}>{api}</div>
        ))}
      </div>

    </div>
  );
};

export default ApiConfig;
