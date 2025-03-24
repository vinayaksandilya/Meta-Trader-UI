"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowDownRight, ArrowUpRight, ChevronDown, LineChart, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChartProps {
  symbol: string
  timeframe: string
  darkMode: boolean
}

export function Chart({ symbol, timeframe, darkMode }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [price, setPrice] = useState(generateRandomPrice(symbol))
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null)
  const [chartType, setChartType] = useState<"candle" | "line" | "bar">("candle")
  const [indicators, setIndicators] = useState<string[]>([])
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false)

  // Generate random price based on symbol
  function generateRandomPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      EURUSD: 1.18,
      GBPUSD: 1.32,
      USDJPY: 106.2,
      USDCHF: 0.91,
      XAUUSD: 1940.0,
    }

    const base = basePrices[symbol] || 1.0
    return base + (Math.random() * 0.01 - 0.005)
  }

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const oldPrice = price
      const newPrice = price + (Math.random() * 0.002 - 0.001)
      setPrice(newPrice)
      setPriceDirection(newPrice > oldPrice ? "up" : "down")

      // Reset direction after a short delay
      setTimeout(() => setPriceDirection(null), 1000)
    }, 2000)

    return () => clearInterval(interval)
  }, [price])

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set colors based on dark mode
    const textColor = darkMode ? "#e0e0e0" : "#333333"
    const gridColor = darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    const candleUpColor = "#26a69a"
    const candleDownColor = "#ef5350"

    // Draw background
    ctx.fillStyle = darkMode ? "#1a1a1a" : "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i < canvas.width; i += 80) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }

    // Draw price scale
    ctx.fillStyle = textColor
    ctx.font = "10px Arial"
    ctx.textAlign = "right"

    const priceStep = 0.001
    const pixelsPerPrice = 100
    const basePrice = Math.floor(price * 1000) / 1000

    for (let i = -5; i <= 5; i++) {
      const yPrice = basePrice + i * priceStep
      const y = canvas.height / 2 - i * pixelsPerPrice
      ctx.fillText(yPrice.toFixed(5), canvas.width - 5, y + 3)

      // Price line
      ctx.strokeStyle = gridColor
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width - 30, y)
      ctx.stroke()
    }

    // Draw time scale
    ctx.textAlign = "center"
    const now = new Date()

    for (let i = 0; i < 6; i++) {
      const time = new Date(now)
      time.setHours(now.getHours() - i)
      const timeStr = time.getHours() + ":00"
      const x = canvas.width - i * 80 - 40

      ctx.fillText(timeStr, x, canvas.height - 5)
    }

    // Draw candlesticks or line chart
    if (chartType === "candle") {
      // Sample data for candlesticks
      const candleData = Array.from({ length: 50 }, (_, i) => {
        const open = price - 0.005 + Math.random() * 0.01
        const close = price - 0.005 + Math.random() * 0.01
        const high = Math.max(open, close) + Math.random() * 0.002
        const low = Math.min(open, close) - Math.random() * 0.002
        return { open, close, high, low }
      })

      const candleWidth = 10
      const spacing = 5

      candleData.forEach((candle, i) => {
        const x = canvas.width - 40 - i * (candleWidth + spacing)
        if (x < 0) return

        const isUp = candle.close >= candle.open

        // Draw candle body
        ctx.fillStyle = isUp ? candleUpColor : candleDownColor
        const top = canvas.height / 2 - (candle.close - basePrice) * pixelsPerPrice
        const bottom = canvas.height / 2 - (candle.open - basePrice) * pixelsPerPrice
        const height = Math.abs(top - bottom)
        ctx.fillRect(x - candleWidth / 2, Math.min(top, bottom), candleWidth, height || 1)

        // Draw wicks
        ctx.strokeStyle = isUp ? candleUpColor : candleDownColor
        ctx.beginPath()
        ctx.moveTo(x, canvas.height / 2 - (candle.high - basePrice) * pixelsPerPrice)
        ctx.lineTo(x, Math.min(top, bottom))
        ctx.moveTo(x, Math.max(top, bottom))
        ctx.lineTo(x, canvas.height / 2 - (candle.low - basePrice) * pixelsPerPrice)
        ctx.stroke()
      })
    } else if (chartType === "line") {
      // Sample data for line chart
      const lineData = Array.from({ length: 100 }, (_, i) => {
        return price - 0.005 + Math.random() * 0.01
      })

      ctx.strokeStyle = "#2196f3"
      ctx.lineWidth = 1.5
      ctx.beginPath()

      lineData.forEach((p, i) => {
        const x = canvas.width - 40 - i * 8
        if (x < 0) return

        const y = canvas.height / 2 - (p - basePrice) * pixelsPerPrice
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    } else if (chartType === "bar") {
      // Sample data for bar chart
      const barData = Array.from({ length: 50 }, (_, i) => {
        const open = price - 0.005 + Math.random() * 0.01
        const close = price - 0.005 + Math.random() * 0.01
        const high = Math.max(open, close) + Math.random() * 0.002
        const low = Math.min(open, close) - Math.random() * 0.002
        return { open, close, high, low }
      })

      const spacing = 15

      barData.forEach((bar, i) => {
        const x = canvas.width - 40 - i * spacing
        if (x < 0) return

        const isUp = bar.close >= bar.open
        ctx.strokeStyle = isUp ? candleUpColor : candleDownColor

        // Draw high-low line
        ctx.beginPath()
        ctx.moveTo(x, canvas.height / 2 - (bar.high - basePrice) * pixelsPerPrice)
        ctx.lineTo(x, canvas.height / 2 - (bar.low - basePrice) * pixelsPerPrice)
        ctx.stroke()

        // Draw open tick
        ctx.beginPath()
        ctx.moveTo(x, canvas.height / 2 - (bar.open - basePrice) * pixelsPerPrice)
        ctx.lineTo(x - 3, canvas.height / 2 - (bar.open - basePrice) * pixelsPerPrice)
        ctx.stroke()

        // Draw close tick
        ctx.beginPath()
        ctx.moveTo(x, canvas.height / 2 - (bar.close - basePrice) * pixelsPerPrice)
        ctx.lineTo(x + 3, canvas.height / 2 - (bar.close - basePrice) * pixelsPerPrice)
        ctx.stroke()
      })
    }

    // Draw indicators if any
    if (indicators.includes("MA")) {
      // Simple moving average
      ctx.strokeStyle = "#ff9800"
      ctx.lineWidth = 1.5
      ctx.beginPath()

      const maData = Array.from({ length: 100 }, (_, i) => {
        return price - 0.002 + Math.sin(i * 0.1) * 0.002
      })

      maData.forEach((p, i) => {
        const x = canvas.width - 40 - i * 8
        if (x < 0) return

        const y = canvas.height / 2 - (p - basePrice) * pixelsPerPrice
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    if (indicators.includes("BB")) {
      // Bollinger bands
      ctx.strokeStyle = "rgba(156, 39, 176, 0.5)"
      ctx.lineWidth = 1

      // Upper band
      ctx.beginPath()
      Array.from({ length: 100 }, (_, i) => {
        const x = canvas.width - 40 - i * 8
        if (x < 0) return

        const y = canvas.height / 2 - (price + 0.003 + Math.sin(i * 0.1) * 0.001 - basePrice) * pixelsPerPrice
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // Lower band
      ctx.beginPath()
      Array.from({ length: 100 }, (_, i) => {
        const x = canvas.width - 40 - i * 8
        if (x < 0) return

        const y = canvas.height / 2 - (price - 0.003 + Math.sin(i * 0.1) * 0.001 - basePrice) * pixelsPerPrice
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }
  }, [canvasRef, price, darkMode, chartType, indicators])

  // Toggle indicator
  const toggleIndicator = (indicator: string) => {
    if (indicators.includes(indicator)) {
      setIndicators(indicators.filter((i) => i !== indicator))
    } else {
      setIndicators([...indicators, indicator])
    }
    setShowIndicatorMenu(false)
  }

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
      <div className="bg-gray-200 dark:bg-gray-800 px-2 py-1 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {symbol}, {timeframe}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={() => setChartType("candle")}>
              <div
                className={`w-3 h-4 ${chartType === "candle" ? "bg-primary" : "bg-gray-400 dark:bg-gray-600"}`}
              ></div>
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={() => setChartType("line")}>
              <LineChart
                className={`h-4 w-4 ${chartType === "line" ? "text-primary" : "text-gray-400 dark:text-gray-600"}`}
              />
            </Button>
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={() => setChartType("bar")}>
              <div
                className={`w-3 h-4 flex flex-col justify-between ${chartType === "bar" ? "text-primary" : "text-gray-400 dark:text-gray-600"}`}
              >
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </Button>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs rounded-sm flex items-center gap-1"
              onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
            >
              Indicators <ChevronDown className="h-3 w-3" />
            </Button>

            {showIndicatorMenu && (
              <div className="absolute top-5 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md z-10 w-40">
                <div
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => toggleIndicator("MA")}
                >
                  <input type="checkbox" checked={indicators.includes("MA")} readOnly />
                  <span>Moving Average</span>
                </div>
                <div
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => toggleIndicator("BB")}
                >
                  <input type="checkbox" checked={indicators.includes("BB")} readOnly />
                  <span>Bollinger Bands</span>
                </div>
                <div
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => toggleIndicator("RSI")}
                >
                  <input type="checkbox" checked={indicators.includes("RSI")} readOnly />
                  <span>RSI</span>
                </div>
                <div
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => toggleIndicator("MACD")}
                >
                  <input type="checkbox" checked={indicators.includes("MACD")} readOnly />
                  <span>MACD</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-none">
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-none">
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-none">
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-none">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="w-full h-full" />

        {/* Trading panel */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <div className="flex gap-1">
            <Button className="h-6 px-2 py-0 text-xs bg-red-600 hover:bg-red-700">SELL</Button>
            <Button variant="outline" className="h-6 px-2 py-0 text-xs">
              0.01
            </Button>
            <Button className="h-6 px-2 py-0 text-xs bg-green-600 hover:bg-green-700">BUY</Button>
          </div>

          <div className="flex gap-4 items-baseline">
            <div
              className={`text-xl font-bold ${priceDirection === "down" ? "text-red-500" : priceDirection === "up" ? "text-green-500" : "text-blue-500"}`}
            >
              {price.toFixed(5)}
              {priceDirection === "up" && <ArrowUpRight className="inline h-4 w-4 ml-1" />}
              {priceDirection === "down" && <ArrowDownRight className="inline h-4 w-4 ml-1" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

