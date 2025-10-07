import React, { useState } from 'react'
import JsonViewer from '../JsonViewer'
import { useApiConfig } from '@/context/ApiConfigContext'
import './styles.css'

const RequestList = () => {
  const { requests } = useApiConfig()

  const [isShow, setShow] = useState(false)
  const [curRequest, setCurRequest] = useState({})

  return (
    <div className="request-list pos-relative">
      <div className="request-list-body">
        {requests.length === 0 ? (
          <div className="empty-message">暂无请求</div>
        ) : (
          <div className="ml-10">
            {requests.map((request, index) => (
              <div
                key={index}
                onClick={() => {
                  setShow(true)
                  setCurRequest(request.response)
                }}
                className="p-5 cp"
              >
                <div>{request.url}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isShow && (
        <div className="pos-absolute top-0 right-0 w-90! h-full  bg-white">
          <div
            className="pos-absolute top-0 right-0 w-30 h-30"
            onClick={() => setShow(false)}
          >
            ×
          </div>
          <div className="p-5">{curRequest.url}</div>
          <JsonViewer src={curRequest} />
        </div>
      )}
    </div>
  )
}

export default RequestList
