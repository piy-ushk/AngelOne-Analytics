import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Activity, Receipt, ShieldCheck, Info, ArrowUpRight, TrendingDown } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const historicalData = {
  totalTrades: 48,
  totalCharges: 1682.28,
  tradeCharges: 1587.88,
  nonTradeCharges: 94.4,
  breakdown: {
    brokerage: 945,
    gst: 195.54,
    sebi: 0.4,
    stt: 302,
    exchange: 140.94,
    stamp: 4,
    dp: 23.6,
    amc: 70.8
  }
};

const Charges = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCharges = async () => {
      try {
        const res = await SmartAPIService.getTradingCharges();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCharges();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const historical = data?.historical || historicalData;
  const session = data?.session || { total: 0, trades: 0 };
  const combinedTotal = data?.combinedTotal || historical.totalCharges;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Trading Charges & Taxes</h2>
          <p className="text-sm text-muted">Analysis of brokerage, taxes, and statutory levies</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
          <ShieldCheck size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Verified by Angel One</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Total Impact Card */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-3 bg-gray-50 rounded-2xl w-fit mb-6 text-primary">
              <Receipt size={24} />
            </div>
            <p className="text-sm font-medium text-muted mb-2">Total Lifecycle Charges</p>
            <h3 className="text-4xl font-black mb-2">₹{combinedTotal.toFixed(2)}</h3>
            <p className="text-xs text-muted font-medium mb-8">Calculated from {historical.totalTrades + session.trades} total trades</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">Historical</span>
              <span className="text-sm font-black">₹{historical.totalCharges}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">Today's Est.</span>
              <span className="text-sm font-black text-primary">₹{session.total.toFixed(2)}</span>
            </div>
            <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000" 
                style={{ width: `${(historical.totalCharges / combinedTotal) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl">Tax & Levy Breakdown</h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <Info size={14} />
              GST Inclusive
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { label: 'Brokerage (F&O)', value: historical.breakdown.brokerage + (session.brokerage || 0), color: 'bg-indigo-500' },
              { label: 'GST (18%)', value: historical.breakdown.gst + (session.gst || 0), color: 'bg-emerald-500' },
              { label: 'STT / CTT', value: historical.breakdown.stt + (session.stt || 0), color: 'bg-amber-500' },
              { label: 'Exchange Turnover', value: historical.breakdown.exchange + (session.exchange || 0), color: 'bg-blue-500' },
              { label: 'Stamp Duty', value: historical.breakdown.stamp, color: 'bg-rose-500' },
              { label: 'SEBI Charges', value: historical.breakdown.sebi, color: 'bg-slate-500' },
              { label: 'DP / AMC Charges', value: historical.breakdown.dp + historical.breakdown.amc, color: 'bg-purple-500' },
              { label: 'Live Session Total', value: session.total, color: 'bg-primary' },
            ].map((item) => (
              <div key={item.label} className="group cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900">₹{parseFloat(item.value).toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${(item.value / combinedTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charge Trend placeholder */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-xl">Charges Trend</h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight size={14} />
              Trading Active
            </span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Week 1', value: 450 },
              { name: 'Week 2', value: 380 },
              { name: 'Week 3', value: 520 },
              { name: 'Week 4', value: combinedTotal },
            ]}>
              <defs>
                <linearGradient id="colorCharges" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                formatter={(val) => [`₹${val}`, 'Accrued Charges']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCharges)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charges;
