import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Activity, Search, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

const historicalTrades = [
  { symbol: 'OPTIDX NIFTY May 12 2026 24150.00 PE (BT)', type: 'BUY', price: 96.00, qty: 65, date: '07-MAY-2026', brokerage: 20.00, charges: 6.42 },
  { symbol: 'OPTIDX NIFTY May 12 2026 24150.00 PE (BT)', type: 'SELL', price: 97.05, qty: 65, date: '07-MAY-2026', brokerage: 20.00, charges: 15.71 },
  { symbol: 'OPTIDX NIFTY May 12 2026 24200.00 PE (BT)', type: 'SELL', price: 110.00, qty: 65, date: '07-MAY-2026', brokerage: 20.00, charges: 17.58 },
  { symbol: 'OPTIDX NIFTY May 12 2026 24000.00 PE (BT)', type: 'SELL', price: 147.15, qty: 65, date: '06-MAY-2026', brokerage: 20.00, charges: 18.33 },
  { symbol: 'OPTIDX NIFTY May 12 2026 23900.00 PE (BT)', type: 'BUY', price: 134.70, qty: 65, date: '06-MAY-2026', brokerage: 20.00, charges: 7.21 },
  { symbol: 'OPTIDX NIFTY May  5 2026 23850.00 PE (BT)', type: 'SELL', price: 0.05, qty: 65, date: '05-MAY-2026', brokerage: 20.00, charges: 0.12 },
];

const Trades = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [expandedMonths, setExpandedMonths] = React.useState(['MAY-2026']);
  const [expandedDates, setExpandedDates] = React.useState(['07-MAY-2026']);

  React.useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await SmartAPIService.getPortfolio();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  // Group trades by month and then by date
  const allTrades = [
    ...(data?.trades?.map(t => ({
      symbol: t.tradingsymbol,
      type: t.transactiontype,
      price: parseFloat(t.fillprice),
      qty: parseInt(t.fillqty),
      date: 'TODAY',
      brokerage: 20,
      charges: 15.5
    })) || []),
    ...historicalTrades
  ];

  const grouped = allTrades.reduce((acc, trade) => {
    const month = trade.date === 'TODAY' ? 'MAY-2026' : trade.date.split('-').slice(1).join('-');
    const date = trade.date === 'TODAY' ? '09-MAY-2026' : trade.date;
    
    if (!acc[month]) acc[month] = {};
    if (!acc[month][date]) acc[month][date] = [];
    acc[month][date].push(trade);
    return acc;
  }, {});

  const toggleMonth = (m) => setExpandedMonths(prev => prev.includes(m) ? prev.filter(i => i !== m) : [...prev, m]);
  const toggleDate = (d) => setExpandedDates(prev => prev.includes(d) ? prev.filter(i => i !== d) : [...prev, d]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Selected Duration</p>
          <h2 className="text-lg font-black text-primary flex items-center gap-2">
            08 Feb 2026 - 08 May 2026
            <Calendar size={16} />
          </h2>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[10px] font-bold text-muted uppercase">Brokerage</p>
            <p className="font-black text-sm">₹945.00</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted uppercase text-primary">Total Charges</p>
            <p className="font-black text-sm text-primary">₹1,587.88</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search for a company or a stock" 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
        <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-muted hover:text-primary transition-all">
          <Filter size={20} />
        </button>
      </div>

      {/* Accordion Style List */}
      <div className="space-y-4">
        {Object.keys(grouped).map(month => (
          <div key={month} className="space-y-2">
            <button 
              onClick={() => toggleMonth(month)}
              className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{month}</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg">
                  {Object.values(grouped[month]).flat().length} Orders
                </span>
              </div>
              {expandedMonths.includes(month) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expandedMonths.includes(month) && (
              <div className="pl-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                {Object.keys(grouped[month]).map(date => (
                  <div key={date} className="space-y-2">
                    <button 
                      onClick={() => toggleDate(date)}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-600">{date}</span>
                        <span className="px-2 py-0.5 bg-gray-50 text-muted text-[10px] font-bold rounded-lg border border-gray-100">
                          {grouped[month][date].length} Orders
                        </span>
                      </div>
                      {expandedDates.includes(date) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {expandedDates.includes(date) && (
                      <div className="space-y-3 pt-1">
                        {grouped[month][date].map((trade, idx) => (
                          <div key={idx} className="bg-white border border-gray-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-gray-100 hover:border-l-primary">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-gray-800 leading-tight mb-1">{trade.symbol}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-muted bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase flex items-center gap-1">
                                      <Activity size={10} /> 65
                                    </span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${trade.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {trade.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-gray-50">
                              <div>
                                <p className="text-[10px] font-bold text-muted uppercase">Order value</p>
                                <p className="text-sm font-black text-gray-800">₹{(trade.price * trade.qty).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-muted uppercase">{trade.type === 'BUY' ? 'Buy Price' : 'Sell Price'}</p>
                                <p className="text-sm font-black text-gray-800">₹{trade.price.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-muted uppercase">Brokerage</p>
                                <p className="text-sm font-black text-gray-800">₹{trade.brokerage.toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-muted uppercase">Charges</p>
                                <p className="text-sm font-black text-gray-800">₹{trade.charges.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trades;
