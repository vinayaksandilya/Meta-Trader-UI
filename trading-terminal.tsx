"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Clock, FileText, MessageSquare, Newspaper, Settings } from "lucide-react"

interface TradingTerminalProps {
  darkMode: boolean
}

export function TradingTerminal({ darkMode }: TradingTerminalProps) {
  const [activeTab, setActiveTab] = useState("trade")
  const [orderType, setOrderType] = useState("market")
  const [orderDirection, setOrderDirection] = useState<"buy" | "sell">("buy")
  const [volume, setVolume] = useState("0.01")
  const [symbol, setSymbol] = useState("EURUSD")
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")

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
      symbol: "UKOSUSD",
      type: "Buy Stop",
      volume: 1.0,
      openPrice: 44.972,
      sl: 0.0,
      tp: 0.0,
      profit: 0.0,
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

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="trade" onValueChange={setActiveTab}>
        <TabsList className="h-6 p-0 bg-gray-200 dark:bg-gray-800">
          <TabsTrigger value="trade" className="text-[10px] h-6 rounded-none">
            <Clock className="h-3 w-3 mr-1" />
            Trade
          </TabsTrigger>
          <TabsTrigger value="exposure" className="text-[10px] h-6 rounded-none">
            Exposure
          </TabsTrigger>
          <TabsTrigger value="account" className="text-[10px] h-6 rounded-none">
            <FileText className="h-3 w-3 mr-1" />
            Account History
          </TabsTrigger>
          <TabsTrigger value="news" className="text-[10px] h-6 rounded-none">
            <Newspaper className="h-3 w-3 mr-1" />
            News
          </TabsTrigger>
          <TabsTrigger value="mailbox" className="text-[10px] h-6 rounded-none">
            <MessageSquare className="h-3 w-3 mr-1" />
            Mailbox
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px] h-6 rounded-none">
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="m-0 p-0">
          <div className="flex h-full">
            <div className="w-64 border-r border-gray-300 dark:border-gray-700 p-2">
              <div className="mb-2">
                <label className="text-[10px] font-medium block mb-1">Symbol</label>
                <div className="relative">
                  <select
                    className="w-full h-6 text-xs px-2 py-0 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-sm"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  >
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                    <option value="USDJPY">USDJPY</option>
                    <option value="USDCHF">USDCHF</option>
                    <option value="XAUUSD">XAUUSD</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1 h-4 w-4 pointer-events-none" />
                </div>
              </div>

              <div className="mb-2">
                <label className="text-[10px] font-medium block mb-1">Order Type</label>
                <div className="flex gap-1">
                  <Button
                    variant={orderType === "market" ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] flex-1"
                    onClick={() => setOrderType("market")}
                  >
                    Market
                  </Button>
                  <Button
                    variant={orderType === "pending" ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] flex-1"
                    onClick={() => setOrderType("pending")}
                  >
                    Pending
                  </Button>
                </div>
              </div>

              <div className="mb-2">
                <label className="text-[10px] font-medium block mb-1">Volume</label>
                <Input className="h-6 text-xs" value={volume} onChange={(e) => setVolume(e.target.value)} />
              </div>

              {orderType === "pending" && (
                <div className="mb-2">
                  <label className="text-[10px] font-medium block mb-1">Price</label>
                  <Input className="h-6 text-xs" placeholder="0.00000" />
                </div>
              )}

              <div className="mb-2">
                <label className="text-[10px] font-medium block mb-1">Stop Loss</label>
                <Input
                  className="h-6 text-xs"
                  placeholder="0.00000"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className="text-[10px] font-medium block mb-1">Take Profit</label>
                <Input
                  className="h-6 text-xs"
                  placeholder="0.00000"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                />
              </div>

              <div className="flex gap-1 mt-4">
                <Button className="flex-1 h-8 bg-red-600 hover:bg-red-700" onClick={() => setOrderDirection("sell")}>
                  Sell
                </Button>
                <Button className="flex-1 h-8 bg-green-600 hover:bg-green-700" onClick={() => setOrderDirection("buy")}>
                  Buy
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
                <span>Open Positions and Orders</span>
              </div>

              <ScrollArea className="h-[calc(100%-24px)]">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 text-[10px]">
                  <div className="font-medium">Balance: 19,975.78 AUD</div>
                  <div>Equity: 19,975.78 Free margin: 19,975.78</div>
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
                      <th className="px-2 py-1 text-right">Price</th>
                      <th className="px-2 py-1 text-right">Commission</th>
                      <th className="px-2 py-1 text-right">Swap</th>
                      <th className="px-2 py-1 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <td className="px-2 py-0.5 text-left" colSpan={12}>
                        <span className="font-medium">Balance: 19,975.78 AUD</span> Equity: 19,975.78 Free margin:
                        19,975.78
                      </td>
                    </tr>
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <td className="px-2 py-0.5">{order.id}</td>
                        <td className="px-2 py-0.5">2020.09.03 09:17:43</td>
                        <td className="px-2 py-0.5">{order.type}</td>
                        <td className="px-2 py-0.5 text-right">{order.volume.toFixed(2)}</td>
                        <td className="px-2 py-0.5">{order.symbol}</td>
                        <td className="px-2 py-0.5 text-right">{order.openPrice}</td>
                        <td className="px-2 py-0.5 text-right">{order.sl}</td>
                        <td className="px-2 py-0.5 text-right">{order.tp}</td>
                        <td className="px-2 py-0.5 text-right">0.000</td>
                        <td className="px-2 py-0.5 text-right">0.00</td>
                        <td className="px-2 py-0.5 text-right">0.00</td>
                        <td className="px-2 py-0.5 text-right">{order.profit.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exposure" className="m-0 p-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">No exposure data available</div>
        </TabsContent>

        <TabsContent value="account" className="m-0 p-0">
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
                    <td className="px-2 py-0.5">2020.09.02 14:23:15</td>
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

        <TabsContent value="news" className="m-0 p-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">No news available</div>
        </TabsContent>

        <TabsContent value="mailbox" className="m-0 p-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">No messages available</div>
        </TabsContent>

        <TabsContent value="settings" className="m-0 p-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">Terminal settings</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

