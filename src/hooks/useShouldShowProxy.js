import { useState, useEffect } from 'react'

export const useShouldShowProxy = () => {
    const [shouldShowProxy, setShouldShowProxy] = useState([])

    useEffect(() => {
        chrome.storage.local.get(['shouldShowProxy'], (result) => {
            if (result.shouldShowProxy && Array.isArray(result.shouldShowProxy)) {
                setShouldShowProxy(result.shouldShowProxy)
            } else {
                // 设置默认值
                const defaultPatterns = ['^https?://localhost', '^https?://127\\.0\\.0\\.1']
                setShouldShowProxy(defaultPatterns)
                chrome.storage.local.set({ shouldShowProxy: defaultPatterns })
            }
        })
    }, [])

    const addShouldShowProxy = (Regular) => {
        chrome.storage.local.get('shouldShowProxy', (result) => {
            const shouldShowProxy = result.shouldShowProxy || []
            if (!shouldShowProxy.includes(Regular)) {
                const newShouldShowProxy = [...shouldShowProxy, Regular]
                chrome.storage.local.set({ shouldShowProxy: newShouldShowProxy }, () => {
                    setShouldShowProxy(newShouldShowProxy)
                })
            }
        })
    }

    const removeShouldShowProxy = (Regular) => {
        chrome.storage.local.get('shouldShowProxy', (result) => {
            const shouldShowProxy = result.shouldShowProxy || []
            const newShouldShowProxy = shouldShowProxy.filter(reg => reg !== Regular)
            chrome.storage.local.set({ shouldShowProxy: newShouldShowProxy }, () => {
                setShouldShowProxy(newShouldShowProxy)
            })
        })
    }

    return { shouldShowProxy, addShouldShowProxy, removeShouldShowProxy }
}