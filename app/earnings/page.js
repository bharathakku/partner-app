'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '../contexts/OrderContext';
import { 
  IndianRupee, TrendingUp, Calendar, Clock,
  Download, ArrowUpRight, Banknote, CreditCard,
  CheckCircle2, Package, Trophy, History,
  User, MapPin, Timer
} from 'lucide-react';

export default function EarningsPage() {
  const router = useRouter();
  const { 
    partnerBalance, 
    totalEarningsToday, 
    completedOrdersToday, 
    orderHistory,
    lastBankTransfer,
    simulateBankTransfer 
  } = useOrder();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const bankAccount = {
    accountName: 'Bharath S Anand',
    accountNumber: '****1234',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0001234'
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }

    if (parseFloat(transferAmount) > partnerBalance) {
      alert('Transfer amount cannot exceed available balance');
      return;
    }

    setTransferring(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    simulateBankTransfer(parseFloat(transferAmount), bankAccount);
    setTransferSuccess(true);
    setTransferring(false);
    
    // Close modal after showing success
    setTimeout(() => {
      setShowTransferModal(false);
      setTransferSuccess(false);
      setTransferAmount('');
    }, 2000);
  };

  const formatTime = (date) => {
    // Handle both Date objects and ISO strings
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    // Handle both Date objects and ISO strings
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEarningsStats = () => {
    const today = new Date();
    const thisWeek = orderHistory.filter(order => {
      const orderDate = new Date(order.completedAt);
      const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    const thisMonth = orderHistory.filter(order => {
      const orderDate = new Date(order.completedAt);
      return orderDate.getMonth() === today.getMonth() && 
             orderDate.getFullYear() === today.getFullYear();
    });

    return {
      today: { count: completedOrdersToday, earnings: totalEarningsToday },
      week: { 
        count: thisWeek.length, 
        earnings: thisWeek.reduce((sum, order) => sum + order.partnerEarnings, 0) 
      },
      month: { 
        count: thisMonth.length, 
        earnings: thisMonth.reduce((sum, order) => sum + order.partnerEarnings, 0) 
      }
    };
  };

  const stats = getEarningsStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Earnings</h1>
              <p className="text-sm text-slate-600">Track your delivery earnings</p>
            </div>
            <button
              onClick={() => router.push('/orders')}
              className="flex items-center space-x-2 px-3 py-2 bg-brand-100 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-200 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>New Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-r from-success-500 to-success-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-success-100 text-sm mb-1">Available Balance</p>
              <div className="flex items-center text-3xl font-bold">
                <IndianRupee className="w-6 h-6 mr-1" />
                <span>{partnerBalance.toFixed(2)}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-success-400 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100 text-xs">Ready to transfer</p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-white text-success-600 px-4 py-2 rounded-lg font-semibold hover:bg-success-50 transition-colors flex items-center space-x-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Earnings Stats */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-4">Earnings Overview</h3>
          
          {/* Period Selector */}
          <div className="flex items-center space-x-2 mb-4">
            {[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Stats Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-brand-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-brand-600" />
                <span className="text-sm text-brand-600 font-medium">
                  {selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'This Month'}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {stats[selectedPeriod].count}
              </div>
              <p className="text-sm text-slate-600">Orders Delivered</p>
            </div>

            <div className="p-4 bg-success-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <IndianRupee className="w-5 h-5 text-success-600" />
                <TrendingUp className="w-4 h-4 text-success-600" />
              </div>
              <div className="flex items-center text-2xl font-bold text-slate-800 mb-1">
                <IndianRupee className="w-5 h-5" />
                <span>{stats[selectedPeriod].earnings.toFixed(2)}</span>
              </div>
              <p className="text-sm text-slate-600">Total Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bank Transfer */}
      {lastBankTransfer && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
              <Banknote className="w-5 h-5 mr-2 text-slate-600" />
              Recent Transfer
            </h4>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center text-green-800 font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    <span>{lastBankTransfer.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Transferred to {lastBankTransfer.bankAccount.accountNumber}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    {formatDate(lastBankTransfer.transferredAt)} at {formatTime(lastBankTransfer.transferredAt)}
                  </p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
            <History className="w-5 h-5 mr-2 text-slate-600" />
            Recent Deliveries ({orderHistory.length})
          </h4>
          
          {orderHistory.length === 0 ? (
            <div className="text-center py-6">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">No completed deliveries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderHistory.slice(0, 5).map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{order.id}</p>
                      <p className="text-sm text-slate-600">{order.customerName}</p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <span>{formatDate(order.completedAt)}</span>
                        <span>•</span>
                        <span>{formatTime(order.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-success-600 font-semibold">
                      <IndianRupee className="w-4 h-4" />
                      <span>{order.partnerEarnings}</span>
                    </div>
                    <p className="text-xs text-slate-500">Earned</p>
                  </div>
                </div>
              ))}
              
              {orderHistory.length > 5 && (
                <div className="text-center pt-3">
                  <button className="text-brand-600 text-sm font-medium hover:underline">
                    View All History
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {transferSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Transfer Successful!</h3>
                <p className="text-slate-600 mb-4">
                  ₹{transferAmount} has been transferred to your bank account
                </p>
                <div className="text-sm text-slate-500">
                  <p>It may take 1-2 business days to reflect in your account</p>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Transfer to Bank</h3>
                
                {/* Bank Account Info */}
                <div className="p-3 bg-slate-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-800">{bankAccount.bankName}</span>
                  </div>
                  <p className="text-sm text-slate-600">{bankAccount.accountName}</p>
                  <p className="text-sm text-slate-600">Account: {bankAccount.accountNumber}</p>
                </div>

                {/* Available Balance */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Available Balance
                  </label>
                  <div className="flex items-center text-lg font-semibold text-success-600">
                    <IndianRupee className="w-4 h-4" />
                    <span>{partnerBalance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Transfer Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transfer Amount
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      disabled={transferring}
                    />
                  </div>
                  
                  {/* Quick Amount Buttons */}
                  <div className="flex items-center space-x-2 mt-2">
                    {[1000, 2000, 5000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setTransferAmount(amount.toString())}
                        className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        disabled={transferring || amount > partnerBalance}
                      >
                        ₹{amount}
                      </button>
                    ))}
                    <button
                      onClick={() => setTransferAmount(partnerBalance.toString())}
                      className="px-3 py-1 text-xs bg-brand-100 text-brand-600 rounded-lg hover:bg-brand-200 transition-colors"
                      disabled={transferring}
                    >
                      All
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    disabled={transferring}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={transferring || !transferAmount}
                    className="flex-1 bg-success-500 hover:bg-success-600 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    {transferring ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
