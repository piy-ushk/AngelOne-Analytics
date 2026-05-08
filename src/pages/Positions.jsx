import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Activity } from 'lucide-react';

const Positions = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await SmartAPIService.getPortfolio();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const positions = data?.positions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">Active Positions</h2>
        <p className="text-sm text-muted">Open intraday and carryforward positions</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-center">Net Qty</th>
                <th className="px-6 py-4 text-right">Avg Price</th>
                <th className="px-6 py-4 text-right">LTP</th>
                <th className="px-6 py-4 text-right">Unrealized P&L</th>
                <th className="px-6 py-4 text-right">Total P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {positions.length > 0 ? positions.map((item, idx) => {
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
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded border border-gray-200 text-[10px] font-bold text-muted uppercase tracking-tight">
                        {item.producttype}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-center ${parseInt(item.netqty) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.netqty}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right">₹{parseFloat(item.avgprice).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-right">₹{parseFloat(item.ltp).toLocaleString()}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₹{pnl.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      ₹{pnl.toLocaleString()}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-muted italic">
                    No active positions found.
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

export default Positions;
