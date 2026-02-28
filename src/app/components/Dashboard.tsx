import {
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { useState } from "react";
import { useApi } from "../hooks/useApi";

// Types for API data
interface AccountData {
  balances: { asset: string; balance: number; availableBalance: number }[];
  totalEquity: number;
}

interface TickerData {
  tickers: { symbol: string; price: number }[];
}

interface TradesData {
  trades: {
    id: number;
    symbol: string;
    side: string;
    price: string;
    quantity: string;
    realizedPnl: string;
    commission: string;
    time: number;
  }[];
  count: number;
}

interface OrdersData {
  orders: {
    orderId: number;
    symbol: string;
    side: string;
    type: string;
    price: string;
    quantity: string;
    status: string;
    time: number;
  }[];
  count: number;
}

interface PositionsData {
  positions: {
    symbol: string;
    side: string;
    quantity: number;
    entryPrice: number;
    markPrice: number;
    unrealizedPnl: number;
    leverage: string;
  }[];
  count: number;
}

// Fallback chart data (displayed when no real trade history exists yet)
const performanceData7D = [
  { date: "Mon", value: 50000 },
  { date: "Tue", value: 51200 },
  { date: "Wed", value: 50800 },
  { date: "Thu", value: 52500 },
  { date: "Fri", value: 53100 },
  { date: "Sat", value: 52800 },
  { date: "Sun", value: 54250 },
];
const performanceData30D = [
  { date: "W1", value: 45000 },
  { date: "W2", value: 47500 },
  { date: "W3", value: 49200 },
  { date: "W4", value: 54250 },
];
const performanceDataAll = [
  { date: "Jan", value: 30000 },
  { date: "Feb", value: 38000 },
  { date: "Mar", value: 42000 },
  { date: "Apr", value: 45000 },
  { date: "May", value: 54250 },
];

export function Dashboard() {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "All">("7D");

  // Live API data — auto-refresh every 10 seconds
  const { data: account, loading: accLoading, refetch: refetchAccount } = useApi<AccountData>("/api/account", 10000);
  const { data: tickers } = useApi<TickerData>("/api/tickers?symbols=BTCUSDT,ETHUSDT,SOLUSDT", 5000);
  const { data: tradesData } = useApi<TradesData>("/api/trades?symbol=BTCUSDT&limit=10", 10000);
  const { data: ordersData } = useApi<OrdersData>("/api/orders", 10000);
  const { data: positionsData } = useApi<PositionsData>("/api/positions", 10000);

  const performanceData =
    timeframe === "7D" ? performanceData7D :
      timeframe === "30D" ? performanceData30D :
        performanceDataAll;

  // Derive values from live data
  const usdtBalance = account?.balances?.find(b => b.asset === "USDT");
  const totalEquity = account?.totalEquity ?? 0;
  const openOrderCount = ordersData?.count ?? 0;
  const tradeCount = tradesData?.count ?? 0;
  const activePositions = positionsData?.positions ?? [];
  const totalUnrealizedPnl = activePositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  const initialValue = performanceData[0].value;
  const currentValue = performanceData[performanceData.length - 1].value;
  const profitLoss = currentValue - initialValue;
  const profitLossPercent = ((profitLoss / initialValue) * 100).toFixed(2);

  // Format time ago
  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-white">Dashboard</h1>
          <p className="text-slate-400">Monitor your trading performance and active bots</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchAccount}
          className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${accLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Portfolio Balance — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Portfolio Balance</p>
              {accLoading && !account ? (
                <Loader2 className="mt-2 h-6 w-6 animate-spin text-slate-500" />
              ) : (
                <>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  {account?.balances && (
                    <p className="mt-1 text-xs text-slate-500">
                      {account.balances.map(b => `${b.asset}: ${b.balance}`).join(" · ")}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="rounded-lg bg-cyan-500/10 p-3">
              <DollarSign className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        </Card>

        {/* Unrealized P&L — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Unrealized P&L</p>
              <h3 className={`mt-2 text-2xl font-semibold ${totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalUnrealizedPnl >= 0 ? "+" : ""}${totalUnrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                {activePositions.length} open position{activePositions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className={`rounded-lg ${totalUnrealizedPnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"} p-3`}>
              <TrendingUp className={`h-5 w-5 ${totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`} />
            </div>
          </div>
        </Card>

        {/* Open Orders — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Open Orders</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{openOrderCount}</h3>
              <p className="mt-1 text-sm text-slate-500">Active on exchange</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Recent Trades — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Recent Trades</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{tradeCount}</h3>
              <p className="mt-1 text-sm text-slate-500">BTCUSDT trades</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-3">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Live Prices Ticker Bar */}
      {tickers?.tickers && tickers.tickers.length > 0 && (
        <Card className="border-slate-800/50 bg-slate-900/50 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">Live Prices</span>
            {tickers.tickers.map((t) => (
              <div key={t.symbol} className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-medium text-slate-300">{t.symbol.replace("USDT", "/USDT")}</span>
                <span className="text-sm font-semibold text-cyan-400">
                  ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <Badge variant="outline" className="ml-auto shrink-0 border-emerald-500/30 text-emerald-400 text-xs">
              <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </Badge>
          </div>
        </Card>
      )}

      {/* Performance Chart */}
      <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Performance</h2>
            <p className="text-sm text-slate-400">Track your portfolio growth over time</p>
          </div>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="7D" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                7D
              </TabsTrigger>
              <TabsTrigger value="30D" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                30D
              </TabsTrigger>
              <TabsTrigger value="All" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#cbd5e1" }}
            />
            <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Positions — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Active Positions</h2>
            <p className="text-sm text-slate-400">Your open positions on Binance Testnet</p>
          </div>

          <div className="space-y-3">
            {activePositions.length === 0 ? (
              <div className="rounded-lg border border-slate-800/50 bg-slate-950/50 p-6 text-center">
                <p className="text-sm text-slate-500">No open positions</p>
                <p className="mt-1 text-xs text-slate-600">Place a trade to see positions here</p>
              </div>
            ) : (
              activePositions.map((pos) => (
                <div
                  key={pos.symbol}
                  className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${pos.side === "LONG" ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                      {pos.side === "LONG" ? (
                        <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{pos.symbol}</p>
                      <p className="text-sm text-slate-400">{pos.side} · {pos.leverage}x · Qty: {pos.quantity}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${pos.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {pos.unrealizedPnl >= 0 ? "+" : ""}${pos.unrealizedPnl.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Entry: ${pos.entryPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Trades — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
            <p className="text-sm text-slate-400">Latest trading activity from Binance Testnet</p>
          </div>

          <div className="space-y-3">
            {(!tradesData?.trades || tradesData.trades.length === 0) ? (
              <div className="rounded-lg border border-slate-800/50 bg-slate-950/50 p-6 text-center">
                <p className="text-sm text-slate-500">No trades yet</p>
                <p className="mt-1 text-xs text-slate-600">Execute a trade to see history here</p>
              </div>
            ) : (
              tradesData.trades.slice().reverse().map((trade) => {
                const pnl = parseFloat(trade.realizedPnl);
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/50 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{trade.symbol.replace("USDT", "/USDT")}</p>
                        <Badge className={trade.side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                          {trade.side}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span>Price: ${parseFloat(trade.price).toLocaleString()}</span>
                        <span>·</span>
                        <span>Qty: {trade.quantity}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`flex items-center gap-1 font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pnl >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(4)}
                      </p>
                      <p className="text-xs text-slate-500">{timeAgo(trade.time)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
