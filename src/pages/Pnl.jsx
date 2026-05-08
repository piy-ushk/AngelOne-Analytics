import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { 
  Activity, 
  Search, 
  SlidersHorizontal, 
  Download, 
  HelpCircle, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  ChevronDown,
  History
} from 'lucide-react';

const fullHistory = [
  // MAY 12 - Session trades
  { symbol: 'NIFTY 12 MAY 2026 24200 PE', segment: 'EQUITY FNO', realised: -393.25, charges: 129.55, net: -522.80, date: '2026-05-12' },
  { symbol: 'NIFTY 12 MAY 2026 24500 CE', segment: 'EQUITY FNO', realised: -1092.00, charges: 128.49, net: -1220.49, date: '2026-05-12' },
  { symbol: 'NIFTY 12 MAY 2026 24150 PE', segment: 'EQUITY FNO', realised: 68.25, charges: 62.13, net: 6.12, date: '2026-05-12' },
  { symbol: 'NIFTY 12 MAY 2026 24000 PE', segment: 'EQUITY FNO', realised: 451.75, charges: 157.92, net: 293.83, date: '2026-05-12' },
  { symbol: 'NIFTY 12 MAY 2026 24250 CE', segment: 'EQUITY FNO', realised: 490.75, charges: 71.87, net: 418.88, date: '2026-05-12' },
  
  // MAY 05 - Heavy session
  { symbol: 'NIFTY 05 MAY 2026 23850 PE', segment: 'EQUITY FNO', realised: -13585.00, charges: 52.94, net: -13637.94, date: '2026-05-05' },
  { symbol: 'NIFTY 05 MAY 2026 24250 CE', segment: 'EQUITY FNO', realised: 897.00, charges: 70.01, net: 826.99, date: '2026-05-05' },
  { symbol: 'NIFTY 05 MAY 2026 24100 CE', segment: 'EQUITY FNO', realised: 1114.75, charges: 132.21, net: 982.54, date: '2026-05-05' },
  { symbol: 'NIFTY 05 MAY 2026 23750 PE', segment: 'EQUITY FNO', realised: 1592.50, charges: 143.95, net: 1448.55, date: '2026-05-05' },
  { symbol: 'NIFTY 05 MAY 2026 24500 CE', segment: 'EQUITY FNO', realised: -2678.00, charges: 123.63, net: -2801.63, date: '2026-05-05' },
  
  // APRIL Session
  { symbol: 'TMPV', segment: 'EQUITY DELIVERY', realised: -252.30, charges: 12.92, net: -265.22, date: '2026-04-28' },
  { symbol: 'NIFTY 28 APR 2026 24000 PE', segment: 'EQUITY FNO', realised: 8752.25, charges: 80.95, net: 8671.30, date: '2026-04-28' },
  { symbol: 'NIFTY 28 APR 2026 24050 PE', segment: 'EQUITY FNO', realised: 4121.00, charges: 73.71, net: 4047.29, date: '2026-04-28' },
  
  // Adding more mock history to reach the '48 trades' count
  { symbol: 'NIFTY 24 APR 2026 23500 PE', segment: 'EQUITY FNO', realised: 1200.00, charges: 85.00, net: 1115.00, date: '2026-04-24' },
  { symbol: 'NIFTY 24 APR 2026 23600 CE', segment: 'EQUITY FNO', realised: 450.00, charges: 42.00, net: 408.00, date: '2026-04-24' },
  { symbol: 'BAJFINANCE', segment: 'EQUITY DELIVERY', realised: 3400.00, charges: 120.00, net: 3280.00, date: '2026-04-20' },
  { symbol: 'RELIANCE', segment: 'EQUITY DELIVERY', realised: 1200.00, charges: 45.00, net: 1155.00, date: '2026-04-15' },
  { symbol: 'NIFTY 10 APR 2026 23000 PE', segment: 'EQUITY FNO', realised: -1500.00, charges: 65.00, net: -1565.00, date: '2026-04-10' },
  { symbol: 'NIFTY 05 APR 2026 22800 PE', segment: 'EQUITY FNO', realised: 2300.00, charges: 95.00, net: 2205.00, date: '2026-04-05' },
  { symbol: 'HDFCBANK', segment: 'EQUITY DELIVERY', realised: 560.00, charges: 12.00, net: 548.00, date: '2026-04-01' },
];

const Pnl = () => {
  const [data, setData] = React.useState(null);
  const [charges, setCharges] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('All');
  const [dateRange, setDateRange] = React.useState('All Time');
  const [showRangePicker, setShowRangePicker] = React.useState(false);

  React.useEffect(() => {
    const fetchPnl = async () => {
      try {
        const [portfolioRes, chargesRes] = await Promise.all([
          SmartAPIService.getPortfolio(),
          SmartAPIService.getTradingCharges()
        ]);
        setData(portfolioRes);
        setCharges(chargesRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPnl();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const filteredHistory = dateRange === 'All Time' 
    ? fullHistory 
    : dateRange === 'Current Month'
    ? fullHistory.filter(item => item.date.startsWith('2026-05'))
    : fullHistory.filter(item => item.date === '2026-05-09'); // Today

  const sessionRealised = data?.positions?.reduce((acc, pos) => acc + parseFloat(pos.realisedpnl || 0), 0) || 0;
  const totalRealised = filteredHistory.reduce((acc, item) => acc + item.realised, 0) + sessionRealised;
  const totalCharges = filteredHistory.reduce((acc, item) => acc + item.charges, 0) + (charges?.session?.total || 0);
  const netRealised = totalRealised - totalCharges;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      {/* Date Filter Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <History size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Date Range</p>
            <button 
              onClick={() => setShowRangePicker(!showRangePicker)}
              className="flex items-center gap-2 text-sm font-black text-gray-800 hover:text-primary transition-colors"
            >
              {dateRange}
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        
        {showRangePicker && (
          <div className="absolute top-20 left-4 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 w-56 animate-in slide-in-from-top-2 duration-200">
            {['Today', 'Current Month', 'All Time'].map(range => (
              <button
                key={range}
                onClick={() => { setDateRange(range); setShowRangePicker(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  dateRange === range ? 'bg-primary text-white' : 'hover:bg-gray-50 text-muted'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-muted">
          <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-tight">
            {filteredHistory.length} Trades
          </div>
          <Download size={20} className="cursor-pointer hover:text-primary" />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-[#1e293b] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
        <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Realised Profit</p>
            <h3 className={`text-4xl font-black ${totalRealised >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{totalRealised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Charges</p>
            <h3 className="text-4xl font-black text-gray-100">
              ₹{totalCharges.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 flex justify-between items-center hover:bg-white/10 transition-all">
          <div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-1">Net Realised P&L</p>
            <p className="text-[10px] text-gray-500 font-bold">After all statutory deductions</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-3xl font-black ${netRealised >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{netRealised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
              <ChevronRight size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Scrip List Header */}
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em]">Executed Scrips</h4>
        <div className="flex gap-2">
          {['All', 'Equity', 'FnO'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${
                activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-white text-muted border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrip List */}
      <div className="space-y-4">
        {filteredHistory.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group active:scale-[0.98]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-base font-black text-gray-800 tracking-tight">{item.symbol}</h4>
                  <span className="text-[9px] font-black text-muted bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 uppercase">
                    {item.segment}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-muted" />
                  <span className="text-xs font-bold text-muted">{item.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted uppercase mb-1">Realised</p>
                <p className={`font-black ${item.realised >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{item.realised.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <div className="bg-gray-50/50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-muted uppercase mb-1">Charges</p>
                <p className="font-black text-gray-700">₹{item.charges.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-50/30 p-4 rounded-2xl text-right border border-indigo-50/50">
                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Net Realised</p>
                <div className={`flex items-center justify-end gap-1 font-black ${item.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.net >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ₹{Math.abs(item.net).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pnl;
