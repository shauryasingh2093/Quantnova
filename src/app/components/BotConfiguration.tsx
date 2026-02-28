import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Play, Pause, Info, TrendingUp, Shield, DollarSign, Settings, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { postOrder } from "../hooks/useApi";

export function BotConfiguration() {
  const [orderType, setOrderType] = useState("MARKET");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("0.001");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [riskLevel, setRiskLevel] = useState([3]);
  const [stopLoss, setStopLoss] = useState("5");
  const [takeProfit, setTakeProfit] = useState("10");
  const [autoReinvest, setAutoReinvest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const getRiskColor = () => {
    if (riskLevel[0] <= 2) return "text-emerald-400";
    if (riskLevel[0] <= 4) return "text-yellow-400";
    return "text-red-400";
  };

  const getRiskLabel = () => {
    if (riskLevel[0] <= 2) return "Conservative";
    if (riskLevel[0] <= 4) return "Moderate";
    return "Aggressive";
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setOrderResult(null);
    try {
      const body: any = {
        symbol,
        side,
        type: orderType,
        quantity: parseFloat(quantity),
      };
      if (orderType === "LIMIT" || orderType === "STOP_LIMIT") {
        body.price = parseFloat(price);
      }
      if (orderType === "STOP_LIMIT") {
        body.stopPrice = parseFloat(stopPrice);
      }
      const res = await postOrder(body);
      setOrderResult({
        success: true,
        message: `Order #${res.order.orderId} placed successfully!`,
        details: res.order,
      });
    } catch (err: any) {
      setOrderResult({
        success: false,
        message: err.message || "Order failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-semibold text-white">Bot Configuration</h1>
        <p className="text-slate-400">Configure and place orders on Binance Futures Testnet</p>
      </div>

      {/* Order Result Banner */}
      {orderResult && (
        <Card className={`p-4 ${orderResult.success ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <div className="flex items-start gap-3">
            {orderResult.success ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-400" />
            )}
            <div>
              <p className={`font-medium ${orderResult.success ? "text-emerald-400" : "text-red-400"}`}>
                {orderResult.message}
              </p>
              {orderResult.details && (
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-300">
                  <span>Symbol: <span className="text-white">{orderResult.details.symbol}</span></span>
                  <span>Side: <span className="text-white">{orderResult.details.side}</span></span>
                  <span>Status: <span className="text-white">{orderResult.details.status}</span></span>
                  <span>Executed: <span className="text-white">{orderResult.details.executedQty}</span></span>
                </div>
              )}
            </div>
            <button onClick={() => setOrderResult(null)} className="ml-auto text-slate-500 hover:text-slate-300">✕</button>
          </div>
        </Card>
      )}

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Placement */}
          <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Place Order</h2>
                <p className="text-sm text-slate-400">Execute trades on Binance Futures Testnet</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Symbol + Side Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symbol" className="text-slate-300">Symbol</Label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger id="symbol" className="mt-2 border-slate-700 bg-slate-950/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-900">
                      <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                      <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                      <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                      <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="side" className="text-slate-300">Side</Label>
                  <Select value={side} onValueChange={setSide}>
                    <SelectTrigger id="side" className="mt-2 border-slate-700 bg-slate-950/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-900">
                      <SelectItem value="BUY">
                        <span className="text-emerald-400 font-medium">BUY (Long)</span>
                      </SelectItem>
                      <SelectItem value="SELL">
                        <span className="text-red-400 font-medium">SELL (Short)</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Type */}
              <div>
                <Label htmlFor="orderType" className="text-slate-300">Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger id="orderType" className="mt-2 border-slate-700 bg-slate-950/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900">
                    <SelectItem value="MARKET">
                      <div>
                        <p className="font-medium">Market Order</p>
                        <p className="text-xs text-slate-400">Execute immediately at best price</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="LIMIT">
                      <div>
                        <p className="font-medium">Limit Order</p>
                        <p className="text-xs text-slate-400">Execute at specified price or better</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="STOP_LIMIT">
                      <div>
                        <p className="font-medium">Stop-Limit Order</p>
                        <p className="text-xs text-slate-400">Trigger limit order at stop price</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity" className="text-slate-300">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-2 border-slate-700 bg-slate-950/50 text-white"
                  placeholder="0.001"
                  step="0.001"
                />
              </div>

              {/* Price — shown for LIMIT and STOP_LIMIT */}
              {(orderType === "LIMIT" || orderType === "STOP_LIMIT") && (
                <div>
                  <Label htmlFor="price" className="text-slate-300">Price (USDT)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-2 border-slate-700 bg-slate-950/50 text-white"
                    placeholder="e.g. 65000"
                  />
                </div>
              )}

              {/* Stop Price — shown for STOP_LIMIT only */}
              {orderType === "STOP_LIMIT" && (
                <div>
                  <Label htmlFor="stopPrice" className="text-slate-300">Stop Price (USDT)</Label>
                  <Input
                    id="stopPrice"
                    type="number"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    className="mt-2 border-slate-700 bg-slate-950/50 text-white"
                    placeholder="e.g. 64500"
                  />
                </div>
              )}

              {/* Order type info */}
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 shrink-0 text-cyan-400" />
                  <div className="text-sm text-slate-300">
                    {orderType === "MARKET" && (
                      <p>Market orders execute immediately at the current best available price. Best for fast entries/exits.</p>
                    )}
                    {orderType === "LIMIT" && (
                      <p>Limit orders execute only at your specified price or better. The order stays open until filled or cancelled.</p>
                    )}
                    {orderType === "STOP_LIMIT" && (
                      <p>Stop-Limit orders become a limit order when the stop price is reached. Useful for setting automatic entry/exit triggers.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Management */}
          <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Risk Management</h2>
                <p className="text-sm text-slate-400">Set your risk parameters and limits</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Risk Level Slider */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-slate-300">Risk Level</Label>
                  <Badge className={`${getRiskColor()} bg-transparent border border-current`}>
                    {getRiskLabel()} ({riskLevel[0]}/5)
                  </Badge>
                </div>
                <Slider
                  value={riskLevel}
                  onValueChange={setRiskLevel}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Stop Loss & Take Profit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stopLoss" className="text-slate-300">Stop Loss (%)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="mt-2 border-slate-700 bg-slate-950/50 text-white"
                    placeholder="5.0"
                  />
                  <p className="mt-1 text-xs text-slate-500">Exit when loss exceeds this %</p>
                </div>

                <div>
                  <Label htmlFor="takeProfit" className="text-slate-300">Take Profit (%)</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="mt-2 border-slate-700 bg-slate-950/50 text-white"
                    placeholder="10.0"
                  />
                  <p className="mt-1 text-xs text-slate-500">Exit when profit reaches this %</p>
                </div>
              </div>

              {/* Auto Reinvest Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/50 p-4">
                <div className="flex-1">
                  <Label htmlFor="autoReinvest" className="text-slate-300">Auto-Reinvest Profits</Label>
                  <p className="text-sm text-slate-500">Automatically reinvest profits to compound returns</p>
                </div>
                <Switch
                  id="autoReinvest"
                  checked={autoReinvest}
                  onCheckedChange={setAutoReinvest}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Order Preview & Submit */}
          <Card className="border-slate-800/50 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Order Preview</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm text-slate-400">Symbol</span>
                  <span className="text-sm font-medium text-white">{symbol.replace("USDT", "/USDT")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm text-slate-400">Side</span>
                  <span className={`text-sm font-medium ${side === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                    {side}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm text-slate-400">Type</span>
                  <span className="text-sm font-medium text-white">{orderType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm text-slate-400">Quantity</span>
                  <span className="text-sm font-medium text-white">{quantity || "—"}</span>
                </div>
                {(orderType === "LIMIT" || orderType === "STOP_LIMIT") && (
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-sm text-slate-400">Price</span>
                    <span className="text-sm font-medium text-white">{price ? `$${price}` : "—"}</span>
                  </div>
                )}
                {orderType === "STOP_LIMIT" && (
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-sm text-slate-400">Stop Price</span>
                    <span className="text-sm font-medium text-white">{stopPrice ? `$${stopPrice}` : "—"}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm text-slate-400">Risk Level</span>
                  <span className={`text-sm font-medium ${getRiskColor()}`}>{getRiskLabel()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Stop Loss / TP</span>
                  <span className="text-sm font-medium text-white">-{stopLoss}% / +{takeProfit}%</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className={`w-full ${side === "BUY"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  }`}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : side === "BUY" ? (
                  <Play className="mr-2 h-5 w-5" />
                ) : (
                  <Pause className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? "Placing Order..." : `${side} ${symbol.replace("USDT", "/USDT")}`}
              </Button>
            </div>
          </Card>

          {/* Warning Card */}
          <Card className="border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex gap-2">
              <Info className="h-5 w-5 shrink-0 text-yellow-400" />
              <div className="text-sm text-slate-300">
                <p className="mb-1 font-medium text-yellow-400">Testnet Mode</p>
                <p>You are connected to Binance Futures Testnet. No real money is at risk. Orders execute with testnet funds.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
