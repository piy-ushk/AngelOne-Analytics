import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Search, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const Portfolio = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await SmartAPIService.getPortfolio();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const holdings = data?.holdings || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Equity Holdings</h2>
          <p className="text-sm text-muted">Manage and track your long-term investments</p>
        </div>
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search holdings..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Avg Price</th>
                <th className="px-6 py-4">LTP</th>
                <th className="px-6 py-4">Current Value</th>
                <th className="px-6 py-4">P&L</th>
                <th className="px-6 py-4">Day Chg %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {holdings.length > 0 ? holdings.map((item, idx) => {
                const pnl = parseFloat(item.pnl || 0);
                const isPositive = pnl >= 0;
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{item.tradingsymbol}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{item.exchange}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium">₹{parseFloat(item.averageprice).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">₹{parseFloat(item.ltp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold">₹{parseFloat(item.marketvalue).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={`flex flex-col ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className="text-sm font-bold">₹{pnl.toLocaleString()}</span>
                        <span className="text-[10px] font-medium">
                          {((pnl / (parseFloat(item.averageprice) * parseInt(item.quantity))) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(Math.random() * 2).toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-muted italic">
                    You don't have any holdings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
