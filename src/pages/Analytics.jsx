import React from 'react';
import { SmartAPIService } from '../services/smartApi';
import { Activity, PieChart as PieIcon, BarChart3, TrendingUp, ChevronRight, Info } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const Analytics = () => {
  const [data, setData] = React.useState(null);
  const [charges, setCharges] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeSegment, setActiveSegment] = React.useState('Intraday');

  React.useEffect(() => {
    const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Activity className="animate-spin text-primary" size={32} />
    </div>
  );

  const sectorData = [
    { name: 'Equity', value: data?.categorizedHoldings?.equity?.length || 0, color: '#10b981' },
    { name: 'ETF', value: data?.categorizedHoldings?.etf?.length || 0, color: '#3b82f6' },
    { name: 'MTF', value: data?.categorizedHoldings?.mtf?.length || 0, color: '#f59e0b' },
    { name: 'Cash', value: 1, color: '#94a3b8' },
  ];

  const topMovers = [
    { name: 'BAJFINANCE', price: '7,320.50', change: '+1.32%', isPositive: true },
    { name: 'MARUTI', price: '10,542.30', change: '+1.37%', isPositive: true },
    { name: 'ICICIBANK', price: '965.40', change: '+1.49%', isPositive: true },
    { name: 'SBIN', price: '582.80', change: '+1.46%', isPositive: true },
    { name: 'RELIANCE', price: '2,842.30', change: '+1.15%', isPositive: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <p className="text-sm text-muted">Deep dive into your investment performance</p>
        </div>
      </div>

      {/* Segment Toggles */}
      <div className="flex p-1 bg-gray-100/50 rounded-2xl w-full md:w-fit">
        {['Intraday', 'Delivery'].map((segment) => (
          <button
            key={segment}
            onClick={() => setActiveSegment(segment)}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeSegment === segment 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-muted hover:text-gray-600'
            }`}
          >
            Equity {segment}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <PieIcon className="text-primary" size={24} />
            <h3 className="font-bold text-xl">Sector Allocation</h3>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {sectorData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-muted">
                    {((item.value / sectorData.reduce((s, i) => s + i.value, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Movers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-emerald-500" size={24} />
            <h3 className="font-bold text-xl">Top Movers</h3>
          </div>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Top Gainers</p>
            {topMovers.map((mover, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-xs text-muted shadow-sm group-hover:shadow-md transition-all">
                    {mover.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-sm">{mover.name}</p>
                    <p className="text-[10px] text-muted-foreground">Angel One Segment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm">₹{mover.price}</p>
                  <p className={`text-xs font-bold ${mover.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {mover.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trading Insights Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-primary" size={24} />
          <h3 className="font-bold text-xl">Trading Insights</h3>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-muted mb-4">
              <span className="text-sm font-bold uppercase tracking-wider">Net P&L</span>
              <Info size={14} />
            </div>
            <h3 className={`text-3xl font-black ${ (charges?.combinedNetPnl || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              { (charges?.combinedNetPnl || 0) >= 0 ? '+' : '' }
              ₹{ (charges?.combinedNetPnl || 0).toFixed(2) }
            </h3>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-muted mb-4">
              <span className="text-sm font-bold uppercase tracking-wider">Total Charges</span>
              <Info size={14} />
            </div>
            <h3 className="text-3xl font-black text-gray-900">
              ₹{ charges?.combinedTotal > 1000 
                ? `${(charges.combinedTotal / 1000).toFixed(1)}K` 
                : (charges?.combinedTotal || 0).toFixed(2) 
              }
            </h3>
          </div>
        </div>

        {/* Win Rate and Reward/Risk Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Win Percentage */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Total Trades</p>
                <h4 className="text-4xl font-black">23</h4>
                <p className="text-xs text-red-500 font-bold mt-2">8 losing trades</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Win Percentage</p>
                <h4 className="text-4xl font-black text-emerald-600">65.2%</h4>
                <p className="text-xs text-emerald-500 font-bold mt-2">15 winning trades</p>
              </div>
            </div>
            {/* Win/Loss Bar */}
            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-400" style={{ width: '34.8%' }}></div>
              <div className="h-full bg-emerald-500" style={{ width: '65.2%' }}></div>
            </div>
          </div>

          {/* Reward/Risk Ratio */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-8">Reward/ Risk Ratio</h4>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <h5 className="text-xl font-black">₹1.5K</h5>
                <p className="text-[10px] text-muted font-bold uppercase tracking-tighter mt-1">Avg reward/ trade</p>
              </div>
              <div>
                <h5 className="text-xl font-black">₹2.5K</h5>
                <p className="text-[10px] text-muted font-bold uppercase tracking-tighter mt-1">Avg loss/ trade</p>
              </div>
              <div className="text-right">
                <h5 className="text-xl font-black text-primary">0.6:1</h5>
                <p className="text-[10px] text-muted font-bold uppercase tracking-tighter mt-1">Reward : Risk</p>
              </div>
            </div>
            {/* Avg Reward/Loss Chart */}
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: '23 Apr', reward: 1200, loss: 0 },
                  { name: '24 Apr', reward: 2500, loss: 0 },
                  { name: '25 Apr', reward: 0, loss: -1800 },
                  { name: '26 Apr', reward: 6000, loss: 0 },
                  { name: '27 Apr', reward: 0, loss: -2500 },
                  { name: '28 Apr', reward: 1000, loss: 0 },
                  { name: '29 Apr', reward: 0, loss: 0 },
                  { name: '04 May', reward: 1200, loss: 0 },
                  { name: '05 May', reward: 0, loss: -14000 },
                  { name: '06 May', reward: 800, loss: -500 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <ReTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="reward" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="loss" stackId="a" fill="#f87171" radius={[0, 0, 4, 4]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-muted uppercase">Average Reward</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-400"></div>
                  <span className="text-[10px] font-bold text-muted uppercase">Average Loss</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm">
          Download Detailed Analysis Report
        </button>
      </div>
    </div>
  );
};

export default Analytics;
