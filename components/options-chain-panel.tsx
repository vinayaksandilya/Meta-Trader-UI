"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, Filter, Calendar, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface OptionsChainPanelProps {
  activeSymbol: string
}

interface OptionData {
  strike: number
  callBid: number
  callAsk: number
  callVolume: number
  callOpenInt: number
  callIV: number
  callDelta: number
  callGamma: number
  callTheta: number
  callVega: number
  putBid: number
  putAsk: number
  putVolume: number
  putOpenInt: number
  putIV: number
  putDelta: number
  putGamma: number
  putTheta: number
  putVega: number
}

export function OptionsChainPanel({ activeSymbol }: OptionsChainPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expiryDates, setExpiryDates] = useState<string[]>([])
  const [selectedExpiry, setSelectedExpiry] = useState<string>("")
  const [optionsData, setOptionsData] = useState<OptionData[]>([])
  const [showGreeks, setShowGreeks] = useState(false)
  const [sortBy, setSortBy] = useState<string>("strike")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [underlyingPrice, setUnderlyingPrice] = useState(0)
  const [strikeRange, setStrikeRange] = useState<[number, number]>([0, 0])
  const [filteredStrikes, setFilteredStrikes] = useState<OptionData[]>([])

  // Add tabs for Options, Volatility, and Analysis views
  const [activeView, setActiveView] = useState<"options" | "volatility" | "analysis">("options")

  // Add state for selected options to analyze
  const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([])

  // Add function to toggle option selection for analysis
  const toggleOptionSelection = (option: OptionData) => {
    if (selectedOptions.some((o) => o.strike === option.strike)) {
      setSelectedOptions(selectedOptions.filter((o) => o.strike !== option.strike))
    } else {
      setSelectedOptions([...selectedOptions, option])
    }
  }

  // Generate sample options data based on the active symbol
  useEffect(() => {
    // Generate underlying price based on symbol
    let price = 0
    switch (activeSymbol) {
      case "AAPL":
        price = 175.25
        break
      case "MSFT":
        price = 325.75
        break
      case "GOOGL":
        price = 142.5
        break
      case "AMZN":
        price = 178.35
        break
      case "TSLA":
        price = 245.2
        break
      case "SPY":
        price = 452.8
        break
      case "QQQ":
        price = 380.45
        break
      default:
        // For forex or other symbols, use a default price
        price = 100.0
    }
    setUnderlyingPrice(price)

    // Generate expiry dates (weekly and monthly options)
    const today = new Date()
    const dates: string[] = []

    // Add weekly expirations for the next 4 weeks
    for (let i = 1; i <= 4; i++) {
      const date = new Date(today)
      // Find the next Friday
      date.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7) + (i - 1) * 7)
      dates.push(date.toISOString().split("T")[0])
    }

    // Add monthly expirations for the next 3 months
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today)
      date.setMonth(today.getMonth() + i)
      // Set to the third Friday of the month
      date.setDate(1)
      const dayOfWeek = date.getDay()
      const targetDay = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 - dayOfWeek + 7
      date.setDate(1 + targetDay + 14)
      dates.push(date.toISOString().split("T")[0])
    }

    setExpiryDates(dates)
    setSelectedExpiry(dates[0])

    // Generate strike prices around the underlying price
    const strikePrices: OptionData[] = []
    const strikePriceStep = price < 50 ? 2.5 : price < 100 ? 5 : price < 200 ? 10 : 20
    const numStrikes = 15 // Number of strikes above and below the current price

    const baseStrike = Math.round(price / strikePriceStep) * strikePriceStep
    const minStrike = baseStrike - numStrikes * strikePriceStep
    const maxStrike = baseStrike + numStrikes * strikePriceStep

    setStrikeRange([minStrike, maxStrike])

    for (let strike = minStrike; strike <= maxStrike; strike += strikePriceStep) {
      // Calculate option values based on strike and underlying price
      const distanceFromUnderlying = Math.abs(strike - price)
      const timeToExpiry = 30 / 365 // Approximately 30 days

      // Very simplified option pricing model
      const callValue =
        Math.max(0, price - strike) + (Math.random() * 5 + 1) * Math.exp(-distanceFromUnderlying / price)
      const putValue = Math.max(0, strike - price) + (Math.random() * 5 + 1) * Math.exp(-distanceFromUnderlying / price)

      // Calculate implied volatility (simplified)
      const callIV = 0.2 + Math.random() * 0.3
      const putIV = 0.2 + Math.random() * 0.3

      // Calculate Greeks (simplified)
      const callDelta = strike < price ? 0.5 + Math.random() * 0.5 : Math.random() * 0.5
      const putDelta = strike > price ? -0.5 - Math.random() * 0.5 : -Math.random() * 0.5

      const gamma =
        Math.exp(-Math.pow(Math.log(price / strike), 2) / (2 * Math.pow(0.2, 2) * timeToExpiry)) /
        (price * 0.2 * Math.sqrt(timeToExpiry))

      const callTheta = (-price * gamma * 0.2) / (2 * Math.sqrt(timeToExpiry))
      const putTheta = callTheta + 0.1 * Math.random()

      const vega = price * Math.sqrt(timeToExpiry) * gamma

      strikePrices.push({
        strike,
        callBid: Number.parseFloat((callValue - 0.05 - Math.random() * 0.1).toFixed(2)),
        callAsk: Number.parseFloat((callValue + 0.05 + Math.random() * 0.1).toFixed(2)),
        callVolume: Math.floor(Math.random() * 1000),
        callOpenInt: Math.floor(Math.random() * 10000),
        callIV: Number.parseFloat(callIV.toFixed(2)),
        callDelta: Number.parseFloat(callDelta.toFixed(2)),
        callGamma: Number.parseFloat(gamma.toFixed(4)),
        callTheta: Number.parseFloat(callTheta.toFixed(3)),
        callVega: Number.parseFloat(vega.toFixed(3)),
        putBid: Number.parseFloat((putValue - 0.05 - Math.random() * 0.1).toFixed(2)),
        putAsk: Number.parseFloat((putValue + 0.05 + Math.random() * 0.1).toFixed(2)),
        putVolume: Math.floor(Math.random() * 1000),
        putOpenInt: Math.floor(Math.random() * 10000),
        putIV: Number.parseFloat(putIV.toFixed(2)),
        putDelta: Number.parseFloat(putDelta.toFixed(2)),
        putGamma: Number.parseFloat(gamma.toFixed(4)),
        putTheta: Number.parseFloat(putTheta.toFixed(3)),
        putVega: Number.parseFloat(vega.toFixed(3)),
      })
    }

    setOptionsData(strikePrices)
    setFilteredStrikes(strikePrices)
  }, [activeSymbol])

  // Filter and sort options data
  useEffect(() => {
    let filtered = [...optionsData]

    // Apply search filter if needed
    if (searchTerm) {
      const searchTermNum = Number.parseFloat(searchTerm)
      if (!isNaN(searchTermNum)) {
        filtered = filtered.filter((option) => Math.abs(option.strike - searchTermNum) < 20)
      }
    }

    // Sort the data
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "strike":
          aValue = a.strike
          bValue = b.strike
          break
        case "callVolume":
          aValue = a.callVolume
          bValue = b.callVolume
          break
        case "putVolume":
          aValue = a.putVolume
          bValue = b.putVolume
          break
        case "callOpenInt":
          aValue = a.callOpenInt
          bValue = b.callOpenInt
          break
        case "putOpenInt":
          aValue = a.putOpenInt
          bValue = b.putOpenInt
          break
        case "callIV":
          aValue = a.callIV
          bValue = b.callIV
          break
        case "putIV":
          aValue = a.putIV
          bValue = b.putIV
          break
        default:
          aValue = a.strike
          bValue = b.strike
      }

      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredStrikes(filtered)
  }, [optionsData, searchTerm, sortBy, sortDirection])

  // Toggle sort
  const toggleSort = (column: string) => {
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
          placeholder="Search strike..."
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

      <div className="px-2 pb-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-gray-500" />
          <Select value={selectedExpiry} onValueChange={setSelectedExpiry}>
            <SelectTrigger className="h-7 text-xs w-[120px]">
              <SelectValue placeholder="Expiry" />
            </SelectTrigger>
            <SelectContent>
              {expiryDates.map((date) => (
                <SelectItem key={date} value={date} className="text-xs">
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="text-xs py-0 h-5">
          {activeSymbol} @ {underlyingPrice.toFixed(2)}
        </Badge>

        <div className="flex items-center gap-1 ml-auto">
          <Switch
            id="show-greeks"
            checked={showGreeks}
            onCheckedChange={setShowGreeks}
            className="data-[state=checked]:bg-blue-500"
          />
          <Label htmlFor="show-greeks" className="text-xs cursor-pointer">
            Greeks
          </Label>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="h-7 p-0 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all" className="text-[10px] h-7 rounded-none">
            All
          </TabsTrigger>
          <TabsTrigger value="calls" className="text-[10px] h-7 rounded-none">
            Calls
          </TabsTrigger>
          <TabsTrigger value="puts" className="text-[10px] h-7 rounded-none">
            Puts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0 p-0 flex-1 overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex items-center text-[10px] font-bold">
            <div className="grid grid-cols-7 w-full">
              <div className="col-span-3 text-center text-blue-600 dark:text-blue-400">CALLS</div>
              <div
                className="flex items-center justify-center gap-1 cursor-pointer"
                onClick={() => toggleSort("strike")}
              >
                STRIKE
                {sortBy === "strike" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div className="col-span-3 text-center text-red-600 dark:text-red-400">PUTS</div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-32px)]">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-7 w-full bg-gray-50 dark:bg-gray-900 px-2 py-1 text-[9px] font-medium border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("callVolume")}>
                  Volume
                  {sortBy === "callVolume" && <ArrowUpDown className="h-2 w-2" />}
                </div>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("callOpenInt")}>
                  OI
                  {sortBy === "callOpenInt" && <ArrowUpDown className="h-2 w-2" />}
                </div>
                <div className="grid grid-cols-2">
                  <div>Bid</div>
                  <div>Ask</div>
                </div>
                <div className="text-center font-bold"></div>
                <div className="grid grid-cols-2">
                  <div>Bid</div>
                  <div>Ask</div>
                </div>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("putOpenInt")}>
                  OI
                  {sortBy === "putOpenInt" && <ArrowUpDown className="h-2 w-2" />}
                </div>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("putVolume")}>
                  Volume
                  {sortBy === "putVolume" && <ArrowUpDown className="h-2 w-2" />}
                </div>
              </div>

              {filteredStrikes.map((option) => {
                const isInTheMoney = option.strike < underlyingPrice
                const isPutInTheMoney = option.strike > underlyingPrice
                const isSelected = selectedOptions.some((o) => o.strike === option.strike)

                return (
                  <div
                    key={option.strike}
                    className={`grid grid-cols-7 w-full px-2 py-1 text-[10px] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    onClick={() => (activeView === "analysis" ? toggleOptionSelection(option) : null)}
                  >
                    <div>{option.callVolume.toLocaleString()}</div>
                    <div>{option.callOpenInt.toLocaleString()}</div>
                    <div
                      className={`grid grid-cols-2 ${isInTheMoney ? "bg-blue-50 dark:bg-blue-950/30 font-medium" : ""}`}
                    >
                      <div className="text-green-600 dark:text-green-400">{option.callBid.toFixed(2)}</div>
                      <div className="text-red-600 dark:text-red-400">{option.callAsk.toFixed(2)}</div>
                    </div>
                    <div className="text-center font-bold">{option.strike.toFixed(1)}</div>
                    <div
                      className={`grid grid-cols-2 ${isPutInTheMoney ? "bg-red-50 dark:bg-red-950/30 font-medium" : ""}`}
                    >
                      <div className="text-green-600 dark:text-green-400">{option.putBid.toFixed(2)}</div>
                      <div className="text-red-600 dark:text-red-400">{option.putAsk.toFixed(2)}</div>
                    </div>
                    <div>{option.putOpenInt.toLocaleString()}</div>
                    <div>{option.putVolume.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="calls" className="m-0 p-0 flex-1 overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex items-center text-[10px] font-bold">
            <div className="grid grid-cols-7 w-full">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("callVolume")}>
                Volume
                {sortBy === "callVolume" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("callOpenInt")}>
                OI
                {sortBy === "callOpenInt" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div>Bid</div>
              <div>Ask</div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("strike")}>
                Strike
                {sortBy === "strike" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("callIV")}>
                IV
                {sortBy === "callIV" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div>% Chg</div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-32px)]">
            <div className="min-w-[600px]">
              {filteredStrikes.map((option) => {
                const isInTheMoney = option.strike < underlyingPrice
                const isSelected = selectedOptions.some((o) => o.strike === option.strike)

                return (
                  <div
                    key={option.strike}
                    className={`grid grid-cols-7 w-full px-2 py-1 text-[10px] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 ${isInTheMoney ? "bg-blue-50 dark:bg-blue-950/30 font-medium" : ""} ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : ""}`}
                    onClick={() => (activeView === "analysis" ? toggleOptionSelection(option) : null)}
                  >
                    <div>{option.callVolume.toLocaleString()}</div>
                    <div>{option.callOpenInt.toLocaleString()}</div>
                    <div className="text-green-600 dark:text-green-400">{option.callBid.toFixed(2)}</div>
                    <div className="text-red-600 dark:text-red-400">{option.callAsk.toFixed(2)}</div>
                    <div className="font-bold">{option.strike.toFixed(1)}</div>
                    <div>{(option.callIV * 100).toFixed(1)}%</div>
                    <div className="text-green-600 dark:text-green-400">+{(Math.random() * 10).toFixed(2)}%</div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="puts" className="m-0 p-0 flex-1 overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex items-center text-[10px] font-bold">
            <div className="grid grid-cols-7 w-full">
              <div>% Chg</div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("putIV")}>
                IV
                {sortBy === "putIV" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("strike")}>
                Strike
                {sortBy === "strike" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div>Bid</div>
              <div>Ask</div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("putOpenInt")}>
                OI
                {sortBy === "putOpenInt" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("putVolume")}>
                Volume
                {sortBy === "putVolume" &&
                  (sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-32px)]">
            <div className="min-w-[600px]">
              {filteredStrikes.map((option) => {
                const isInTheMoney = option.strike > underlyingPrice
                const isSelected = selectedOptions.some((o) => o.strike === option.strike)

                return (
                  <div
                    key={option.strike}
                    className={`grid grid-cols-7 w-full px-2 py-1 text-[10px] border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 ${isInTheMoney ? "bg-red-50 dark:bg-red-950/30 font-medium" : ""} ${isSelected ? "bg-blue-100 dark:bg-blue-900/40" : ""}`}
                    onClick={() => (activeView === "analysis" ? toggleOptionSelection(option) : null)}
                  >
                    <div className="text-red-600 dark:text-red-400">-{(Math.random() * 10).toFixed(2)}%</div>
                    <div>{(option.putIV * 100).toFixed(1)}%</div>
                    <div className="font-bold">{option.strike.toFixed(1)}</div>
                    <div className="text-green-600 dark:text-green-400">{option.putBid.toFixed(2)}</div>
                    <div className="text-red-600 dark:text-red-400">{option.putAsk.toFixed(2)}</div>
                    <div>{option.putOpenInt.toLocaleString()}</div>
                    <div>{option.putVolume.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Greeks Panel */}
      {showGreeks && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="text-xs font-medium mb-1">Greeks</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
              <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400 mb-1">Call Greeks</div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  Delta: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.callDelta.toFixed(3) || "0.500"}
                </div>
                <div>
                  Gamma: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.callGamma.toFixed(4) || "0.0250"}
                </div>
                <div>
                  Theta: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.callTheta.toFixed(3) || "-0.050"}
                </div>
                <div>
                  Vega: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.callVega.toFixed(3) || "0.100"}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
              <div className="text-[10px] font-medium text-red-600 dark:text-red-400 mb-1">Put Greeks</div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  Delta: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.putDelta.toFixed(3) || "-0.500"}
                </div>
                <div>
                  Gamma: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.putGamma.toFixed(4) || "0.0250"}
                </div>
                <div>
                  Theta: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.putTheta.toFixed(3) || "-0.055"}
                </div>
                <div>
                  Vega: {filteredStrikes.find((o) => o.strike === underlyingPrice)?.putVega.toFixed(3) || "0.100"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add tabs for Options, Volatility, and Analysis views */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 text-xs font-medium ${
              activeView === "options" ? "border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveView("options")}
          >
            Options
          </button>
          <button
            className={`px-4 py-2 text-xs font-medium ${
              activeView === "volatility" ? "border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveView("volatility")}
          >
            Volatility
          </button>
          <button
            className={`px-4 py-2 text-xs font-medium ${
              activeView === "analysis" ? "border-b-2 border-blue-500" : "text-gray-500"
            }`}
            onClick={() => setActiveView("analysis")}
          >
            Analysis
          </button>
        </div>

        {activeView === "volatility" && (
          <div className="p-2">
            <div className="text-xs font-medium mb-2">Implied Volatility Surface</div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md h-40 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
                <div>Volatility Surface Chart</div>
                <div className="mt-1">Shows implied volatility across strikes and expirations</div>
              </div>
            </div>

            <div className="mt-2 text-xs">
              <div className="font-medium mb-1">Volatility Analysis</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                  <div className="text-[10px] font-medium mb-1">Historical vs Implied</div>
                  <div className="text-[10px]">
                    <div>Historical (30d): 22.5%</div>
                    <div>Current IV: 24.8%</div>
                    <div>IV Percentile: 65%</div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                  <div className="text-[10px] font-medium mb-1">Term Structure</div>
                  <div className="text-[10px]">
                    <div>30 Days: 24.8%</div>
                    <div>60 Days: 23.5%</div>
                    <div>90 Days: 22.9%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "analysis" && (
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium">Options Analysis</div>
              <Button variant="outline" size="sm" className="h-6 text-[10px]">
                Add Selected
              </Button>
            </div>

            {selectedOptions.length > 0 ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 mb-2">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-1">Type</th>
                        <th className="text-right py-1">Strike</th>
                        <th className="text-right py-1">Volume</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Theo</th>
                        <th className="text-right py-1">Volatility</th>
                        <th className="text-right py-1">Delta</th>
                        <th className="text-right py-1">Gamma</th>
                        <th className="text-right py-1">Theta</th>
                        <th className="text-right py-1">Vega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOptions.map((option) => (
                        <tr key={`call-${option.strike}`} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="py-1">Call</td>
                          <td className="text-right py-1">{option.strike.toFixed(1)}</td>
                          <td className="text-right py-1">{option.callVolume}</td>
                          <td className="text-right py-1">{option.callBid.toFixed(2)}</td>
                          <td className="text-right py-1">{(option.callBid + 0.02).toFixed(2)}</td>
                          <td className="text-right py-1">{(option.callIV * 100).toFixed(2)}%</td>
                          <td className="text-right py-1">{option.callDelta.toFixed(3)}</td>
                          <td className="text-right py-1">{option.callGamma.toFixed(6)}</td>
                          <td className="text-right py-1">{option.callTheta.toFixed(2)}</td>
                          <td className="text-right py-1">{option.callVega.toFixed(2)}</td>
                        </tr>
                      ))}
                      {selectedOptions.map((option) => (
                        <tr key={`put-${option.strike}`}>
                          <td className="py-1">Put</td>
                          <td className="text-right py-1">{option.strike.toFixed(1)}</td>
                          <td className="text-right py-1">{option.putVolume}</td>
                          <td className="text-right py-1">{option.putBid.toFixed(2)}</td>
                          <td className="text-right py-1">{(option.putBid + 0.02).toFixed(2)}</td>
                          <td className="text-right py-1">{(option.putIV * 100).toFixed(2)}%</td>
                          <td className="text-right py-1">{option.putDelta.toFixed(3)}</td>
                          <td className="text-right py-1">{option.putGamma.toFixed(6)}</td>
                          <td className="text-right py-1">{option.putTheta.toFixed(2)}</td>
                          <td className="text-right py-1">{option.putVega.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md h-40 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
                    <div>Options Analysis Chart</div>
                    <div className="mt-1">Shows price vs strike with theoretical values</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 text-center">
                <div className="text-gray-500 dark:text-gray-400 text-xs">Select options from the chain to analyze</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

