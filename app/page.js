import Link from "next/link";
import { Truck, Zap, ShieldCheck, IndianRupee, Package, Star } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-100/20 to-success-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-success-100/20 to-brand-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Header */}
      <div className="flex justify-center pt-12 relative z-10">
        <div className="premium-card p-6 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">ParcelPro</h1>
            <p className="text-slate-500 font-medium">Premium Delivery Partner</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-slate-600 font-medium">4.9 Partner Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-4">Start Earning Premium</h2>
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            Join elite delivery partners and maximize your earnings
          </p>
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-slate-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>5K+ Active Partners</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
              <span>₹2L+ Monthly Earnings</span>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="space-y-3 mb-12">
          <div className="premium-card p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-md">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Premium Earnings</h3>
                <p className="text-slate-600 font-medium">Up to ₹150/hour • Flexible schedule</p>
              </div>
              <div className="premium-badge bg-success-50 border-success-200 text-success-700">
                Hot 🔥
              </div>
            </div>
          </div>
          
          <div className="premium-card p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Instant Payments</h3>
                <p className="text-slate-600 font-medium">Same-day settlements • Zero delays</p>
              </div>
              <div className="premium-badge bg-brand-50 border-brand-200 text-brand-700">
                New ⚡
              </div>
            </div>
          </div>
          
          <div className="premium-card p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Premium Support</h3>
                <p className="text-slate-600 font-medium">Dedicated success manager • Priority support</p>
              </div>
              <div className="premium-badge bg-purple-50 border-purple-200 text-purple-700">
                VIP 👑
              </div>
            </div>
          </div>
        </div>

        {/* Premium CTA Button */}
        <Link 
          href="/orders" 
          className="partner-button-primary w-full py-5 text-lg font-bold shadow-xl hover:shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:animate-pulse"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <Package className="w-6 h-6" />
            <span>Start Premium Journey</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </Link>
        
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Already a partner?{" "}
            <Link href="/auth/phone" className="text-brand-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8">
        <p className="text-xs text-slate-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
