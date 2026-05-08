import { TOTP } from 'totp-generator';

// Environment Variables
const API_KEY = import.meta.env.VITE_ANGEL_ONE_API_KEY;
const CLIENT_CODE = import.meta.env.VITE_ANGEL_ONE_CLIENT_CODE;
const PASSWORD = import.meta.env.VITE_ANGEL_ONE_PASSWORD;
const TOTP_SECRET = import.meta.env.VITE_ANGEL_ONE_TOTP_SECRET;

const BASE_URL = '/api/angelone';

let sessionData = null;
let loginInProgress = false;
const getHeaders = (jwtToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '192.168.1.1',
    'X-ClientPublicIP': '106.193.147.98',
    'X-MACAddress': '02:00:00:00:00:00',
    'X-PrivateKey': API_KEY
  };

  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }

  return headers;
};

export const SmartAPIService = {
  /**
   * Performs login using Angel One REST API (V2)
   */
  login: async () => {
    if (sessionData) return { status: true, data: sessionData };
    if (loginInProgress) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (sessionData) {
            clearInterval(check);
            resolve({ status: true, data: sessionData });
          }
          if (!loginInProgress && !sessionData) {
            clearInterval(check);
            resolve({ status: false, message: 'Login already in progress or failed' });
          }
        }, 500);
      });
    }

    try {
      loginInProgress = true;
      console.log('Logging in to Angel One via REST V2...');
      
      const totpResult = await TOTP.generate(TOTP_SECRET);
      const token = totpResult.otp;
      console.log('Generated TOTP Token:', token);

      const response = await fetch(`${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          clientcode: CLIENT_CODE,
          password: PASSWORD,
          totp: token
        })
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        console.log('Login Result:', result);
        if (result.status && result.data) {
          sessionData = result.data;
          console.log('Login Successful');
          return { status: true, data: result.data };
        } else {
          throw new Error(result.message || 'Login failed');
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON login response:', text);
        throw new Error('Access Denied or Server Error. Please check API Key and App Status.');
      }
    } catch (error) {
      console.error('Login Error:', error.message);
      return { status: false, message: error.message };
    } finally {
      loginInProgress = false;
    }
  },

  /**
   * Fetches holdings, positions, trades, and profile
   */
  getPortfolio: async () => {
    try {
      if (!sessionData) {
        const loginRes = await SmartAPIService.login();
        if (!loginRes.status) throw new Error(loginRes.message);
      }

      // Parallel fetch for all data points
      const [holdingsRes, positionsRes, rmsRes, tradesRes, profileRes, ordersRes] = await Promise.all([
        fetch(`${BASE_URL}/rest/secure/angelbroking/portfolio/v1/getHolding`, { headers: getHeaders(sessionData.jwtToken) }),
        fetch(`${BASE_URL}/rest/secure/angelbroking/order/v1/getPosition`, { headers: getHeaders(sessionData.jwtToken) }),
        fetch(`${BASE_URL}/rest/secure/angelbroking/user/v1/getRMS`, { headers: getHeaders(sessionData.jwtToken) }),
        fetch(`${BASE_URL}/rest/secure/angelbroking/order/v1/getTradeBook`, { headers: getHeaders(sessionData.jwtToken) }),
        fetch(`${BASE_URL}/rest/secure/angelbroking/user/v1/getProfile`, { headers: getHeaders(sessionData.jwtToken) }),
        fetch(`${BASE_URL}/rest/secure/angelbroking/order/v1/getOrderBook`, { headers: getHeaders(sessionData.jwtToken) })
      ]);

      const [holdingsResult, positionsResult, rmsResult, tradesResult, profileResult, ordersResult] = await Promise.all([
        holdingsRes.ok ? holdingsRes.json() : { data: [] },
        positionsRes.ok ? positionsRes.json() : { data: [] },
        rmsRes.ok ? rmsRes.json() : { data: {} },
        tradesRes.ok ? tradesRes.json() : { data: [] },
        profileRes.ok ? profileRes.json() : { data: {} },
        ordersRes.ok ? ordersRes.json() : { data: [] }
      ]);

      console.log('Detailed API Responses:', {
        holdings: holdingsResult,
        positions: positionsResult,
        rms: rmsResult,
        trades: tradesResult,
        profile: profileResult,
        orders: ordersResult
      });

      const holdingsData = holdingsResult.data || [];
      let totalValue = 0;
      let totalPnl = 0;
      
      const categorizedHoldings = {
        equity: [],
        etf: [],
        mtf: [],
        other: []
      };

      holdingsData.forEach(item => {
        const value = parseFloat(item.marketvalue || 0);
        const pnl = parseFloat(item.pnl || 0);
        totalValue += value;
        totalPnl += pnl;

        // Basic categorization based on symbol naming or product type
        if (item.tradingsymbol?.endsWith('-ETF')) categorizedHoldings.etf.push(item);
        else if (item.product === 'MARGIN') categorizedHoldings.mtf.push(item);
        else categorizedHoldings.equity.push(item);
      });

      const rms = rmsResult.data || {};
      const actualBalance = parseFloat(rms.net || rms.availablecash || rms.availablemargin || 0);

      // Integrate Charges & P&L Logic
      const trades = tradesResult.data || [];
      const historical = {
        totalTrades: 48,
        totalCharges: 1682.28,
        netPnl: 890.12,
      };

      let sessionBrokerage = trades.length * 20;
      let sessionExchange = 0;
      let sessionStt = 0;
      trades.forEach(trade => {
        const value = parseFloat(trade.fillprice || 0) * parseInt(trade.fillqty || 0);
        if (trade.transactiontype === 'SELL') sessionStt += value * 0.000625;
        sessionExchange += value * 0.00053;
      });
      const sessionGst = (sessionBrokerage + sessionExchange) * 0.18;
      const sessionTotalCharges = sessionBrokerage + sessionGst + sessionStt + sessionExchange;
      
      const sessionDayPnl = parseFloat(positionsResult.data?.totalpnl || 0);
      const sessionNetPnl = sessionDayPnl - sessionTotalCharges;

      return {
        profile: profileResult.data || {},
        netWorth: totalValue + actualBalance,
        totalPnl: historical.netPnl + sessionNetPnl,
        dayPnl: sessionNetPnl,
        margin: actualBalance,
        holdings: holdingsData,
        categorizedHoldings,
        positions: positionsResult.data || [],
        trades: tradesResult.data || [],
        orders: ordersResult.data || [],
        charges: {
          session: sessionTotalCharges,
          combined: historical.totalCharges + sessionTotalCharges
        },
        rawRMS: rms
      };
    } catch (error) {
      console.error('Portfolio Error:', error.message);
      throw error;
    }
  },

  /**
   * Calculates and returns trading charges
   */
  getTradingCharges: async () => {
    try {
      const portfolio = await SmartAPIService.getPortfolio();
      const trades = portfolio.trades || [];
      
      // Historical data provided by user
      const historical = {
        totalTrades: 48,
        totalCharges: 1682.28,
        tradeCharges: 1587.88,
        nonTradeCharges: 94.4,
        netPnl: 890.12, // From user's app screenshot
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

      // Real-time calculation for today's session
      // For F&O (Options): ₹20 per trade + taxes
      let sessionBrokerage = 0;
      let sessionGst = 0;
      let sessionStt = 0;
      let sessionExchange = 0;
      
      trades.forEach(trade => {
        // Angel One charges ₹20 flat per executed order for F&O
        sessionBrokerage = trades.length * 20; 
        
        const value = parseFloat(trade.fillprice || 0) * parseInt(trade.fillqty || 0);
        
        // Approx tax logic for Options
        if (trade.transactiontype === 'SELL') {
          sessionStt += value * 0.000625; // 0.0625% on sell side for Options
        }
        sessionExchange += value * 0.00053; // 0.053% approx for NSE Options
      });

      sessionGst = (sessionBrokerage + sessionExchange) * 0.18; // 18% GST

      const sessionTotal = sessionBrokerage + sessionGst + sessionStt + sessionExchange;
      const sessionNetPnl = (portfolio.dayPnl || 0) - sessionTotal;

      return {
        historical,
        session: {
          trades: trades.length,
          brokerage: sessionBrokerage,
          gst: sessionGst,
          stt: sessionStt,
          exchange: sessionExchange,
          total: sessionTotal,
          netPnl: sessionNetPnl
        },
        combinedTotal: historical.totalCharges + sessionTotal,
        combinedNetPnl: historical.netPnl + sessionNetPnl
      };
    } catch (error) {
      console.error('Charges Calculation Error:', error);
      return null;
    }
  },

  /**
   * Market data subscription placeholder (Websocket 2.0 requires more complex handshake)
   */
  subscribeToMarketData: (callback) => {
    console.log('WebSocket 2.0 subscription requested');
    // For now, we'll simulate updates since WS 2.0 in browser needs specific binary handling (pako/protobuf)
    const interval = setInterval(() => {
      callback({ type: 'simulated', price: Math.random() * 100 });
    }, 5000);
    return () => clearInterval(interval);
  }
};

window.SmartAPIService = SmartAPIService;
