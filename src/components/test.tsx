import React, { useState, useEffect, useRef } from 'react';

interface WebSocketMessage {
    t: string;
    s?: string;
    uid?: string;
    k?: string;
    susertoken?: string;
    actid?: string;
    source?: string;
    ft?: string;
    [key: string]: any;
}

interface OrderMessage {
    t: string;
    norenordno?: string;
    pp?: string;
    mult?: string;
    prcftr?: string;
    trantype?: string;
    exch?: string;
    tsym?: string;
    status?: string;
    st_intrn?: string;
    reporttype?: string;
    pcode?: string;
    tm?: string;
    norentm?: string;
    ntm?: string;
    kidid?: string;
    [key: string]: any;
}

const WebSocketTester: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [heartbeatCount, setHeartbeatCount] = useState<number>(0);
    const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
    const [webhookSends, setWebhookSends] = useState<number>(0);

    const wsRef = useRef<WebSocket | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000; // 5 seconds

    const addMessage = (msg: string) => {
        setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const sendOrderToWebhook = async (orderData: OrderMessage) => {
        try {
            const orderId = orderData.norenordno || 'Unknown';
            addMessage(`📤 Sending order ${orderId} to webhook`);
            setWebhookSends(prev => prev + 1);

            const response = await fetch('https://n8n.codenetic.tech/webhook/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                addMessage(`✅ Order ${orderId} sent successfully to webhook`);

                // Try to get response data if available
                try {
                    const responseData = await response.json();
                    addMessage(`📝 Webhook response: ${JSON.stringify(responseData)}`);
                } catch (e) {
                    // No JSON response, that's okay
                }
            } else {
                addMessage(`❌ Failed to send order ${orderId} to webhook: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            addMessage(`❌ Error sending order to webhook: ${error}`);
            console.error('Webhook error:', error);
        }
    };

    const startHeartbeat = () => {
        // Clear any existing heartbeat interval
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }

        // Start sending heartbeat every 30 seconds
        heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const heartbeatMessage: WebSocketMessage = {
                    k: "",
                    t: "h"
                };

                wsRef.current.send(JSON.stringify(heartbeatMessage));
                addMessage(`Sent heartbeat: ${JSON.stringify(heartbeatMessage)}`);
                setHeartbeatCount(prev => prev + 1);
            }
        }, 10000); // 10 seconds interval
    };

    const stopHeartbeat = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    };

    const subscribeToOrderFeed = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const tickMessage: WebSocketMessage = {
                "t": "o",
                "actid": "SKY40001"
            };

            wsRef.current.send(JSON.stringify(tickMessage));
            addMessage(`Sent tick subscription: ${JSON.stringify(tickMessage)}`);
        }
    };

    const authenticateWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const authMessage: WebSocketMessage = {
                susertoken: "4a3f41cb17e8b06c04e6ae854f207a28b4ae85029b09f3736a9947fbb59e4341",
                t: "c",
                actid: "SKY40001",
                uid: "SKY40001",
                source: "WEB"
            };

            wsRef.current.send(JSON.stringify(authMessage));
            addMessage(`Sent authentication: ${JSON.stringify(authMessage)}`);
            setConnectionStatus('Connected - Authenticating');
        }
    };

    const attemptReconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        // Check if we've exceeded max reconnection attempts
        if (reconnectAttempts >= maxReconnectAttempts) {
            addMessage(`Max reconnection attempts (${maxReconnectAttempts}) reached. Please connect manually.`);
            setConnectionStatus('Max Reconnect Attempts Reached');
            setReconnectAttempts(0);
            return;
        }

        const attemptNumber = reconnectAttempts + 1;
        const delay = reconnectDelay * Math.pow(1.5, reconnectAttempts); // Exponential backoff

        addMessage(`Reconnection attempt ${attemptNumber}/${maxReconnectAttempts} in ${delay / 1000} seconds...`);
        setConnectionStatus(`Reconnecting... (Attempt ${attemptNumber}/${maxReconnectAttempts})`);

        reconnectTimeoutRef.current = setTimeout(() => {
            addMessage(`Reconnecting now (Attempt ${attemptNumber})...`);
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
        }, delay);
    };

    const handleWebSocketMessage = (data: any) => {
        // If we received connection acknowledgement
        if (data.t === "ck") {
            if (data.s === "OK") {
                setConnectionStatus('Connected - Authenticated');
                addMessage('✓ Authentication successful');
                setReconnectAttempts(0); // Reset reconnection attempts on successful auth

                // Start heartbeat after successful authentication
                startHeartbeat();

                // Send tick subscription after 500ms
                setTimeout(() => {
                    subscribeToOrderFeed();
                }, 500);
            } else {
                setConnectionStatus('Connected - Auth Failed');
                addMessage('✗ Authentication failed');
                // If authentication fails, we should disconnect and retry
                disconnectWebSocket();
                attemptReconnect();
            }
        }

        // Handle heartbeat response
        if (data.t === "hk") {
            addMessage(`✓ Heartbeat acknowledged (ft: ${data.ft})`);
        }

        // Handle tick data
        if (data.t === "tf" || data.t === "tk") {
            addMessage(`📈 Tick data received`);
        }

        // Handle order feed data
        if (data.t === "om" || data.t === "ok") {
            const orderId = data.norenordno || 'Unknown';
            const symbol = data.tsym || 'Unknown';
            const status = data.status || 'Unknown';
            const reportType = data.reporttype || 'Unknown';

            addMessage(`📊 Order ${orderId} - ${symbol} - Status: ${status} - Report: ${reportType}`);

            // Send order messages to webhook
            if (data.t === "om") {
                // Add metadata to order data
                const orderWithMetadata: OrderMessage = {
                    ...data,
                    webhook_target: 'https://n8n.codenetic.tech/webhook/webhook',
                    received_at: new Date().toISOString(),
                    webhook_sent_at: new Date().toISOString(),
                    source: 'skypro_websocket'
                };

                // Send to webhook
                sendOrderToWebhook(orderWithMetadata);
            }
        }
    };

    const connectWebSocket = () => {
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN ||
            wsRef.current?.readyState === WebSocket.CONNECTING) {
            addMessage('WebSocket is already connecting or connected');
            return;
        }

        setIsConnecting(true);
        setConnectionStatus('Connecting...');
        addMessage('Connecting to WebSocket...');

        try {
            wsRef.current = new WebSocket('wss://skypro.skybroking.com/NorenWSWEBCODIFI/');

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
                setConnectionStatus('Connected - Authenticating');
                addMessage('WebSocket connected successfully');

                // Send authentication message
                authenticateWebSocket();
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    addMessage(`Received: ${JSON.stringify(data)}`);
                    handleWebSocketMessage(data);
                } catch (error) {
                    addMessage(`Received (non-JSON): ${event.data}`);
                }
            };

            wsRef.current.onerror = (error) => {
                setIsConnecting(false);
                setConnectionStatus('Connection Error');
                addMessage(`WebSocket error occurred`);
                console.error('WebSocket error:', error);
            };

            wsRef.current.onclose = (event) => {
                setIsConnected(false);
                setIsConnecting(false);
                stopHeartbeat();

                let status = 'Disconnected';
                let shouldReconnect = true;

                if (event.code === 1000) {
                    status = 'Normal Closure';
                    // Even on normal closure, we should reconnect for this application
                    // since we want continuous order feed subscription
                    addMessage('Normal closure detected - will attempt to reconnect');
                } else if (event.code === 1006) {
                    status = 'Abnormal Closure';
                    addMessage('Abnormal closure detected - will attempt to reconnect');
                } else {
                    status = `Closed (Code: ${event.code})`;
                    // For other codes, still attempt to reconnect
                }

                setConnectionStatus(status);
                addMessage(`WebSocket disconnected. Code: ${event.code}, Status: ${status}, Reason: ${event.reason || 'No reason provided'}`);

                // Clear the WebSocket reference
                wsRef.current = null;

                // Attempt to reconnect if not manually disconnected
                if (shouldReconnect) {
                    attemptReconnect();
                }
            };

        } catch (error) {
            setIsConnecting(false);
            setConnectionStatus('Connection Failed');
            addMessage(`Failed to create WebSocket: ${error}`);

            // Attempt reconnect on connection failure
            attemptReconnect();
        }
    };

    const disconnectWebSocket = () => {
        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Reset reconnect attempts counter
        setReconnectAttempts(0);

        stopHeartbeat();

        if (wsRef.current) {
            wsRef.current.close(1000, 'User initiated disconnect');
            wsRef.current = null;
        }

        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus('Disconnected (Manual)');
        addMessage('Manually disconnected - auto-reconnect disabled');
    };

    const sendHeartbeatManually = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const heartbeatMessage: WebSocketMessage = {
                k: "",
                t: "h"
            };

            wsRef.current.send(JSON.stringify(heartbeatMessage));
            addMessage(`Manual heartbeat sent: ${JSON.stringify(heartbeatMessage)}`);
            setHeartbeatCount(prev => prev + 1);
        } else {
            addMessage('Cannot send heartbeat - WebSocket not connected');
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    useEffect(() => {
        return () => {
            // Cleanup on component unmount
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">WebSocket Connection Tester</h1>

                <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Connection Status</h2>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className={`w-4 h-4 rounded-full ${connectionStatus.includes('Connected') && !connectionStatus.includes('Disconnected') ? 'bg-green-500' :
                                    connectionStatus.includes('Connecting') || connectionStatus.includes('Reconnecting') ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}></div>
                            <span className="text-lg font-medium">{connectionStatus}</span>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                                    <span className="text-gray-600">Heartbeats:</span>
                                    <span className="font-bold text-blue-600">{heartbeatCount}</span>
                                </div>

                                <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                                    <span className="text-blue-600">Reconnect Attempts:</span>
                                    <span className="font-bold text-blue-700">{reconnectAttempts}/{maxReconnectAttempts}</span>
                                </div>

                                <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                                    <span className="text-green-600">Webhook Sends:</span>
                                    <span className="font-bold text-green-700">{webhookSends}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium">Endpoint:</span> wss://skypro.skybroking.com/NorenWSWEBCODIFI/
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-8">
                        <button
                            onClick={connectWebSocket}
                            disabled={isConnecting || isConnected}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${isConnecting || isConnected
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>

                        <button
                            onClick={disconnectWebSocket}
                            disabled={!isConnected && !isConnecting}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${!isConnected && !isConnecting
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            Disconnect
                        </button>

                        <button
                            onClick={sendHeartbeatManually}
                            disabled={!isConnected}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${!isConnected
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            Send Heartbeat
                        </button>

                        <button
                            onClick={() => {
                                if (isConnected) {
                                    subscribeToOrderFeed();
                                }
                            }}
                            disabled={!isConnected}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${!isConnected
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            Subscribe to Order Feed
                        </button>

                        <button
                            onClick={clearMessages}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                        >
                            Clear Messages
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Connection Flow:</h3>
                        <ol className="list-decimal pl-5 text-gray-600 space-y-1">
                            <li>Connect to WebSocket</li>
                            <li>Send authentication message</li>
                            <li>Receive connection acknowledgement (ck)</li>
                            <li>Start automatic heartbeat (every 10s)</li>
                            <li>Send order feed subscription message</li>
                            <li>Receive tick data and heartbeat responses</li>
                            <li><strong className="text-green-600">Auto-send order messages to webhook</strong></li>
                            <li>Auto-reconnect on ANY disconnection (normal or abnormal)</li>
                            <li>Exponential backoff on reconnection attempts</li>
                        </ol>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700">WebSocket Messages</h2>
                            <p className="text-gray-600 text-sm mt-1">Real-time communication log</p>
                        </div>
                        <div className="text-sm text-gray-600">
                            Total: <span className="font-bold">{messages.length}</span> messages
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[500px] overflow-y-auto font-mono text-sm">
                            {messages.length === 0 ? (
                                <div className="text-gray-500 italic h-full flex items-center justify-center">
                                    No messages yet. Click "Connect" to start.
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 p-3 rounded-lg ${msg.includes('Received:') && msg.includes('"t":"hk"')
                                                ? 'bg-purple-50 border-l-4 border-purple-500'
                                                : msg.includes('Received:') && msg.includes('"t":"ck"')
                                                    ? 'bg-green-50 border-l-4 border-green-500'
                                                    : msg.includes('Received:') && (msg.includes('"t":"om"') || msg.includes('"t":"ok"'))
                                                        ? 'bg-yellow-50 border-l-4 border-yellow-500'
                                                        : msg.includes('Received:') && (msg.includes('"t":"tf"') || msg.includes('"t":"tk"'))
                                                            ? 'bg-green-50 border-l-4 border-green-300'
                                                            : msg.includes('Received:')
                                                                ? 'bg-green-50 border-l-4 border-green-300'
                                                                : msg.includes('Sent:') && msg.includes('"t":"h"')
                                                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                                                    : msg.includes('Sent:') && msg.includes('"t":"o"')
                                                                        ? 'bg-yellow-50 border-l-4 border-yellow-400'
                                                                        : msg.includes('Sent:')
                                                                            ? 'bg-blue-50 border-l-4 border-blue-300'
                                                                            : msg.includes('Reconnect') || msg.includes('Reconnecting')
                                                                                ? 'bg-orange-50 border-l-4 border-orange-500'
                                                                                : msg.includes('error') || msg.includes('Failed') || msg.includes('✗') || msg.includes('❌')
                                                                                    ? 'bg-red-50 border-l-4 border-red-500'
                                                                                    : msg.includes('✓') || msg.includes('📈') || msg.includes('📊')
                                                                                        ? 'bg-green-50 border-l-4 border-green-400'
                                                                                        : msg.includes('📤') || msg.includes('✅') || msg.includes('📝')
                                                                                            ? 'bg-teal-50 border-l-4 border-teal-500'
                                                                                            : 'bg-gray-50 border-l-4 border-gray-400'
                                            }`}
                                    >
                                        <span className="text-gray-700">{msg}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Auto-Reconnection Information:</h3>
                    <ul className="list-disc pl-5 text-blue-700 space-y-1">
                        <li>Auto-reconnect triggers on ANY disconnection (Normal Closure 1000, Abnormal Closure 1006, etc.)</li>
                        <li>Maximum {maxReconnectAttempts} reconnection attempts with exponential backoff</li>
                        <li>Reconnects automatically authenticate and subscribe to order feed</li>
                        <li>Manual disconnection stops auto-reconnection</li>
                        <li>Heartbeats maintain connection health (every 10 seconds)</li>
                        <li><strong className="text-blue-800">Order messages (type "om") automatically POST to webhook at: https://n8n.codenetic.tech/webhook</strong></li>
                        <li>Webhook sends include timestamps and source metadata</li>
                    </ul>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Webhook Configuration:</h3>
                    <div className="bg-white rounded-lg p-4 mb-3">
                        <div className="font-mono text-sm">
                            <div className="mb-2">
                                <span className="text-green-700 font-semibold">Endpoint:</span> POST https://n8n.codenetic.tech/webhook
                            </div>
                            <div className="mb-2">
                                <span className="text-green-700 font-semibold">Content-Type:</span> application/json
                            </div>
                            <div>
                                <span className="text-green-700 font-semibold">Payload:</span> Original order data + metadata
                            </div>
                        </div>
                    </div>
                    <div className="text-green-700 text-sm">
                        Example order that will be sent to webhook:
                        <pre className="mt-2 bg-white p-3 rounded-lg overflow-x-auto text-xs">
                            {`{
  "t": "om",
  "norenordno": "26011500000081",
  "pp": "2",
  "mult": "1",
  "prcftr": "1.000000",
  "trantype": "B",
  "exch": "NSE",
  "tsym": "EICHERMOT-EQ",
  "status": "PENDING",
  "st_intrn": "ORDER ACK",
  "reporttype": "NewAck",
  "pcode": "I",
  "tm": "1768468178",
  "norentm": "14:39:38 15-01-2026",
  "ntm": "591773356",
  "kidid": "1",
  "webhook_target": "https://n8n.codenetic.tech/webhook",
  "received_at": "2026-01-15T14:39:41.123Z",
  "webhook_sent_at": "2026-01-15T14:39:41.456Z",
  "source": "skypro_websocket"
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebSocketTester;