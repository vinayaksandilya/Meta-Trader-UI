"use client"

import { useState } from "react"
import { Search, RefreshCw, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MarketWatchProps {
  onSymbolSelect: (symbol: string) => void
  activeSymbol: string
  darkMode: boolean
}

export function MarketWatch({ onSymbolSelect, activeSymbol, darkMode }: MarketWatchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSymbolInfo, setShowSymbolInfo] = useState<string | null>(null)

  const symbols = [
    { name: "EURUSD", bid: 1.18319, ask: 1.18333, change: 0.00014 },
    { name: "GBPUSD", bid: 1.32411, ask: 1.3243, change: 0.00019 },
    { name: "USDJPY", bid: 106.239, ask: 106.253, change: 0.014 },
    { name: "USDCHF", bid: 0.91419, ask: 0.9143, change: 0.00011 },
    { name: "AUDUSD", bid: 0.72053, ask: 0.72071, change: 0.00018 },
    { name: "NZDUSD", bid: 0.66312, ask: 0.66331, change: 0.00019 },
    { name: "USDCAD", bid: 1.31742, ask: 1.31761, change: 0.00019 },
    { name: "EURGBP", bid: 0.89356, ask: 0.89372, change: 0.00016 },
    { name: "EURJPY", bid: 125.712, ask: 125.736, change: 0.024 },
    { name: "EURCHF", bid: 1.08142, ask: 1.08161, change: 0.00019 },
    { name: "XAUUSD", bid: 1939.09, ask: 1939.39, change: 0.3 },
    { name: "XAGUSD", bid: 27.053, ask: 27.083, change: 0.03 },
  ]

  const filteredSymbols = symbols.filter((symbol) => symbol.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 flex items-center gap-1">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-6 text-xs"
        />
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Search className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="h-6 p-0 bg-gray-200 dark:bg-gray-800">
          <TabsTrigger value="all" className="text-[10px] h-6 rounded-none">
            All
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-[10px] h-6 rounded-none">
            Favorites
          </TabsTrigger>
          <TabsTrigger value="forex" className="text-[10px] h-6 rounded-none">
            Forex
          </TabsTrigger>
          <TabsTrigger value="metals" className="text-[10px] h-6 rounded-none">
            Metals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0 p-0">
          <div className="bg-[#e8f4ff] dark:bg-gray-700 px-2 py-1 flex justify-between items-center text-[10px] font-bold">
            <span>Symbol</span>
            <div className="flex gap-6">
              <span>Bid</span>
              <span>Ask</span>
              <span>Chg</span>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(100%-60px)]">
            <table className="w-full text-[11px]">
              <tbody>
                {filteredSymbols.map((symbol) => (
                  <tr
                    key={symbol.name}
                    className={`hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer ${activeSymbol === symbol.name ? "bg-blue-100 dark:bg-blue-900" : ""}`}
                    onClick={() => onSymbolSelect(symbol.name)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setShowSymbolInfo(symbol.name === showSymbolInfo ? null : symbol.name)
                    }}
                  >
                    <td className="px-2 py-0.5 flex items-center">
                      <ChevronDown
                        className={`h-3 w-3 mr-1 transition-transform ${showSymbolInfo === symbol.name ? "rotate-180" : ""}`}
                      />
                      {symbol.name}
                    </td>
                    <td
                      className={`text-right ${symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {symbol.bid.toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                    </td>
                    <td
                      className={`text-right ${symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {symbol.ask.toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                    </td>
                    <td className="text-right w-10">{symbol.change.toFixed(symbol.name.includes("JPY") ? 3 : 5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="m-0 p-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">No favorites added yet</div>
        </TabsContent>

        <TabsContent value="forex" className="m-0 p-0">
          <div className="bg-[#e8f4ff] dark:bg-gray-700 px-2 py-1 flex justify-between items-center text-[10px] font-bold">
            <span>Symbol</span>
            <div className="flex gap-6">
              <span>Bid</span>
              <span>Ask</span>
              <span>Chg</span>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(100%-60px)]">
            <table className="w-full text-[11px]">
              <tbody>
                {filteredSymbols
                  .filter((s) => !s.name.startsWith("XAU") && !s.name.startsWith("XAG"))
                  .map((symbol) => (
                    <tr
                      key={symbol.name}
                      className={`hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer ${activeSymbol === symbol.name ? "bg-blue-100 dark:bg-blue-900" : ""}`}
                      onClick={() => onSymbolSelect(symbol.name)}
                    >
                      <td className="px-2 py-0.5">{symbol.name}</td>
                      <td
                        className={`text-right ${symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {symbol.bid.toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                      </td>
                      <td
                        className={`text-right ${symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {symbol.ask.toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                      </td>
                      <td className="text-right w-10">{symbol.change.toFixed(symbol.name.includes("JPY") ? 3 : 5)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="metals" className="m-0 p-0">
          <div className="bg-[#e8f4ff] dark:bg-gray-700 px-2 py-1 flex justify-between items-center text-[10px] font-bold">
            <span>Symbol</span>
            <div className="flex gap-6">
              <span>Bid</span>
              <span>Ask</span>
              <span>Chg</span>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(100%-60px)]">
            <table className="w-full text-[11px]">
              <tbody>
                {filteredSymbols
                  .filter((s) => s.name.startsWith("XAU") || s.name.startsWith("XAG"))
                  .map((symbol) => (
                    <tr
                      key={symbol.name}
                      className={`hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer ${activeSymbol === symbol.name ? "bg-blue-100 dark:bg-blue-900" : ""}`}
                      onClick={() => onSymbolSelect(symbol.name)}
                    >
                      <td className="px-2 py-0.5">{symbol.name}</td>
                      <td
                        className={`text-right ${symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {symbol.bid.toFixed(2)}
                      </td>
                      <td
                        className={`text-right ${symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {symbol.ask.toFixed(2)}
                      </td>
                      <td className="text-right w-10">{symbol.change.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

