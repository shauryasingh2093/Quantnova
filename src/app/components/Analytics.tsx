import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useApi } from "../hooks/useApi";

// Types
interface AccountData {
  balances: { asset: string; balance: number; availableBalance: number }[];
  totalEquity: number;
}

interface TradesData {
  trades: {
    id: number;
    symbol: string;
    side: string;
    price: string;
    quantity: string;
    realizedPnl: string;
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

// Chart mock data for analytics visualizations (these don't map to a single API)
const cumulativeROIData = [
  { date: "Week 1", roi: 2.3 },
  { date: "Week 2", roi: 5.1 },
  { date: "Week 3", roi: 4.8 },
  { date: "Week 4", roi: 7.2 },
  { date: "Week 5", roi: 9.5 },
  { date: "Week 6", roi: 11.8 },
  { date: "Week 7", roi: 13.2 },
  { date: "Week 8", roi: 15.6 },
];

const drawdownData = [
  { date: "Week 1", drawdown: -0.5 },
  { date: "Week 2", drawdown: -1.2 },
  { date: "Week 3", drawdown: -0.8 },
  { date: "Week 4", drawdown: -2.1 },
  { date: "Week 5", drawdown: -0.3 },
  { date: "Week 6", drawdown: -1.5 },
  { date: "Week 7", drawdown: -0.7 },
  { date: "Week 8", drawdown: -0.9 },
];

const COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#6366f1"];

const profitByTimeOfDay = [
  { hour: "00:00", profit: 120 },
  { hour: "04:00", profit: 80 },
  { hour: "08:00", profit: 340 },
  { hour: "12:00", profit: 520 },
  { hour: "16:00", profit: 680 },
  { hour: "20:00", profit: 420 },
];

export function Analytics() {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "All">("30D");

  // Live data
  const { data: account, loading: accLoading } = useApi<AccountData>("/api/account", 15000);
  const { data: tradesData } = useApi<TradesData>("/api/trades?symbol=BTCUSDT&limit=50", 15000);
  const { data: positionsData } = useApi<PositionsData>("/api/positions", 15000);

  // Derive stats from live data
  const totalEquity = account?.totalEquity ?? 0;
  const trades = tradesData?.trades ?? [];
  const tradeCount = trades.length;
  const positions = positionsData?.positions ?? [];

  // Calculate win/loss from realized PnL
  const wins = trades.filter(t => parseFloat(t.realizedPnl) > 0).length;
  const losses = trades.filter(t => parseFloat(t.realizedPnl) < 0).length;
  const winRate = tradeCount > 0 ? ((wins / tradeCount) * 100).toFixed(1) : "—";
  const totalPnl = trades.reduce((sum, t) => sum + parseFloat(t.realizedPnl), 0);

  // Asset distribution from trades
  const symbolMap = new Map<string, number>();
  trades.forEach(t => {
    symbolMap.set(t.symbol, (symbolMap.get(t.symbol) || 0) + 1);
  });
  const assetDistribution = Array.from(symbolMap.entries()).map(([name, count]) => ({
    name: name.replace("USDT", ""),
    value: tradeCount > 0 ? Math.round((count / tradeCount) * 100) : 0,
    trades: count,
  }));

  // Win rate by side
  const buyTrades = trades.filter(t => t.side === "BUY");
  const sellTrades = trades.filter(t => t.side === "SELL");
  const buyWins = buyTrades.filter(t => parseFloat(t.realizedPnl) > 0).length;
  const sellWins = sellTrades.filter(t => parseFloat(t.realizedPnl) > 0).length;
  const winRateByStrategy = [
    {
      strategy: "BUY",
      wins: buyWins,
      losses: buyTrades.length - buyWins,
      winRate: buyTrades.length > 0 ? parseFloat(((buyWins / buyTrades.length) * 100).toFixed(1)) : 0,
    },
    {
      strategy: "SELL",
      wins: sellWins,
      losses: sellTrades.length - sellWins,
      winRate: sellTrades.length > 0 ? parseFloat(((sellWins / sellTrades.length) * 100).toFixed(1)) : 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-semibold text-white">Analytics</h1>
          <p className="text-slate-400">Deep insights into your trading performance</p>
        </div>
        <div className="flex items-center gap-3">
          {accLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
            <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE DATA
          </Badge>
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="bg-slate-800/50">
              <TabsTrigger value="7D" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">7D</TabsTrigger>
              <TabsTrigger value="30D" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">30D</TabsTrigger>
              <TabsTrigger value="All" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics — LIVE */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Equity */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Equity</p>
              <h3 className="mt-2 text-2xl font-semibold text-cyan-400">
                ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {account?.balances?.length ?? 0} asset{(account?.balances?.length ?? 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-lg bg-cyan-500/10 p-3">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
        </Card>

        {/* Win Rate */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Win Rate</p>
              <h3 className="mt-2 text-2xl font-semibold text-emerald-400">{winRate}%</h3>
              <p className="mt-1 text-sm text-slate-500">{wins}W / {losses}L of {tradeCount} trades</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <Target className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* Realized P&L */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Realized P&L</p>
              <h3 className={`mt-2 text-2xl font-semibold ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(4)}
              </h3>
              <p className="mt-1 text-sm text-slate-500">From {tradeCount} trades</p>
            </div>
            <div className="rounded-lg bg-purple-500/10 p-3">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Open Positions */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Open Positions</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{positions.length}</h3>
              <p className="mt-1 text-sm text-slate-500">
                PnL: {positions.reduce((s, p) => s + p.unrealizedPnl, 0).toFixed(2)} USDT
              </p>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3">
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Cumulative ROI Chart */}
      <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Cumulative ROI Over Time</h2>
          <p className="text-sm text-slate-400">Track your return on investment growth</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumulativeROIData}>
            <defs>
              <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `${value}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              labelStyle={{ color: "#cbd5e1" }}
              formatter={(value: number) => [`${value}%`, "ROI"]}
            />
            <Area type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} fill="url(#colorROI)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Drawdown Chart */}
      <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Drawdown Analysis</h2>
          <p className="text-sm text-slate-400">Monitor portfolio value drops from peak</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={drawdownData}>
            <defs>
              <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `${value}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              labelStyle={{ color: "#cbd5e1" }}
              formatter={(value: number) => [`${value}%`, "Drawdown"]}
            />
            <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#colorDrawdown)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Win Rate by Side — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Win Rate by Side</h2>
              <p className="text-sm text-slate-400">Compare BUY vs SELL performance</p>
            </div>
          </div>

          {tradeCount > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={winRateByStrategy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="strategy" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ color: "#cbd5e1" }}
                  />
                  <Bar dataKey="winRate" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {winRateByStrategy.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.strategy}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">{item.wins}W</span>
                      <span className="text-red-400">{item.losses}L</span>
                      <Badge className="bg-cyan-500/20 text-cyan-400">{item.winRate}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
              No trade data available yet. Place some trades to see analytics.
            </div>
          )}
        </Card>

        {/* Asset Distribution — LIVE */}
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <PieChartIcon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Trade Distribution by Asset</h2>
              <p className="text-sm text-slate-400">Portfolio allocation breakdown</p>
            </div>
          </div>

          {assetDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {assetDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-slate-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">{item.trades} trades</span>
                      <span className="text-sm font-medium text-white">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
              No trade data available yet.
            </div>
          )}
        </Card>
      </div>

      {/* Profit by Time of Day */}
      <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Profit by Time of Day</h2>
          <p className="text-sm text-slate-400">Identify your most profitable trading hours</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={profitByTimeOfDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="hour" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `$${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
              labelStyle={{ color: "#cbd5e1" }}
              formatter={(value: number) => [`$${value}`, "Profit"]}
            />
            <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottom Stats — LIVE */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Total Trades Analyzed</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{tradeCount}</h3>
          <p className="mt-1 text-sm text-slate-500">BTCUSDT on testnet</p>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Account Assets</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {account?.balances?.map(b => b.asset).join(", ") || "Loading..."}
          </h3>
          <p className="mt-1 text-sm text-emerald-400">Binance Futures Testnet</p>
        </Card>

        <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
          <p className="text-sm text-slate-400">Active Positions</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{positions.length}</h3>
          <p className="mt-1 text-sm text-slate-500">Currently open</p>
        </Card>
      </div>
    </div>
  );
}
