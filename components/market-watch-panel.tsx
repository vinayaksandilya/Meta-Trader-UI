"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, ArrowUp, ArrowDown, Star, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MarketWatchPanelProps {
  activeSymbol: string
  setActiveSymbol: (symbol: string) => void
}

interface MarketSymbol {
  name: string
  bid: number
  ask: number
  spread: number
  change: number
  changePercent: number
  high: number
  low: number
  category: "forex" | "crypto" | "indices" | "stocks" | "commodities"
}

export function MarketWatchPanel({ activeSymbol, setActiveSymbol }: MarketWatchPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSymbolInfo, setShowSymbolInfo] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [showMarketDepth, setShowMarketDepth] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "change">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Generate market symbols data
  const [symbols, setSymbols] = useState<MarketSymbol[]>([])

  useEffect(() => {
    // Generate sample market data
    const sampleSymbols: MarketSymbol[] = [
      {
        name: "EURUSD",
        bid: 1.18319,
        ask: 1.18333,
        spread: 1.4,
        change: 0.00127,
        changePercent: 0.11,
        high: 1.1845,
        low: 1.18201,
        category: "forex",
      },
      {
        name: "GBPUSD",
        bid: 1.32411,
        ask: 1.3243,
        spread: 1.9,
        change: 0.00215,
        changePercent: 0.16,
        high: 1.3255,
        low: 1.3231,
        category: "forex",
      },
      {
        name: "USDJPY",
        bid: 106.239,
        ask: 106.253,
        spread: 1.4,
        change: -0.127,
        changePercent: -0.12,
        high: 106.35,
        low: 106.12,
        category: "forex",
      },
      {
        name: "USDCHF",
        bid: 0.91419,
        ask: 0.9143,
        spread: 1.1,
        change: -0.00089,
        changePercent: -0.1,
        high: 0.9152,
        low: 0.9138,
        category: "forex",
      },
      {
        name: "BTCUSD",
        bid: 48235.75,
        ask: 48245.25,
        spread: 9.5,
        change: 1250.25,
        changePercent: 2.66,
        high: 48500.0,
        low: 47100.5,
        category: "crypto",
      },
      {
        name: "ETHUSD",
        bid: 3275.5,
        ask: 3277.25,
        spread: 1.75,
        change: 85.75,
        changePercent: 2.69,
        high: 3290.0,
        low: 3210.25,
        category: "crypto",
      },
      {
        name: "US500",
        bid: 4525.75,
        ask: 4526.25,
        spread: 0.5,
        change: 12.25,
        changePercent: 0.27,
        high: 4530.5,
        low: 4515.25,
        category: "indices",
      },
      {
        name: "US30",
        bid: 35125.5,
        ask: 35127.0,
        spread: 1.5,
        change: 85.5,
        changePercent: 0.24,
        high: 35150.0,
        low: 35050.25,
        category: "indices",
      },
      {
        name: "AAPL",
        bid: 175.25,
        ask: 175.3,
        spread: 0.05,
        change: 2.15,
        changePercent: 1.24,
        high: 176.5,
        low: 173.75,
        category: "stocks",
      },
      {
        name: "MSFT",
        bid: 325.75,
        ask: 325.85,
        spread: 0.1,
        change: 3.25,
        changePercent: 1.01,
        high: 326.5,
        low: 323.25,
        category: "stocks",
      },
      {
        name: "XAUUSD",
        bid: 1939.09,
        ask: 1939.39,
        spread: 0.3,
        change: 12.5,
        changePercent: 0.65,
        high: 1942.5,
        low: 1935.25,
        category: "commodities",
      },
      {
        name: "XAGUSD",
        bid: 27.053,
        ask: 27.083,
        spread: 0.03,
        change: 0.325,
        changePercent: 1.21,
        high: 27.125,
        low: 26.875,
        category: "commodities",
      },
    ]

    setSymbols(sampleSymbols)

    // Simulate price updates
    const interval = setInterval(() => {
      setSymbols((prevSymbols) =>
        prevSymbols.map((symbol) => {
          const bidChange = (Math.random() * 0.002 - 0.001) * (symbol.category === "crypto" ? 100 : 1)
          const newBid = symbol.bid + bidChange
          const newAsk = newBid + symbol.spread / 10000
          const newChange = symbol.change + bidChange
          const newChangePercent = (newChange / (newBid - newChange)) * 100

          return {
            ...symbol,
            bid: newBid,
            ask: newAsk,
            change: newChange,
            changePercent: newChangePercent,
            high: Math.max(symbol.high, newBid),
            low: Math.min(symbol.low, newBid),
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Filter symbols based on search term and active tab
  const filteredSymbols = symbols
    .filter(
      (symbol) =>
        symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (activeTab === "all" || symbol.category === activeTab),
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortDirection === "asc" ? a.change - b.change : b.change - a.change
      }
    })

  // Toggle sort
  const toggleSort = (column: "name" | "change") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 flex items-center gap-1">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-7 text-xs"
        />
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Search className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="h-7 p-0 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all" className="text-[10px] h-7 rounded-none">
            All
          </TabsTrigger>
          <TabsTrigger value="forex" className="text-[10px] h-7 rounded-none">
            Forex
          </TabsTrigger>
          <TabsTrigger value="crypto" className="text-[10px] h-7 rounded-none">
            Crypto
          </TabsTrigger>
          <TabsTrigger value="indices" className="text-[10px] h-7 rounded-none">
            Indices
          </TabsTrigger>
          <TabsTrigger value="stocks" className="text-[10px] h-7 rounded-none">
            Stocks
          </TabsTrigger>
          <TabsTrigger value="commodities" className="text-[10px] h-7 rounded-none">
            Commodities
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="m-0 p-0 flex-1 overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center text-[10px] font-bold">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("name")}>
              <span>Symbol</span>
              {sortBy === "name" &&
                (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
            </div>
            <div className="flex gap-4">
              <span>Bid</span>
              <span>Ask</span>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("change")}>
                <span>Chg%</span>
                {sortBy === "change" &&
                  (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-32px)]">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSymbols.map((symbol) => (
                <div
                  key={symbol.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", symbol.name)
                    // Dispatch a custom event to notify the chart workspace
                    window.dispatchEvent(new CustomEvent("symbol-drag-start", { detail: { symbol: symbol.name } }))
                  }}
                >
                  <div
                    className={`px-2 py-1 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${activeSymbol === symbol.name ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    onClick={() => setActiveSymbol(symbol.name)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setShowSymbolInfo(symbol.name === showSymbolInfo ? null : symbol.name)
                    }}
                  >
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-gray-300 dark:text-gray-600" />
                      <span className="text-xs">{symbol.name}</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span
                        className={
                          symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }
                      >
                        {symbol.category === "crypto" || symbol.category === "stocks" || symbol.category === "indices"
                          ? symbol.bid.toFixed(2)
                          : symbol.bid.toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                      </span>
                      <span
                        className={
                          symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }
                      >
                        {symbol.category === "crypto" || symbol.category === "stocks" || symbol.category === "indices"
                          ? symbol.ask.toFixed(2)
                          : symbol.ask.toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                      </span>
                      <span
                        className={
                          symbol.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }
                      >
                        {symbol.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {showSymbolInfo === symbol.name && (
                    <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-xs">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>Spread:</div>
                        <div>{symbol.spread} pips</div>
                        <div>High:</div>
                        <div>{symbol.high.toFixed(symbol.name.includes("JPY") ? 3 : 5)}</div>
                        <div>Low:</div>
                        <div>{symbol.low.toFixed(symbol.name.includes("JPY") ? 3 : 5)}</div>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px]"
                          onClick={() => setShowMarketDepth(!showMarketDepth)}
                        >
                          Market Depth
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="h-6 text-[10px]">
                              New Order
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Market Order</DropdownMenuItem>
                            <DropdownMenuItem>Limit Order</DropdownMenuItem>
                            <DropdownMenuItem>Stop Order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {showMarketDepth && (
                        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded">
                          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[10px] font-bold flex justify-between">
                            <span>Price</span>
                            <span>Volume</span>
                          </div>
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Sell orders (higher prices) */}
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={`sell-${i}`}
                                className="px-2 py-0.5 flex justify-between text-[10px] bg-red-50 dark:bg-red-900/20"
                              >
                                <span className="text-red-600 dark:text-red-400">
                                  {(symbol.ask + (i + 1) * 0.0001).toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                                </span>
                                <span>
                                  {Math.floor(Math.random() * 10) + 1}.{Math.floor(Math.random() * 100)}
                                </span>
                              </div>
                            ))}

                            {/* Current price */}
                            <div className="px-2 py-0.5 flex justify-between text-[10px] bg-gray-100 dark:bg-gray-800 font-bold">
                              <span>{symbol.ask.toFixed(symbol.name.includes("JPY") ? 3 : 5)}</span>
                              <span>
                                {Math.floor(Math.random() * 10) + 5}.{Math.floor(Math.random() * 100)}
                              </span>
                            </div>

                            {/* Buy orders (lower prices) */}
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={`buy-${i}`}
                                className="px-2 py-0.5 flex justify-between text-[10px] bg-green-50 dark:bg-green-900/20"
                              >
                                <span className="text-green-600 dark:text-green-400">
                                  {(symbol.bid - (i + 1) * 0.0001).toFixed(symbol.name.includes("JPY") ? 3 : 5)}
                                </span>
                                <span>
                                  {Math.floor(Math.random() * 10) + 1}.{Math.floor(Math.random() * 100)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

