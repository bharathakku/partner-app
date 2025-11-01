import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

// Store active connections
const activeConnections = new Map();

// Create a new WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Handle new WebSocket connections
wss.on('connection', (ws, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const driverId = url.pathname.split('/').pop();
  
  if (!driverId) {
    console.error('No driver ID in WebSocket connection URL');
    ws.close(1008, 'Driver ID is required');
    return;
  }
  
  console.log(`New WebSocket connection for driver ${driverId}`);
  
  // Store the WebSocket connection
  if (!activeConnections.has(driverId)) {
    activeConnections.set(driverId, new Set());
  }
  activeConnections.get(driverId).add(ws);
  
  // Send a welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    driverId,
    timestamp: new Date().toISOString()
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from driver ${driverId}:`, data);
      
      // Handle different message types
      switch (data.type) {
        case 'locationUpdate':
          // Broadcast location updates to all admin clients
          broadcastToAdmins(driverId, {
            type: 'locationUpdate',
            driverId,
            lat: data.lat,
            lng: data.lng,
            address: data.address,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'statusUpdate':
          // Broadcast status updates to all admin clients
          broadcastToAdmins(driverId, {
            type: 'statusUpdate',
            driverId,
            isOnline: data.isOnline,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'getLocation':
          // If an admin requests the current location, forward to the driver
          const driverWs = getDriverConnection(driverId);
          if (driverWs) {
            driverWs.send(JSON.stringify({ type: 'getLocation' }));
          }
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  // Handle connection close
  ws.on('close', () => {
    console.log(`WebSocket connection closed for driver ${driverId}`);
    
    // Remove the connection from active connections
    if (activeConnections.has(driverId)) {
      activeConnections.get(driverId).delete(ws);
      if (activeConnections.get(driverId).size === 0) {
        activeConnections.delete(driverId);
      }
    }
    
    // If this was a driver connection, notify admins that the driver went offline
    if (ws.driverConnection) {
      broadcastToAdmins(driverId, {
        type: 'statusUpdate',
        driverId,
        isOnline: false,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for driver ${driverId}:`, error);
  });
});

// Helper function to get a driver's WebSocket connection
function getDriverConnection(driverId) {
  const connections = activeConnections.get(driverId);
  if (!connections) return null;
  
  // Find the first connection that's a driver connection
  for (const conn of connections) {
    if (conn.driverConnection) {
      return conn;
    }
  }
  return null;
}

// Helper function to broadcast messages to all admin clients for a driver
function broadcastToAdmins(driverId, message) {
  const connections = activeConnections.get(driverId) || new Set();
  let adminCount = 0;
  
  connections.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(message));
      if (!client.driverConnection) {
        adminCount++;
      }
    }
  });
  
  console.log(`Broadcasted message to ${adminCount} admin(s) for driver ${driverId}:`, message);
}

// Handle WebSocket upgrade requests
export async function GET(request, { params }) {
  const driverId = params.id;
  
  if (!driverId) {
    return new NextResponse('Driver ID is required', { status: 400 });
  }
  
  // Get the upgrade header
  const upgradeHeader = request.headers.get('upgrade');
  
  if (upgradeHeader !== 'websocket') {
    return new NextResponse('Expected WebSocket upgrade request', { status: 426 });
  }
  
  // Handle the WebSocket upgrade
  const { socket, response } = await new Promise((resolve) => {
    wss.handleUpgrade(request, request.socket, Buffer.alloc(0), (ws) => {
      // Mark this as a driver connection if it's from a driver
      const url = new URL(request.url, `http://${request.headers.host}`);
      ws.driverConnection = url.searchParams.get('type') === 'driver';
      
      resolve({ socket: ws, response: new NextResponse(null, { status: 101 }) });
    });
  });
  
  // Initialize the WebSocket connection
  wss.emit('connection', socket, request);
  
  return response;
}
