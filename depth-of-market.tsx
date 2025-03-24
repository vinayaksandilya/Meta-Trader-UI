"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface DepthOfMarketProps {
  symbol: string
  darkMode: boolean
}

export function DepthOfMarket({ symbol, darkMode }: DepthOfMarketProps) {
  const [basePrice, setBasePrice] = useState(0)
  const [orders, setOrders] = useState<{ price: number; volume: number; type: "buy" | "sell" }[]>([])

  // Generate random price based on symbol
  function generateRandomPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      EURUSD: 1.18,
      GBPUSD: 1.32,
      USDJPY: 106.2,
      USDCHF: 0.91,
      XAUUSD: 1940.0,
    }

    return basePrices[symbol] || 1.0
  }

  // Generate random orders
  useEffect(() => {
    const price = generateRandomPrice(symbol)
    setBasePrice(price)

    const newOrders = []

    // Generate sell orders (higher prices)
    for (let i = 1; i <= 10; i++) {
      const orderPrice = price + i * 0.0001
      newOrders.push({
        price: orderPrice,
        volume: Math.floor(Math.random() * 10) + 1,
        type: "sell",
      })
    }

    // Generate buy orders (lower prices)
    for (let i = 1; i <= 10; i++) {
      const orderPrice = price - i * 0.0001
      newOrders.push({
        price: orderPrice,
        volume: Math.floor(Math.random() * 10) + 1,
        type: "buy",
      })
    }

    // Sort by price descending
    newOrders.sort((a, b) => b.price - a.price)

    setOrders(newOrders)
  }, [symbol])

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#e8f4ff] dark:bg-gray-700 px-2 py-1 flex justify-between items-center text-[10px] font-bold">
        <span>{symbol} Depth of Market</span>
      </div>

      <div className="p-2 flex justify-between">
        <Button className="h-6 px-2 py-0 text-xs bg-red-600 hover:bg-red-700">SELL</Button>
        <Button className="h-6 px-2 py-0 text-xs bg-green-600 hover:bg-green-700">BUY</Button>
      </div>

      <ScrollArea className="flex-1">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 text-left">Price</th>
              <th className="px-2 py-1 text-right">Volume</th>
              <th className="px-2 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className={`
                  ${order.type === "sell" ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"}
                  ${order.price === basePrice ? "font-bold" : ""}
                `}
              >
                <td
                  className={`px-2 py-0.5 ${order.type === "sell" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                >
                  {order.price.toFixed(symbol.includes("JPY") ? 3 : 5)}
                </td>
                <td className="px-2 py-0.5 text-right">{order.volume}</td>
                <td className="px-2 py-0.5 text-right">{(order.volume * 100000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  )
}

