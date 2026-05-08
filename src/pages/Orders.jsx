import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Activity, Clock } from 'lucide-react';

const Orders = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('ALL');

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await SmartAPIService.getPortfolio();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const orders = data?.orders || [];
  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Order Book</h2>
          <p className="text-sm text-muted">Today's orders and their status</p>
        </div>
        <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          {['ALL', 'OPEN', 'COMPLETE', 'CANCELLED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? 'bg-foreground text-white shadow-md' : 'text-muted hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Qty (Filled/Total)</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? filteredOrders.map((item, idx) => {
                const statusColor = {
                  'COMPLETE': 'text-green-600 bg-green-50 border-green-100',
                  'OPEN': 'text-blue-600 bg-blue-50 border-blue-100',
                  'CANCELLED': 'text-gray-500 bg-gray-50 border-gray-100',
                  'REJECTED': 'text-red-600 bg-red-50 border-red-100'
                }[item.status] || 'text-gray-500 bg-gray-50 border-gray-100';

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-muted font-medium">
                      {item.orderUpdateTime || item.updatetime || 'Today'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.transactiontype === 'BUY' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {item.transactiontype}
                          </span>
                          <span className="font-bold text-sm">{item.tradingsymbol}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase">{item.exchange} • {item.producttype}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-muted uppercase">{item.ordertype}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium">
                      <span className="text-emerald-600">{item.filledshares}</span> / {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right">
                      {item.price === "0" ? 'MARKET' : `₹${parseFloat(item.price).toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight ${statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-muted italic">
                    <Clock size={32} className="mx-auto mb-2 opacity-20" />
                    No orders found for the selected filter.
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

export default Orders;
