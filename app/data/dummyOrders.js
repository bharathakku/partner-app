// Enhanced dummy data for order receiving system with route optimization
export const routeBasedOrders = [
  // Route 1: Commercial Street - Brigade Road Area (High-density commercial area)
  {
    id: 'ORD-001',
    customerName: 'Ananya Rao',
    customerPhone: '+91 99887 66554',
    senderName: 'TechWorld Electronics',
    senderPhone: '+91 80123 45678',
    pickupLocation: {
      address: 'TechWorld Electronics, Commercial Street, Bengaluru',
      coordinates: { lat: 12.9716, lng: 77.6412 },
      landmark: 'Near Metro Pillar 234'
    },
    customerLocation: {
      address: 'UB City Mall, Vittal Mallya Road, Bengaluru',
      coordinates: { lat: 12.9725, lng: 77.6059 },
      landmark: 'Main Entrance, Tower A'
    },
    parcelDetails: {
      type: 'Electronics',
      description: 'Laptop & Accessories',
      weight: '2.5 kg',
      dimensions: '40 x 30 x 8 cm',
      fragile: true,
      value: 75000
    },
    deliveryInstructions: 'Office delivery - 9th floor, reception will accept',
    items: [
      { name: 'Dell Inspiron Laptop', quantity: 1, price: 72000 },
      { name: 'Laptop Bag', quantity: 1, price: 3000 }
    ],
    orderValue: 75000,
    deliveryFee: 120,
    partnerEarnings: 105,
    distance: '2.1 km',
    estimatedTime: '18 mins',
    route: 'commercial-brigade',
    orderTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    paymentMethod: 'UPI',
    codAmount: 0
  },
  {
    id: 'ORD-002', 
    customerName: 'Vikram Singh',
    customerPhone: '+91 98123 45678',
    senderName: 'Fashion Central',
    senderPhone: '+91 80987 65432',
    pickupLocation: {
      address: 'Fashion Central, Brigade Road, Bengaluru',
      coordinates: { lat: 12.9744, lng: 77.6098 },
      landmark: 'Next to Cafe Coffee Day'
    },
    customerLocation: {
      address: 'Prestige Trade Tower, Palace Road, Bengaluru',
      coordinates: { lat: 12.9802, lng: 77.5985 },
      landmark: 'Ground floor lobby'
    },
    parcelDetails: {
      type: 'Clothing',
      description: 'Formal Wear Collection',
      weight: '1.8 kg',
      dimensions: '45 x 35 x 12 cm',
      fragile: false,
      value: 8500
    },
    deliveryInstructions: 'COD order - verify items before payment',
    items: [
      { name: 'Blazer Set', quantity: 1, price: 6500 },
      { name: 'Formal Shirt', quantity: 2, price: 1000 },
      { name: 'Tie & Cufflinks', quantity: 1, price: 1000 }
    ],
    orderValue: 8500,
    deliveryFee: 85,
    partnerEarnings: 125, // Higher for COD
    distance: '1.8 km',
    estimatedTime: '15 mins',
    route: 'commercial-brigade',
    orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    paymentMethod: 'Cash on Delivery',
    codAmount: 8500
  },

  // Route 2: Koramangala - HSR Layout Area (Tech corridor)
  {
    id: 'ORD-003',
    customerName: 'Pooja Reddy',
    customerPhone: '+91 91234 56789',
    senderName: 'Green Valley Organics',
    senderPhone: '+91 80111 22333',
    pickupLocation: {
      address: 'Green Valley Organics, Koramangala 4th Block, Bengaluru',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      landmark: 'Above SBI Bank'
    },
    customerLocation: {
      address: 'Prestige Ozone, HSR Layout Sector 1, Bengaluru',
      coordinates: { lat: 12.9081, lng: 77.6476 },
      landmark: 'Tower 3, Apartment 402'
    },
    parcelDetails: {
      type: 'Food & Groceries',
      description: 'Organic Food Package',
      weight: '3.2 kg',
      dimensions: '30 x 25 x 20 cm',
      fragile: false,
      value: 2500
    },
    deliveryInstructions: 'Perishable items - deliver before 7 PM',
    items: [
      { name: 'Organic Vegetables', quantity: 1, price: 800 },
      { name: 'Organic Fruits', quantity: 1, price: 1200 },
      { name: 'Dairy Products', quantity: 1, price: 500 }
    ],
    orderValue: 2500,
    deliveryFee: 65,
    partnerEarnings: 58,
    distance: '3.5 km',
    estimatedTime: '22 mins',
    route: 'koramangala-hsr',
    orderTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
    paymentMethod: 'UPI',
    codAmount: 0
  },
  {
    id: 'ORD-004',
    customerName: 'Arjun Mehta',
    customerPhone: '+91 87654 32109',
    senderName: 'BookWorm Cafe',
    senderPhone: '+91 80444 55666',
    pickupLocation: {
      address: 'BookWorm Cafe, Koramangala 5th Block, Bengaluru',
      coordinates: { lat: 12.9279, lng: 77.6271 },
      landmark: 'Corner building, ground floor'
    },
    customerLocation: {
      address: 'Adarsh Palm Retreat, HSR Layout Sector 2, Bengaluru',
      coordinates: { lat: 12.9156, lng: 77.6378 },
      landmark: 'Main gate, security will direct'
    },
    parcelDetails: {
      type: 'Books & Stationery',
      description: 'Study Materials & Books',
      weight: '2.1 kg',
      dimensions: '35 x 25 x 15 cm',
      fragile: false,
      value: 1800
    },
    deliveryInstructions: 'Student delivery - call when you arrive',
    items: [
      { name: 'Programming Books', quantity: 3, price: 1200 },
      { name: 'Notebooks', quantity: 5, price: 300 },
      { name: 'Stationery Kit', quantity: 1, price: 300 }
    ],
    orderValue: 1800,
    deliveryFee: 45,
    partnerEarnings: 42,
    distance: '2.9 km',
    estimatedTime: '19 mins',
    route: 'koramangala-hsr',
    orderTime: new Date(Date.now() - 7 * 60 * 1000).toISOString(), // 7 minutes ago
    paymentMethod: 'UPI',
    codAmount: 0
  },

  // Route 3: Indiranagar - Whitefield Area (Extended delivery)
  {
    id: 'ORD-005',
    customerName: 'Sneha Iyer',
    customerPhone: '+91 76543 21098',
    senderName: 'Himalaya Medicine Store',
    senderPhone: '+91 80777 88999',
    pickupLocation: {
      address: 'Himalaya Medicine Store, Indiranagar 12th Main, Bengaluru',
      coordinates: { lat: 12.9784, lng: 77.6408 },
      landmark: 'Next to CMH Road junction'
    },
    customerLocation: {
      address: 'Phoenix MarketCity, Whitefield, Bengaluru',
      coordinates: { lat: 12.9698, lng: 77.7499 },
      landmark: 'Mall entrance, customer service desk'
    },
    parcelDetails: {
      type: 'Medicine & Healthcare',
      description: 'Medical Supplies',
      weight: '0.8 kg',
      dimensions: '20 x 15 x 10 cm',
      fragile: true,
      value: 3200
    },
    deliveryInstructions: 'Urgent medicine delivery - temperature sensitive',
    items: [
      { name: 'Prescription Medicines', quantity: 4, price: 2800 },
      { name: 'Health Supplements', quantity: 2, price: 400 }
    ],
    orderValue: 3200,
    deliveryFee: 150, // Higher for long distance
    partnerEarnings: 135,
    distance: '8.2 km',
    estimatedTime: '35 mins',
    route: 'indiranagar-whitefield',
    orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    paymentMethod: 'UPI',
    codAmount: 0
  }
];

// Function to get orders by route for dual order management
export const getOrdersByRoute = (route) => {
  return routeBasedOrders.filter(order => order.route === route);
};

// Function to get available route pairs for dual orders
export const getAvailableRoutePairs = () => {
  const routes = {};
  routeBasedOrders.forEach(order => {
    if (!routes[order.route]) {
      routes[order.route] = [];
    }
    routes[order.route].push(order);
  });
  
  // Return routes that have exactly 2 orders available
  return Object.entries(routes)
    .filter(([route, orders]) => orders.length >= 2)
    .map(([route, orders]) => ({
      route,
      orders: orders.slice(0, 2), // Take only first 2 orders
      totalDistance: orders.slice(0, 2).reduce((sum, order) => {
        return sum + parseFloat(order.distance.replace(' km', ''));
      }, 0),
      totalEarnings: orders.slice(0, 2).reduce((sum, order) => sum + order.partnerEarnings, 0),
      estimatedTime: Math.max(...orders.slice(0, 2).map(order => 
        parseInt(order.estimatedTime.replace(' mins', ''))
      )) + 10 // Add 10 minutes buffer for dual orders
    }));
};

// Function to optimize route order based on proximity
export const optimizeRouteOrder = (orders) => {
  if (orders.length !== 2) return orders;
  
  const [order1, order2] = orders;
  
  // Calculate distances between pickup points and delivery points
  const distance1to2Pickup = calculateDistance(
    order1.pickupLocation.coordinates,
    order2.pickupLocation.coordinates
  );
  
  const distance1to2Delivery = calculateDistance(
    order1.customerLocation.coordinates,
    order2.customerLocation.coordinates
  );
  
  // If order1's delivery is closer to order2's pickup, prioritize order1
  const order1DeliveryToOrder2Pickup = calculateDistance(
    order1.customerLocation.coordinates,
    order2.pickupLocation.coordinates
  );
  
  const order2DeliveryToOrder1Pickup = calculateDistance(
    order2.customerLocation.coordinates,
    order1.pickupLocation.coordinates
  );
  
  // Return orders in optimized sequence
  if (order1DeliveryToOrder2Pickup < order2DeliveryToOrder1Pickup) {
    return [order1, order2]; // Order1 first, then Order2
  } else {
    return [order2, order1]; // Order2 first, then Order1
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Function to simulate real-time order notifications
export const createOrderNotificationQueue = () => {
  const notifications = [];
  const availableOrders = [...routeBasedOrders];
  
  // Simulate orders coming in sequence
  let delay = 0;
  availableOrders.forEach((order, index) => {
    delay += Math.random() * 30000 + 15000; // 15-45 seconds between orders
    notifications.push({
      ...order,
      notificationTime: Date.now() + delay,
      isActive: false
    });
  });
  
  return notifications;
};

export default routeBasedOrders;
