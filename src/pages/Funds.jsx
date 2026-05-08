import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Activity, Wallet, Lock, TrendingUp } from 'lucide-react';

const Funds = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFunds = async () => {
      try {
        const res = await SmartAPIService.getPortfolio();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const rms = data?.rawRMS || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">Funds & Margin</h2>
        <p className="text-sm text-muted">Your account balance and margin details</p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-foreground text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/60 mb-2 uppercase tracking-widest">Available Margin</p>
          <h2 className="text-5xl md:text-6xl font-black mb-8">₹{parseFloat(rms.net || 0).toLocaleString()}</h2>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-foreground rounded-2xl font-black shadow-lg hover:shadow-xl transition-all active:scale-95">
              Add Funds
            </button>
            <button className="px-8 py-3 bg-white/10 text-white border border-white/20 rounded-2xl font-black hover:bg-white/20 transition-all active:scale-95">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Margin Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Wallet className="text-primary" size={24} />
            <h3 className="font-bold text-xl">Margin Breakdown</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center py-4 border-b border-gray-50">
              <span className="text-muted-foreground font-medium">Total Margin</span>
              <span className="font-bold">₹{parseFloat(rms.net || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-gray-50">
              <span className="text-muted-foreground font-medium">Used Margin</span>
              <span className="font-bold text-red-500">₹0.00</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-gray-50">
              <span className="text-muted-foreground font-medium">Net Balance</span>
              <span className="font-bold text-emerald-600">₹{parseFloat(rms.net || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-muted-foreground font-medium">Available Cash</span>
              <span className="font-bold">₹{parseFloat(rms.availablecash || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Blocked Margins */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="text-amber-500" size={24} />
            <h3 className="font-bold text-xl">Blocked Margins</h3>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">Span Margin</span>
              <span className="text-sm font-bold">₹0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">Exposure Margin</span>
              <span className="text-sm font-bold">₹0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">Option Premium</span>
              <span className="text-sm font-bold">₹0.00</span>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-emerald-500" size={24} />
              <h3 className="font-bold text-xl">Trading Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Realized P&L</p>
                <p className="text-lg font-black text-emerald-500">₹0.00</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Turnover</p>
                <p className="text-lg font-black">₹{data?.trades?.reduce((sum, t) => sum + (parseFloat(t.fillprice) * parseInt(t.fillqty)), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funds;
