"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Bell, Clock, FileText, MessageSquare, Newspaper } from "lucide-react"

interface ToolboxProps {
  darkMode: boolean
}

export function Toolbox({ darkMode }: ToolboxProps) {
  const [activeTab, setActiveTab] = useState("trade")

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

  const news = [
    { time: "09:30", currency: "GBP", importance: "high", title: "GDP m/m" },
    { time: "13:30", currency: "USD", importance: "high", title: "Non-Farm Payrolls" },
    { time: "15:00", currency: "EUR", importance: "medium", title: "ECB President Lagarde Speech" },
    { time: "23:50", currency: "JPY", importance: "low", title: "Monetary Base y/y" },
  ]

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="trade" onValueChange={setActiveTab}>
        <TabsList className="h-6 p-0 bg-gray-200 dark:bg-gray-800">
          <TabsTrigger value="trade" className="text-[10px] h-6 rounded-none">
            <Clock className="h-3 w-3 mr-1" />
            Trade
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[10px] h-6 rounded-none">
            <FileText className="h-3 w-3 mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-[10px] h-6 rounded-none">
            <Bell className="h-3 w-3 mr-1" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="news" className="text-[10px] h-6 rounded-none">
            <Newspaper className="h-3 w-3 mr-1" />
            News
          </TabsTrigger>
          <TabsTrigger value="mailbox" className="text-[10px] h-6 rounded-none">
            <MessageSquare className="h-3 w-3 mr-1" />
            Mailbox
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="m-0 p-0">
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
                  <th className="px-2 py-1 text-left">Symbol</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-right">Volume</th>
                  <th className="px-2 py-1 text-right">Price</th>
                  <th className="px-2 py-1 text-right">S/L</th>
                  <th className="px-2 py-1 text-right">T/P</th>
                  <th className="px-2 py-1 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-2 py-0.5">{order.id}</td>
                    <td className="px-2 py-0.5">{order.symbol}</td>
                    <td className="px-2 py-0.5">{order.type}</td>
                    <td className="px-2 py-0.5 text-right">{order.volume.toFixed(2)}</td>
                    <td className="px-2 py-0.5 text-right">{order.openPrice}</td>
                    <td className="px-2 py-0.5 text-right">{order.sl}</td>
                    <td className="px-2 py-0.5 text-right">{order.tp}</td>
                    <td className="px-2 py-0.5 text-right">{order.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Closed Trades</span>
          </div>

          <ScrollArea className="h-[calc(100%-24px)]">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-1 text-left">Order</th>
                  <th className="px-2 py-1 text-left">Symbol</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-right">Volume</th>
                  <th className="px-2 py-1 text-right">Open</th>
                  <th className="px-2 py-1 text-right">Close</th>
                  <th className="px-2 py-1 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {history.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-2 py-0.5">{trade.id}</td>
                    <td className="px-2 py-0.5">{trade.symbol}</td>
                    <td className="px-2 py-0.5">{trade.type}</td>
                    <td className="px-2 py-0.5 text-right">{trade.volume.toFixed(2)}</td>
                    <td className="px-2 py-0.5 text-right">{trade.openPrice}</td>
                    <td className="px-2 py-0.5 text-right">{trade.closePrice}</td>
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
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Price Alerts</span>
          </div>

          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">
            <AlertTriangle className="h-4 w-4 mx-auto mb-2" />
            No alerts set
          </div>

          <div className="p-2 flex justify-center">
            <Button size="sm" className="h-6 text-xs">
              Create Alert
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="news" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Economic Calendar</span>
          </div>

          <ScrollArea className="h-[calc(100%-24px)]">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-1 text-left">Time</th>
                  <th className="px-2 py-1 text-left">Currency</th>
                  <th className="px-2 py-1 text-center">Impact</th>
                  <th className="px-2 py-1 text-left">Event</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-2 py-0.5">{item.time}</td>
                    <td className="px-2 py-0.5">{item.currency}</td>
                    <td className="px-2 py-0.5 text-center">
                      <div
                        className={`inline-block w-2 h-2 rounded-full ${
                          item.importance === "high"
                            ? "bg-red-500"
                            : item.importance === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      ></div>
                    </td>
                    <td className="px-2 py-0.5">{item.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mailbox" className="m-0 p-0">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold">
            <span>Messages</span>
          </div>

          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-xs">
            <MessageSquare className="h-4 w-4 mx-auto mb-2" />
            No messages
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

