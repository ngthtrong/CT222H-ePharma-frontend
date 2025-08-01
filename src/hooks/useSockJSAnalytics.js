import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Alternative WebSocket hook using SockJS/STOMP (as preferred in backend guides)
 * This hook provides a ready-to-use implementation for SockJS/STOMP
 * 
 * To use this hook, you need to install the required packages:
 * npm install sockjs-client @stomp/stompjs
 * 
 * Then uncomment the implementation below and use this hook instead of useWebSocketAnalytics
 */
export const useSockJSAnalytics = (url = 'http://localhost:8081/ws') => {
  const [connected, setConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [error, setError] = useState(null);
  
  const stompClient = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const connect = useCallback(() => {
    try {
      // Note: This implementation requires sockjs-client and @stomp/stompjs packages
      // Uncomment the following code after installing the packages:
      
      /*
      // Import required libraries (add these imports at the top of the file)
      // import SockJS from 'sockjs-client';
      // import { Stomp } from '@stomp/stompjs';
      
      const socket = new SockJS(url);
      const client = Stomp.over(socket);
      
      // Disable debug logs in production
      client.debug = (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(str);
        }
      };
      
      client.connect({}, (frame) => {
        console.log('SockJS/STOMP Connected: ' + frame);
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Subscribe to real-time metrics as per ADVANCED-ANALYTICS-API-GUIDE.md
        client.subscribe('/topic/realtime-metrics', (message) => {
          const data = JSON.parse(message.body);
          setRealTimeData(prevData => ({ 
            ...prevData, 
            ...data,
            timestamp: data.timestamp || Date.now()
          }));
        });
        
        // Subscribe to order updates
        client.subscribe('/topic/order-updates', (message) => {
          const update = JSON.parse(message.body);
          setRealTimeData(prevData => ({ 
            ...prevData, 
            orderUpdate: update.data,
            lastOrderUpdate: update.timestamp || Date.now()
          }));
        });
        
        // Subscribe to revenue updates
        client.subscribe('/topic/revenue-updates', (message) => {
          const data = JSON.parse(message.body);
          setRealTimeData(prevData => ({ 
            ...prevData, 
            revenue: data.revenue,
            revenueUpdate: data.timestamp || Date.now()
          }));
        });
        
        // Subscribe to active users count
        client.subscribe('/topic/active-users', (message) => {
          const data = JSON.parse(message.body);
          setRealTimeData(prevData => ({ 
            ...prevData, 
            activeUsersOnline: data.count,
            activeUsersUpdate: data.timestamp || Date.now()
          }));
        });
        
      }, (error) => {
        console.error('STOMP error:', error);
        setError('SockJS/STOMP connection failed: ' + error);
        setConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimer.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setError('Failed to reconnect after maximum attempts');
        }
      });
      
      stompClient.current = client;
      */
      
      // Placeholder implementation when packages are not installed
      console.warn('SockJS/STOMP implementation requires additional packages.');
      console.info('Please install: npm install sockjs-client @stomp/stompjs');
      console.info('Then uncomment the implementation in useSockJSAnalytics.js');
      
      setError('SockJS/STOMP requires sockjs-client and @stomp/stompjs packages. Using fallback mode.');
      
      // Simulate connection for development
      setTimeout(() => {
        setConnected(false); // Keep as false since it's not really connected
        setError('Install SockJS packages to use real-time features');
      }, 1000);
      
    } catch (connectionError) {
      console.error('Error creating SockJS connection:', connectionError);
      setError('Failed to create SockJS connection: ' + connectionError.message);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {
        console.log('SockJS/STOMP disconnected');
        setConnected(false);
        setRealTimeData(null);
        setError(null);
      });
    } else {
      setConnected(false);
      setRealTimeData(null);
      setError(null);
    }
    
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((destination, message) => {
    if (stompClient.current && stompClient.current.connected) {
      try {
        stompClient.current.send(destination, {}, JSON.stringify(message));
      } catch (sendError) {
        console.error('Error sending STOMP message:', sendError);
        setError('Failed to send message: ' + sendError.message);
      }
    } else {
      console.warn('STOMP client not connected, cannot send message');
    }
  }, []);

  // Auto-connect when hook is used
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    realTimeData,
    error,
    connect,
    disconnect,
    sendMessage
  };
};

// Example usage instructions:
/*
1. Install required packages:
   npm install sockjs-client @stomp/stompjs

2. Uncomment the implementation in this file

3. Use in your component:
   import { useSockJSAnalytics } from '../../hooks/useSockJSAnalytics';
   
   const MyComponent = () => {
     const { connected, realTimeData, error } = useSockJSAnalytics();
     
     return (
       <div>
         <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
         {error && <p>Error: {error}</p>}
         {realTimeData && (
           <div>
             <p>Active Users: {realTimeData.activeUsersOnline}</p>
             <p>Revenue: {realTimeData.revenue}</p>
           </div>
         )}
       </div>
     );
   };
*/

export default useSockJSAnalytics;
