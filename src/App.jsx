import React, { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import Positions from './pages/Positions'
import Orders from './pages/Orders'
import Trades from './pages/Trades'
import Funds from './pages/Funds'
import Analytics from './pages/Analytics'
import Charges from './pages/Charges'
import Pnl from './pages/Pnl'

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Portfolio':
        return <Portfolio />;
      case 'Positions':
        return <Positions />;
      case 'Orders':
        return <Orders />;
      case 'P&L':
        return <Pnl />;
      case 'Trades':
        return <Trades />;
      case 'Funds':
        return <Funds />;
      case 'Charges':
        return <Charges />;
      case 'Analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}

export default App
