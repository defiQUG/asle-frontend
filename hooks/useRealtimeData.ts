'use client'

import { useState, useEffect } from 'react'
import { wsClient } from '@/lib/websocket'

export function useRealtimeData(type: string) {
  const [data, setData] = useState<any>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const handler = (newData: any) => {
      setData(newData)
    }

    wsClient.subscribe(type, handler)
    setConnected(wsClient.isConnected())

    const checkConnection = setInterval(() => {
      setConnected(wsClient.isConnected())
    }, 1000)

    return () => {
      wsClient.unsubscribe(type, handler)
      clearInterval(checkConnection)
    }
  }, [type])

  return { data, connected }
}

