"use client"

import { useState } from "react"
import {
  ChevronDown,
  Clock,
  FileText,
  Settings,
  AlertTriangle,
  BarChart4,
  Percent,
  X,
  Trash2,
  Plus,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TradeTerminalPanelProps {
  activeSymbol: string
}

export function TradeTerminalPanel({ activeSymbol }: TradeTerminalPanelProps) {
  const [activeTab, setActiveTab] = useState("trade")
  const [orderType, setOrderType] = useState("market")
  const [orderDirection, setOrderDirection] = useState<"buy" | "sell">("buy")
  const [volume, setVolume] = useState("0.01")
  const [riskPercent, setRiskPercent] = useState(1)
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [useTrailingStop, setUseTrailingStop] = useState(false)
  const [trailingStopPoints, setTrailingStopPoints] = useState(50)

  const orders = [
    {
      id: 37959941,
      symbol: "GBPUSD",
      type: "Sell Stop",
      volume: 1.0,
      openPrice: 1.30149,
      sl: 1.32974,
      tp: 1.30149,
      profit: -0.0,
    },
    {
      id: 37959984,
      symbol: "EURUSD",
      type: "Buy",
      volume: 0.5,
      openPrice: 1.18319,
      sl: 1.181,
      tp: 1.186,
      profit: 25.5,
    },
  ]

  const history = [
    { id: 37959123, symbol: "EURUSD", type: "Buy", volume: 0.1, openPrice: 1.18245, closePrice: 1.18319, profit: 7.4 },
    {
      id: 37958765,
      symbol: "USDJPY",
      type: "Sell",
      volume: 0.25,
      openPrice: 106.312,
      closePrice: 106.239,
      profit: 17.15,
    },
    { id: 37957432, symbol: "GBPUSD", type: "Buy", volume: 0.5, openPrice: 1.32245, closePrice: 1.32411, profit: 83.0 },
  ]

  const calculateRiskBasedVolume = () => {
    // This would normally calculate position size based on risk percentage
    // For demo purposes, we'll just set a simple calculation
    const accountBalance = 10000
    const pipRisk = 50 // Assuming 50 pips stop loss
    const pipValue = 10 // Assuming $10 per pip for 1 lot

    const riskAmount = accountBalance * (riskPercent / 100)
    const calculatedVolume = riskAmount / (pipRisk * pipValue)

    setVolume(calculatedVolume.toFixed(2))
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="trade" onValueChange={setActiveTab}>
        <TabsList className="h-7 p-0 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="trade" className="text-[10px] h-7 rounded-none">
            <Clock className="h-3 w-3 mr-1" />
            Trade
          </TabsTrigger>
          <TabsTrigger value="positions" className="text-[10px] h-7 rounded-none">
            <BarChart4 className="h-3 w-3 mr-1" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-[10px] h-7 rounded-none">
            <FileText className="h-3 w-3 mr-1" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[10px] h-7 rounded-none">
            <Clock className="h-3 w-3 mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-[10px] h-7 rounded-none">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="m-0 p-0">
          <div className="flex h-full">
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 h-full">
              <ScrollArea className="h-full p-2">
                <div className="mb-2">
                  <label className="text-[10px] font-medium block mb-1">Symbol</label>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full h-7 text-xs px-2 py-0 justify-between">
                          {activeSymbol} <ChevronDown className="h-3 w-3 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>EURUSD</DropdownMenuItem>
                        <DropdownMenuItem>GBPUSD</DropdownMenuItem>
                        <DropdownMenuItem>USDJPY</DropdownMenuItem>
                        <DropdownMenuItem>USDCHF</DropdownMenuItem>
                        <DropdownMenuItem>XAUUSD</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="text-[10px] font-medium block mb-1">Order Type</label>
                  <div className="flex gap-1">
                    <Button
                      variant={orderType === "market" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => setOrderType("market")}
                    >
                      Market
                    </Button>
                    <Button
                      variant={orderType === "limit" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => setOrderType("limit")}
                    >
                      Limit
                    </Button>
                    <Button
                      variant={orderType === "stop" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => setOrderType("stop")}
                    >
                      Stop
                    </Button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-medium">Volume</label>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <label className="text-[10px]">Risk: {riskPercent}%</label>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-1">
                    <Input className="h-7 text-xs" value={volume} onChange={(e) => setVolume(e.target.value)} />
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={calculateRiskBasedVolume}>
                      Calculate
                    </Button>
                  </div>
                  <Slider
                    value={[riskPercent]}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onValueChange={(value) => setRiskPercent(value[0])}
                  />
                </div>

                {(orderType === "limit" || orderType === "stop") && (
                  <div className="mb-2">
                    <label className="text-[10px] font-medium block mb-1">Entry Price</label>
                    <Input className="h-7 text-xs" placeholder="0.00000" />
                  </div>
                )}

                <div className="mb-2">
                  <label className="text-[10px] font-medium block mb-1">Stop Loss</label>
                  <Input
                    className="h-7 text-xs"
                    placeholder="0.00000"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="text-[10px] font-medium block mb-1">Take Profit</label>
                  <Input
                    className="h-7 text-xs"
                    placeholder="0.00000"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="trailing-stop" checked={useTrailingStop} onCheckedChange={setUseTrailingStop} />
                    <Label htmlFor="trailing-stop" className="text-[10px] font-medium">
                      Trailing Stop
                    </Label>
                  </div>

                  {useTrailingStop && (
                    <div className="mt-1">
                      <Input
                        className="h-7 text-xs"
                        placeholder="Points"
                        value={trailingStopPoints}
                        onChange={(e) => setTrailingStopPoints(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  <div className="flex gap-1 mt-4">
                    <Button className="flex-1 h-8 bg-red-600 hover:bg-red-700" onClick={() => setOrderDirection("sell")}>
                      Sell
                    </Button>
                    <Button className="flex-1 h-8 bg-green-600 hover:bg-green-700" onClick={() => setOrderDirection("buy")}>
                      Buy
                    </Button>
                  </div>
              </ScrollArea>
            </div>

            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
                <span>Open Positions</span>
              </div>

              <ScrollArea className="h-[calc(100%-24px)]">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 text-[10px]">
                  <div className="font-medium">Balance: 10,000.00 USD</div>
                  <div>Equity: 10,025.50 USD | Free margin: 9,875.50 USD | Margin level: 1,250%</div>
                </div>

                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-2 py-1 text-left">Order</th>
                      <th className="px-2 py-1 text-left">Time</th>
                      <th className="px-2 py-1 text-left">Type</th>
                      <th className="px-2 py-1 text-right">Volume</th>
                      <th className="px-2 py-1 text-left">Symbol</th>
                      <th className="px-2 py-1 text-right">Price</th>
                      <th className="px-2 py-1 text-right">S/L</th>
                      <th className="px-2 py-1 text-right">T/P</th>
                      <th className="px-2 py-1 text-right">Current</th>
                      <th className="px-2 py-1 text-right">Swap</th>
                      <th className="px-2 py-1 text-right">Profit</th>
                      <th className="px-2 py-1 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <td className="px-2 py-0.5">{order.id}</td>
                        <td className="px-2 py-0.5">2023.09.03 09:17:43</td>
                        <td className="px-2 py-0.5">{order.type}</td>
                        <td className="px-2 py-0.5 text-right">{order.volume.toFixed(2)}</td>
                        <td className="px-2 py-0.5">{order.symbol}</td>
                        <td className="px-2 py-0.5 text-right">{order.openPrice}</td>
                        <td className="px-2 py-0.5 text-right">{order.sl}</td>
                        <td className="px-2 py-0.5 text-right">{order.tp}</td>
                        <td className="px-2 py-0.5 text-right">{order.symbol === "EURUSD" ? "1.18333" : "1.32430"}</td>
                        <td className="px-2 py-0.5 text-right">0.00</td>
                        <td
                          className={`px-2 py-0.5 text-right ${order.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {order.profit.toFixed(2)}
                        </td>
                        <td className="px-2 py-0.5 text-center">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm text-red-500">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Open Positions</span>
          </div>

          <ScrollArea className="h-[calc(100%-24px)]">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 text-[10px]">
              <div className="font-medium">Balance: 10,000.00 USD</div>
              <div>Equity: 10,025.50 USD | Free margin: 9,875.50 USD | Margin level: 1,250%</div>
            </div>

            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-1 text-left">Order</th>
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-right">Volume</th>
                  <th className="px-2 py-1 text-left">Symbol</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1 text-right">S/L</th>
                  <th className="px-2 py-1 text-right">T/P</th>
                  <th className="px-2 py-1 text-right">Current</th>
                  <th className="px-2 py-1 text-right">Swap</th>
                  <th className="px-2 py-1 text-right">Profit</th>
                  <th className="px-2 py-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.type === "Buy" || o.type === "Sell")
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-2 py-0.5">{order.id}</td>
                      <td className="px-2 py-0.5">2023.09.03 09:17:43</td>
                      <td className="px-2 py-0.5">{order.type}</td>
                      <td className="px-2 py-0.5 text-right">{order.volume.toFixed(2)}</td>
                      <td className="px-2 py-0.5">{order.symbol}</td>
                      <td className="px-2 py-0.5 text-right">{order.openPrice}</td>
                      <td className="px-2 py-0.5 text-right">{order.sl}</td>
                      <td className="px-2 py-0.5 text-right">{order.tp}</td>
                      <td className="px-2 py-0.5 text-right">{order.symbol === "EURUSD" ? "1.18333" : "1.32430"}</td>
                      <td className="px-2 py-0.5 text-right">0.00</td>
                      <td
                        className={`px-2 py-0.5 text-right ${order.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {order.profit.toFixed(2)}
                      </td>
                      <td className="px-2 py-0.5 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm text-red-500">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="orders" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Pending Orders</span>
          </div>

          <ScrollArea className="h-[calc(100%-24px)]">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-1 text-left">Order</th>
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-right">Volume</th>
                  <th className="px-2 py-1 text-left">Symbol</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1 text-right">S/L</th>
                  <th className="px-2 py-1 text-right">T/P</th>
                  <th className="px-2 py-1 text-right">Current</th>
                  <th className="px-2 py-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => o.type.includes("Stop") || o.type.includes("Limit"))
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-2 py-0.5">{order.id}</td>
                      <td className="px-2 py-0.5">2023.09.03 09:17:43</td>
                      <td className="px-2 py-0.5">{order.type}</td>
                      <td className="px-2 py-0.5 text-right">{order.volume.toFixed(2)}</td>
                      <td className="px-2 py-0.5">{order.symbol}</td>
                      <td className="px-2 py-0.5 text-right">{order.openPrice}</td>
                      <td className="px-2 py-0.5 text-right">{order.sl}</td>
                      <td className="px-2 py-0.5 text-right">{order.tp}</td>
                      <td className="px-2 py-0.5 text-right">{order.symbol === "EURUSD" ? "1.18333" : "1.32430"}</td>
                      <td className="px-2 py-0.5 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm text-red-500">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Account History</span>
          </div>

          <ScrollArea className="h-[calc(100%-24px)]">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-1 text-left">Order</th>
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-right">Volume</th>
                  <th className="px-2 py-1 text-left">Symbol</th>
                  <th className="px-2 py-1 text-right">Open</th>
                  <th className="px-2 py-1 text-right">Close</th>
                  <th className="px-2 py-1 text-right">Commission</th>
                  <th className="px-2 py-1 text-right">Swap</th>
                  <th className="px-2 py-1 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {history.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-2 py-0.5">{trade.id}</td>
                    <td className="px-2 py-0.5">2023.09.02 14:23:15</td>
                    <td className="px-2 py-0.5">{trade.type}</td>
                    <td className="px-2 py-0.5 text-right">{trade.volume.toFixed(2)}</td>
                    <td className="px-2 py-0.5">{trade.symbol}</td>
                    <td className="px-2 py-0.5 text-right">{trade.openPrice}</td>
                    <td className="px-2 py-0.5 text-right">{trade.closePrice}</td>
                    <td className="px-2 py-0.5 text-right">0.00</td>
                    <td className="px-2 py-0.5 text-right">0.00</td>
                    <td
                      className={`px-2 py-0.5 text-right ${trade.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {trade.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="alerts" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold flex justify-between items-center">
            <span>Price Alerts</span>
            <Button size="sm" variant="outline" className="h-6 text-[10px]">
              <Plus className="h-3 w-3 mr-1" />
              New Alert
            </Button>
          </div>

          <ScrollArea className="h-[calc(100%-24px)]">
            <div className="p-2">
              <div className="flex flex-col gap-2">
                <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">EURUSD</div>
                    <div className="text-blue-600 dark:text-blue-400 font-medium">Above 1.18500</div>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    Created: 2023.09.03 08:15:22 | Expires: Never
                  </div>
                  <div className="flex justify-end mt-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">GBPUSD</div>
                    <div className="text-blue-600 dark:text-blue-400 font-medium">Below 1.32000</div>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    Created: 2023.09.02 14:30:45 | Expires: 2023.09.10
                  </div>
                  <div className="flex justify-end mt-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

