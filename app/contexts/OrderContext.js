'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

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
  partnerBalance: 0,
  totalEarningsToday: 0,
  completedOrdersToday: 0,
};

function orderReducer(state, action) {
  switch (action.type) {
    case '__HYDRATE__':
      return {
        ...state,
        ...action.payload,
      };
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
  const userKeyRef = useRef(null)

  // Resolve current user id for per-user storage keys
  const getUserId = () => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('user_data') : null
      if (!raw) return null
      const u = JSON.parse(raw)
      return u?.id || u?._id || null
    } catch {
      return null
    }
  }

  // Load per-user persisted state on mount
  useEffect(() => {
    const uid = getUserId()
    userKeyRef.current = uid
    if (!uid) return
    try {
      const histRaw = window.localStorage.getItem(`order_history_${uid}`)
      const balRaw = window.localStorage.getItem(`partner_balance_${uid}`)
      const todayEarnRaw = window.localStorage.getItem(`today_earnings_${uid}`)
      const todayCountRaw = window.localStorage.getItem(`today_completed_${uid}`)
      const currentRaw = window.localStorage.getItem(`current_order_${uid}`)
      const loaded = {
        orderHistory: histRaw ? JSON.parse(histRaw) : [],
        partnerBalance: balRaw ? Number(balRaw) : initialState.partnerBalance,
        totalEarningsToday: todayEarnRaw ? Number(todayEarnRaw) : initialState.totalEarningsToday,
        completedOrdersToday: todayCountRaw ? Number(todayCountRaw) : initialState.completedOrdersToday,
        currentOrder: currentRaw ? JSON.parse(currentRaw) : null,
      }
      // Merge into state
      if (loaded.orderHistory.length || balRaw || todayEarnRaw || todayCountRaw) {
        dispatch({ type: '__HYDRATE__', payload: loaded })
      }
      if (loaded.currentOrder) {
        dispatch({ type: '__HYDRATE__', payload: { currentOrder: loaded.currentOrder } })
      }
    } catch {}
  }, [])

  const acceptOrder = (order) => {
    dispatch({ type: 'ACCEPT_ORDER', payload: order });
    const uid = userKeyRef.current || getUserId()
    if (uid) {
      try { window.localStorage.setItem(`current_order_${uid}`, JSON.stringify({ ...order, status: ORDER_STATUSES.ACCEPTED, acceptedAt: new Date() })) } catch {}
    }
  };

  const updateOrderStatus = (status) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { status } });
    const uid = userKeyRef.current || getUserId()
    if (uid) {
      try {
        const raw = window.localStorage.getItem(`current_order_${uid}`)
        const cur = raw ? JSON.parse(raw) : null
        if (cur) {
          const updated = { ...cur, status }
          updated[`${status}At`] = new Date()
          window.localStorage.setItem(`current_order_${uid}`, JSON.stringify(updated))
        }
      } catch {}
    }
  };

  const completeOrder = () => {
    dispatch({ type: 'COMPLETE_ORDER' });
    const uid = userKeyRef.current || getUserId()
    if (uid) {
      try { window.localStorage.removeItem(`current_order_${uid}`) } catch {}
    }
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

  // Persist per-user state when it changes
  useEffect(() => {
    const uid = userKeyRef.current || getUserId()
    if (!uid) return
    try {
      window.localStorage.setItem(`order_history_${uid}`, JSON.stringify(state.orderHistory || []))
      window.localStorage.setItem(`partner_balance_${uid}`, String(state.partnerBalance ?? 0))
      window.localStorage.setItem(`today_earnings_${uid}`, String(state.totalEarningsToday ?? 0))
      window.localStorage.setItem(`today_completed_${uid}`, String(state.completedOrdersToday ?? 0))
    } catch {}
  }, [state.orderHistory, state.partnerBalance, state.totalEarningsToday, state.completedOrdersToday])

  // Keep current order persisted when it changes
  useEffect(() => {
    const uid = userKeyRef.current || getUserId()
    if (!uid) return
    try {
      if (state.currentOrder) {
        window.localStorage.setItem(`current_order_${uid}`, JSON.stringify(state.currentOrder))
      } else {
        window.localStorage.removeItem(`current_order_${uid}`)
      }
    } catch {}
  }, [state.currentOrder])

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
  return context;
}

export { ORDER_STATUSES };
