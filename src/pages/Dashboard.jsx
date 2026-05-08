import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Activity,
  Layers,
  User,
  Search,
  Bell,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { SmartAPIService } from '../services/smartApi';

const portfolioHistory = [
  { name: '1 Apr', value: 8500 },
  { name: '10 Apr', value: 7800 },
  { name: '20 Apr', value: 9200 },
  { name: '28 Apr', value: 13500 }, // After ₹8.6K profit session
  { name: '1 May', value: 12800 },
  { name: '5 May', value: 7500 },  // After ₹13.6K loss session
  { name: '8 May', value: 8200 },
  { name: 'Today', value: 8795.67 },
];

const sectorData = [
  { name: 'Banking', value: 400, color: '#10b981' },
  { name: 'IT', value: 300, color: '#3b82f6' },
  { name: 'Energy', value: 200, color: '#f59e0b' },
  { name: 'Pharma', value: 150, color: '#8b5cf6' },
  { name: 'FMCG', value: 100, color: '#ec4899' },
];

const MetricCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-lg text-muted">
        <Icon size={20} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      )}
    </div>
    <p className="text-sm font-medium text-muted mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [portfolio, setPortfolio] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let unsubscribe = null;

    // Initialize Angel One connection and fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        const loginResponse = await SmartAPIService.login();
        
        if (loginResponse.status) {
          const data = await SmartAPIService.getPortfolio();
          setPortfolio(data);
          
          // Subscribe to real-time data
          unsubscribe = SmartAPIService.subscribeToMarketData((tick) => {
            console.log('Market Tick:', tick);
          });
        } else {
          setError(loginResponse.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Activity size={48} className="text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted font-medium">Fetching real-time data from Angel One...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <Activity size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p className="text-muted mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-foreground text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Try Connecting Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-foreground rounded-2xl flex items-center justify-center text-white shadow-xl">
            <User size={28} />
          </div>
          <div>
            <p className="text-sm text-muted font-medium mb-1 uppercase tracking-wider">{portfolio?.profile?.clientcode || 'Welcome back'}</p>
            <h2 className="text-3xl font-bold tracking-tight">{portfolio?.profile?.name || 'Piyush Kulkarni'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <Activity size={16} className="text-emerald-500" />
            Live Market
          </div>
          <button className="p-2 bg-white border border-gray-100 rounded-xl text-muted hover:text-foreground shadow-sm transition-all">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Net Worth" 
          value={`₹${portfolio?.netWorth?.toLocaleString() || '0'}`} 
          change={portfolio?.totalPnl >= 0 ? `+₹${portfolio?.totalPnl?.toLocaleString()}` : `₹${portfolio?.totalPnl?.toLocaleString()}`} 
          isPositive={portfolio?.totalPnl >= 0}
          icon={Layers}
        />
        <MetricCard 
          title="Total P&L" 
          value={`₹${portfolio?.totalPnl?.toLocaleString() || '0'}`} 
          change={portfolio && portfolio.netWorth > 0 ? `${((portfolio.totalPnl / (portfolio.netWorth || 1)) * 100).toFixed(2)}%` : '0.00%'} 
          isPositive={portfolio?.totalPnl >= 0}
          icon={TrendingUp}
        />
        <MetricCard 
          title="Day P&L" 
          value={`₹${portfolio?.dayPnl?.toLocaleString() || '0'}`} 
          change={portfolio?.dayPnl >= 0 ? 'Positive' : 'Negative'} 
          isPositive={portfolio?.dayPnl >= 0}
          icon={Activity}
        />
        <MetricCard 
          title="Available Margin" 
          value={`₹${portfolio?.margin?.toLocaleString() || '0'}`} 
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Portfolio History</h3>
            <div className="flex gap-2">
              {['1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
                <button 
                  key={period}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    period === '1M' ? 'bg-foreground text-white' : 'text-muted hover:bg-gray-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Allocation / Top Holdings */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Top Holdings</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolio?.holdings?.slice(0, 5).map(h => ({
                name: h.tradingsymbol,
                value: parseFloat(h.marketvalue)
              })) || sectorData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {(portfolio?.holdings?.slice(0, 5) || sectorData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {portfolio?.holdings?.slice(0, 5).map((item, index) => (
              <div key={item.tradingsymbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5] }}></div>
                  <span className="text-xs text-muted truncate max-w-[120px]">{item.tradingsymbol}</span>
                </div>
                <span className="text-xs font-bold">{portfolio?.netWorth ? ((parseFloat(item.marketvalue) / portfolio.netWorth) * 100).toFixed(1) : 0}%</span>
              </div>
            )) || sectorData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-muted">{item.name}</span>
                </div>
                <span className="text-xs font-bold">{(item.value / 11.5).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Grid: Trades and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trade History */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="text-primary" size={20} />
              <h3 className="font-bold text-lg">Today's Trades</h3>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {portfolio?.trades?.length || 0} Trades
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-muted uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {portfolio?.trades?.length > 0 ? (
                  portfolio.trades.slice(0, 8).map((trade, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-xs text-muted font-medium">{trade.filltime || 'Today'}</td>
                      <td className="py-4 font-bold text-sm">{trade.tradingsymbol}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black ${
                          trade.transactiontype === 'BUY' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        }`}>
                          {trade.transactiontype}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-medium">{trade.fillqty}</td>
                      <td className="py-4 text-sm font-medium">₹{parseFloat(trade.fillprice).toLocaleString()}</td>
                      <td className="py-4 text-sm font-bold">₹{(parseFloat(trade.fillprice) * parseInt(trade.fillqty)).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-muted italic">
                      <Activity size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No trades recorded in this session</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <PieChart className="text-primary" size={20} />
            <h3 className="font-bold text-lg">Asset Allocation</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Equity / Stocks', key: 'equity', color: 'bg-emerald-500', count: portfolio?.categorizedHoldings?.equity?.length || 0 },
              { label: 'ETFs', key: 'etf', color: 'bg-blue-500', count: portfolio?.categorizedHoldings?.etf?.length || 0 },
              { label: 'MTF (Margin Trading)', key: 'mtf', color: 'bg-amber-500', count: portfolio?.categorizedHoldings?.mtf?.length || 0 },
              { label: 'Cash & Margin', key: 'cash', color: 'bg-slate-400', count: 1, isCash: true },
            ].map((asset) => {
              const value = asset.isCash ? portfolio?.margin : portfolio?.categorizedHoldings?.[asset.key]?.reduce((sum, item) => sum + parseFloat(item.marketvalue), 0) || 0;
              const percentage = portfolio?.netWorth > 0 ? ((value / portfolio.netWorth) * 100).toFixed(1) : 0;
              
              return (
                <div key={asset.label} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${asset.color}`}></div>
                      <span className="text-sm font-bold text-gray-700">{asset.label}</span>
                    </div>
                    <span className="text-xs font-black text-muted">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${asset.color} rounded-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted-foreground font-medium">{asset.count} {asset.count === 1 ? 'Asset' : 'Assets'}</span>
                    <span className="text-[10px] font-bold">₹{value.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Analysis Score</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your portfolio is primarily weighted in {portfolio?.margin > (portfolio?.netWorth * 0.5) ? 'Cash' : 'Equity'}. 
              Maintain a balanced allocation to manage market risk effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
