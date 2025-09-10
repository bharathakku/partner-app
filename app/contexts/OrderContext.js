'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const OrderContext = createContext();

const ORDER_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PICKUP_REACHED: 'pickup_reached',
  PICKUP_COMPLETE: 'pickup_complete',
  CUSTOMER_REACHED: 'customer_reached',
  COMPLETED: 'completed',
  PAID: 'paid'
};

const initialState = {
  currentOrder: null,
  orderHistory: [],
  partnerBalance: 12450.50,
  totalEarningsToday: 850.75,
  completedOrdersToday: 12,
  demoOrders: [
    {
      id: 'PCL-001',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      senderName: 'Amit Electronics Store',
      senderPhone: '+91 98765 11111',
      pickupLocation: {
        address: 'Amit Electronics, Commercial Street, Bengaluru',
        coordinates: { lat: 12.9716, lng: 77.6412 }
      },
      customerLocation: {
        address: 'Brigade Road, MG Road Metro Station, Bengaluru',
        coordinates: { lat: 12.9752, lng: 77.6098 }
      },
      parcelDetails: {
        type: 'Electronics',
        description: 'Mobile Phone & Accessories',
        weight: '1.2 kg',
        dimensions: '25 x 15 x 8 cm',
        fragile: true,
        value: 45000
      },
      deliveryInstructions: 'Handle with care - Electronics item. Call before delivery.',
      items: [
        { name: 'Samsung Galaxy S24', quantity: 1, price: 42000 },
        { name: 'Phone Case', quantity: 1, price: 2500 },
        { name: 'Screen Protector', quantity: 1, price: 500 }
      ],
      orderValue: 45000,
      deliveryFee: 89,
      partnerEarnings: 78,
      distance: '3.2 km',
      estimatedTime: '25 mins',
      status: ORDER_STATUSES.PENDING,
      orderTime: '2025-01-09T05:43:16Z', // 10 minutes ago
      paymentMethod: 'UPI',
      codAmount: 0
    },
    {
      id: 'PCL-002',
      customerName: 'Rajesh Kumar',
      customerPhone: '+91 87654 32109',
      senderName: 'Fashion Hub Boutique',
      senderPhone: '+91 87654 22222',
      pickupLocation: {
        address: 'Fashion Hub, Forum Mall, Koramangala, Bengaluru',
        coordinates: { lat: 12.9352, lng: 77.6245 }
      },
      customerLocation: {
        address: 'HSR Layout, Sector 3, Bengaluru',
        coordinates: { lat: 12.9121, lng: 77.6446 }
      },
      parcelDetails: {
        type: 'Clothing',
        description: 'Designer Shirts & Formal Wear',
        weight: '0.8 kg',
        dimensions: '35 x 25 x 10 cm',
        fragile: false,
        value: 3500
      },
      deliveryInstructions: 'Collect ₹3,500 cash on delivery. Check items before payment.',
      items: [
        { name: 'Formal Shirt (Blue)', quantity: 2, price: 1500 },
        { name: 'Formal Shirt (White)', quantity: 1, price: 1800 },
        { name: 'Gift Wrapping', quantity: 1, price: 200 }
      ],
      orderValue: 3500,
      deliveryFee: 65,
      partnerEarnings: 95, // Higher earnings for COD
      distance: '2.8 km',
      estimatedTime: '20 mins',
      status: ORDER_STATUSES.PENDING,
      orderTime: '2025-01-09T05:38:16Z', // 15 minutes ago
      paymentMethod: 'Cash on Delivery',
      codAmount: 3500
    }
  ]
};

function orderReducer(state, action) {
  switch (action.type) {
    case 'ACCEPT_ORDER':
      return {
        ...state,
        currentOrder: {
          ...action.payload,
          status: ORDER_STATUSES.ACCEPTED,
          acceptedAt: new Date()
        }
      };

    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          status: action.payload.status,
          [`${action.payload.status}At`]: new Date()
        }
      };

    case 'COMPLETE_ORDER':
      const completedOrder = {
        ...state.currentOrder,
        status: ORDER_STATUSES.COMPLETED,
        completedAt: new Date()
      };
      
      return {
        ...state,
        currentOrder: null,
        orderHistory: [...state.orderHistory, completedOrder],
        partnerBalance: state.partnerBalance + completedOrder.partnerEarnings,
        totalEarningsToday: state.totalEarningsToday + completedOrder.partnerEarnings,
        completedOrdersToday: state.completedOrdersToday + 1
      };

    case 'PROCESS_PAYMENT':
      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          status: ORDER_STATUSES.PAID,
          paidAt: new Date(),
          paymentProcessed: true
        }
      };

    case 'SIMULATE_BANK_TRANSFER':
      return {
        ...state,
        partnerBalance: state.partnerBalance - action.payload.amount,
        lastBankTransfer: {
          amount: action.payload.amount,
          transferredAt: new Date(),
          bankAccount: action.payload.bankAccount
        }
      };

    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const acceptOrder = (order) => {
    dispatch({ type: 'ACCEPT_ORDER', payload: order });
  };

  const updateOrderStatus = (status) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { status } });
  };

  const completeOrder = () => {
    dispatch({ type: 'COMPLETE_ORDER' });
  };

  const processPayment = () => {
    dispatch({ type: 'PROCESS_PAYMENT' });
  };

  const simulateBankTransfer = (amount, bankAccount) => {
    dispatch({ 
      type: 'SIMULATE_BANK_TRANSFER', 
      payload: { amount, bankAccount } 
    });
  };

  const value = {
    ...state,
    acceptOrder,
    updateOrderStatus,
    completeOrder,
    processPayment,
    simulateBankTransfer,
    ORDER_STATUSES
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  
  // Ensure demoOrders is always an array to prevent .length errors
  return {
    ...context,
    demoOrders: context.demoOrders || []
  };
}

export { ORDER_STATUSES };
