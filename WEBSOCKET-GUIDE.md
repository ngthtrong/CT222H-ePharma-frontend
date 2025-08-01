# WebSocket Integration Guide

## Backend WebSocket Configuration

### Endpoints
- **WebSocket URL**: `ws://localhost:8081/ws-analytics`
- **HTTP URL**: `http://localhost:8081/ws-analytics` (for SockJS fallback)
- **STOMP Destination Prefix**: `/topic` (for subscribing)
- **Application Destination Prefix**: `/app` (for sending messages)

### Available Channels
- `/topic/welcome` - Welcome messages when connecting
- `/topic/pong` - Response to ping messages
- `/topic/analytics` - Real-time analytics updates

### Security Configuration
WebSocket endpoints are publicly accessible (no authentication required for basic connection).

---

## Frontend Integration

### 1. Install Dependencies

```bash
npm install sockjs-client stompjs
# OR
npm install @stomp/stompjs sockjs-client
```

### 2. Basic Connection Setup

```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
    }

    connect() {
        // Create SockJS connection
        const socket = new SockJS('http://localhost:8081/ws-analytics');
        
        // Create STOMP client
        this.stompClient = Stomp.over(socket);
        
        // Disable debug logging (optional)
        this.stompClient.debug = null;

        // Connect to WebSocket
        this.stompClient.connect(
            {}, // headers (empty for public access)
            (frame) => {
                console.log('Connected to WebSocket:', frame);
                this.connected = true;
                this.onConnected();
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                this.connected = false;
                this.onError(error);
            }
        );
    }

    disconnect() {
        if (this.stompClient && this.connected) {
            this.stompClient.disconnect(() => {
                console.log('Disconnected from WebSocket');
                this.connected = false;
            });
        }
    }

    onConnected() {
        // Subscribe to channels
        this.subscribeToWelcome();
        this.subscribeToPong();
        
        // Send initial connection message
        this.sendConnectionMessage();
    }

    onError(error) {
        console.error('WebSocket error:', error);
        // Implement reconnection logic here
        setTimeout(() => {
            if (!this.connected) {
                console.log('Attempting to reconnect...');
                this.connect();
            }
        }, 5000);
    }

    subscribeToWelcome() {
        if (this.stompClient && this.connected) {
            this.stompClient.subscribe('/topic/welcome', (message) => {
                console.log('Welcome message:', message.body);
            });
        }
    }

    subscribeToPong() {
        if (this.stompClient && this.connected) {
            this.stompClient.subscribe('/topic/pong', (message) => {
                console.log('Pong received:', message.body);
            });
        }
    }

    sendConnectionMessage() {
        if (this.stompClient && this.connected) {
            this.stompClient.send('/app/analytics/connect', {}, JSON.stringify({
                clientId: this.generateClientId(),
                timestamp: new Date().toISOString()
            }));
        }
    }

    sendPing() {
        if (this.stompClient && this.connected) {
            this.stompClient.send('/app/analytics/ping', {}, 'ping');
        }
    }

    generateClientId() {
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }
}

// Usage
const webSocketService = new WebSocketService();
webSocketService.connect();
```

### 3. React Hook Implementation

```javascript
import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const useWebSocket = () => {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const stompClientRef = useRef(null);

    useEffect(() => {
        connect();
        
        return () => {
            disconnect();
        };
    }, []);

    const connect = () => {
        const socket = new SockJS('http://localhost:8081/ws-analytics');
        const stompClient = Stomp.over(socket);
        
        stompClient.debug = null; // Disable debug logging
        
        stompClient.connect(
            {},
            (frame) => {
                console.log('Connected to WebSocket:', frame);
                setConnected(true);
                stompClientRef.current = stompClient;
                
                // Subscribe to channels
                subscribeToChannels(stompClient);
                
                // Send connection message
                stompClient.send('/app/analytics/connect', {}, JSON.stringify({
                    clientId: generateClientId(),
                    timestamp: new Date().toISOString()
                }));
            },
            (error) => {
                console.error('WebSocket connection error:', error);
                setConnected(false);
                
                // Retry connection after 5 seconds
                setTimeout(() => {
                    connect();
                }, 5000);
            }
        );
    };

    const disconnect = () => {
        if (stompClientRef.current && connected) {
            stompClientRef.current.disconnect(() => {
                console.log('Disconnected from WebSocket');
                setConnected(false);
                stompClientRef.current = null;
            });
        }
    };

    const subscribeToChannels = (stompClient) => {
        // Subscribe to welcome messages
        stompClient.subscribe('/topic/welcome', (message) => {
            addMessage('welcome', message.body);
        });

        // Subscribe to pong messages
        stompClient.subscribe('/topic/pong', (message) => {
            addMessage('pong', message.body);
        });

        // Subscribe to analytics updates (if available)
        stompClient.subscribe('/topic/analytics', (message) => {
            try {
                const data = JSON.parse(message.body);
                addMessage('analytics', data);
            } catch (e) {
                addMessage('analytics', message.body);
            }
        });
    };

    const addMessage = (type, content) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type,
            content,
            timestamp: new Date()
        }]);
    };

    const sendPing = () => {
        if (stompClientRef.current && connected) {
            stompClientRef.current.send('/app/analytics/ping', {}, 'ping');
        }
    };

    const generateClientId = () => {
        return 'client_' + Math.random().toString(36).substr(2, 9);
    };

    return {
        connected,
        messages,
        sendPing,
        connect,
        disconnect
    };
};
```

### 4. React Component Example

```javascript
import React from 'react';
import { useWebSocket } from './hooks/useWebSocket';

const WebSocketDemo = () => {
    const { connected, messages, sendPing } = useWebSocket();

    return (
        <div className="websocket-demo">
            <div className="connection-status">
                <h3>WebSocket Status</h3>
                <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
                    {connected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
                
                {connected && (
                    <button onClick={sendPing} className="ping-button">
                        Send Ping
                    </button>
                )}
            </div>

            <div className="messages-section">
                <h3>Messages ({messages.length})</h3>
                <div className="messages-container">
                    {messages.map(message => (
                        <div key={message.id} className={`message message-${message.type}`}>
                            <div className="message-type">{message.type}</div>
                            <div className="message-content">
                                {typeof message.content === 'object' 
                                    ? JSON.stringify(message.content, null, 2)
                                    : message.content
                                }
                            </div>
                            <div className="message-time">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WebSocketDemo;
```

### 5. Vue.js Implementation

```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default {
    data() {
        return {
            stompClient: null,
            connected: false,
            messages: []
        };
    },
    
    mounted() {
        this.connect();
    },
    
    beforeUnmount() {
        this.disconnect();
    },
    
    methods: {
        connect() {
            const socket = new SockJS('http://localhost:8081/ws-analytics');
            this.stompClient = Stomp.over(socket);
            
            this.stompClient.debug = null;
            
            this.stompClient.connect(
                {},
                (frame) => {
                    console.log('Connected:', frame);
                    this.connected = true;
                    this.subscribeToChannels();
                    this.sendConnectionMessage();
                },
                (error) => {
                    console.error('Connection error:', error);
                    this.connected = false;
                    setTimeout(() => this.connect(), 5000);
                }
            );
        },
        
        disconnect() {
            if (this.stompClient && this.connected) {
                this.stompClient.disconnect(() => {
                    this.connected = false;
                    this.stompClient = null;
                });
            }
        },
        
        subscribeToChannels() {
            this.stompClient.subscribe('/topic/welcome', (message) => {
                this.addMessage('welcome', message.body);
            });
            
            this.stompClient.subscribe('/topic/pong', (message) => {
                this.addMessage('pong', message.body);
            });
        },
        
        sendConnectionMessage() {
            this.stompClient.send('/app/analytics/connect', {}, JSON.stringify({
                clientId: this.generateClientId(),
                timestamp: new Date().toISOString()
            }));
        },
        
        sendPing() {
            if (this.connected) {
                this.stompClient.send('/app/analytics/ping', {}, 'ping');
            }
        },
        
        addMessage(type, content) {
            this.messages.push({
                id: Date.now(),
                type,
                content,
                timestamp: new Date()
            });
        },
        
        generateClientId() {
            return 'client_' + Math.random().toString(36).substr(2, 9);
        }
    }
};
```

---

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify backend is running on port 8081
   - Check firewall settings
   - Ensure WebSocket endpoints are not blocked

2. **CORS Issues**
   - Backend is configured to allow all origins
   - If issues persist, check browser console for specific CORS errors

3. **SockJS Fallback**
   - If WebSocket fails, SockJS automatically falls back to HTTP polling
   - This is transparent to the application

### Testing WebSocket Connection

```javascript
// Simple test function
function testWebSocketConnection() {
    const socket = new SockJS('http://localhost:8081/ws-analytics');
    const stompClient = Stomp.over(socket);
    
    stompClient.connect({}, 
        (frame) => {
            console.log('✅ WebSocket connection successful:', frame);
            stompClient.disconnect();
        },
        (error) => {
            console.error('❌ WebSocket connection failed:', error);
        }
    );
}

// Run test
testWebSocketConnection();
```

### Debug Mode

Enable debug logging to see all STOMP frames:

```javascript
stompClient.debug = (str) => {
    console.log('STOMP Debug:', str);
};
```

---

## Advanced Features

### Heartbeat Configuration

```javascript
stompClient.heartbeat.outgoing = 20000; // Client will send heartbeat every 20s
stompClient.heartbeat.incoming = 20000; // Client expects heartbeat from server every 20s
```

### Reconnection with Exponential Backoff

```javascript
class WebSocketWithReconnect {
    constructor() {
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 1000; // Start with 1 second
    }
    
    connect() {
        // ... connection logic
    }
    
    onError(error) {
        console.error('WebSocket error:', error);
        this.scheduleReconnect();
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
            
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }
    
    onConnected() {
        this.reconnectAttempts = 0; // Reset on successful connection
        this.reconnectInterval = 1000; // Reset interval
    }
}
```

### Message Queue for Offline Messages

```javascript
class WebSocketWithQueue {
    constructor() {
        this.messageQueue = [];
        this.connected = false;
    }
    
    send(destination, headers, body) {
        if (this.connected && this.stompClient) {
            this.stompClient.send(destination, headers, body);
        } else {
            // Queue message for later
            this.messageQueue.push({ destination, headers, body });
        }
    }
    
    onConnected() {
        this.connected = true;
        
        // Send queued messages
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.stompClient.send(message.destination, message.headers, message.body);
        }
    }
}
```

---

## Environment Configuration

### Development
```javascript
const WEBSOCKET_URL = 'http://localhost:8081/ws-analytics';
```

### Production
```javascript
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'https://your-domain.com/ws-analytics';
```

### Configuration Object
```javascript
const webSocketConfig = {
    url: process.env.NODE_ENV === 'production' 
        ? 'wss://your-domain.com/ws-analytics'
        : 'http://localhost:8081/ws-analytics',
    debug: process.env.NODE_ENV === 'development',
    heartbeat: {
        incoming: 20000,
        outgoing: 20000
    },
    reconnect: {
        maxAttempts: 5,
        initialDelay: 1000
    }
};
```

---

## Security Considerations

1. **Authentication**: Current setup is public. For authenticated connections, add JWT tokens to headers
2. **Origin Validation**: Backend allows all origins. Restrict in production
3. **Rate Limiting**: Implement client-side and server-side rate limiting
4. **Message Validation**: Always validate incoming message format

---

## Performance Tips

1. **Batch Messages**: Group multiple updates into single messages
2. **Debounce Subscriptions**: Avoid subscribing/unsubscribing rapidly
3. **Clean Up**: Always unsubscribe and disconnect when components unmount
4. **Message Size**: Keep message payloads small for better performance

---

## Browser Support

- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support
- IE 11: SockJS fallback support

---

For more information about STOMP protocol: https://stomp.github.io/
For SockJS documentation: https://github.com/sockjs/sockjs-client
