"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Maximize2,
  BarChart2,
  CandlestickChartIcon as Candlestick,
  LineChart,
  Activity,
  Layers,
  Lightbulb,
  Zap,
} from "lucide-react"

interface TradingChartProps {
  symbol: string
  timeframe: string
  showAIOverlay?: boolean
  showOrderFlow?: boolean
  compact?: boolean
}

export function TradingChart({
  symbol,
  timeframe,
  showAIOverlay = false,
  showOrderFlow = false,
  compact = false,
}: TradingChartProps) {
  const [chartType, setChartType] = useState<"candles" | "line" | "bars" | "heikin-ashi">("candles")
  const [showIndicators, setShowIndicators] = useState(false)
  const [showDrawings, setShowDrawings] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null)
  const [localShowAIOverlay, setLocalShowAIOverlay] = useState(showAIOverlay)
  const [localShowOrderFlow, setLocalShowOrderFlow] = useState(showOrderFlow)
  const [chartTheme, setChartTheme] = useState<"light" | "dark">("dark")
  const [chartHeight, setChartHeight] = useState(400)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Sync props with local state
  useEffect(() => {
    setLocalShowAIOverlay(showAIOverlay)
    setLocalShowOrderFlow(showOrderFlow)
  }, [showAIOverlay, showOrderFlow])

  // Detect dark mode
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setChartTheme(isDarkMode ? "dark" : "light")

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkMode = document.documentElement.classList.contains("dark")
          setChartTheme(isDarkMode ? "dark" : "light")
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Construct TradingView URL with parameters
  const tradingViewUrl = `https://s.tradingview.com/widgetembed/?symbol=${symbol}&interval=${timeframe}&theme=${chartTheme}&style=${getChartStyle()}&withdateranges=1&studies=[]&hideideas=1&hidetrading=1`

  function getChartStyle() {
    switch (chartType) {
      case "line":
        return "1"
      case "bars":
        return "0"
      case "candles":
        return "8"
      case "heikin-ashi":
        return "8" // TradingView doesn't directly support Heikin-Ashi in the widget URL
      default:
        return "8"
    }
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!iframeRef.current) return

    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Adjust chart height based on container size
  useEffect(() => {
    const updateChartHeight = () => {
      const container = iframeRef.current?.parentElement
      if (container) {
        setChartHeight(container.clientHeight)
      }
    }

    updateChartHeight()
    window.addEventListener("resize", updateChartHeight)

    return () => {
      window.removeEventListener("resize", updateChartHeight)
    }
  }, [])

  // Drawing tools
  const drawingTools = [
    { id: "trend-line", name: "Trend Line", icon: "📈" },
    { id: "horizontal-line", name: "Horizontal Line", icon: "―" },
    { id: "vertical-line", name: "Vertical Line", icon: "│" },
    { id: "rectangle", name: "Rectangle", icon: "□" },
    { id: "ellipse", name: "Ellipse", icon: "⭕" },
    { id: "pitchfork", name: "Pitchfork", icon: "Ψ" },
    { id: "fibonacci", name: "Fibonacci", icon: "🔢" },
  ]

  // Indicators
  const indicators = [
    { id: "ma", name: "Moving Average", category: "trend" },
    { id: "ema", name: "Exponential MA", category: "trend" },
    { id: "bb", name: "Bollinger Bands", category: "volatility" },
    { id: "rsi", name: "RSI", category: "momentum" },
    { id: "macd", name: "MACD", category: "momentum" },
    { id: "stoch", name: "Stochastic", category: "momentum" },
    { id: "atr", name: "ATR", category: "volatility" },
    { id: "volume", name: "Volume", category: "volume" },
  ]

  // Indicator categories
  const indicatorCategories = [
    { id: "trend", name: "Trend" },
    { id: "momentum", name: "Momentum" },
    { id: "volatility", name: "Volatility" },
    { id: "volume", name: "Volume" },
  ]

  return (
    <div className={`flex flex-col h-full ${compact ? "text-xs" : ""} bg-white dark:bg-gray-900 overflow-hidden`}>
      {/* Chart Header */}
      {!compact && (
        <div className="flex justify-between items-center px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {symbol} {timeframe}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Chart Type Selector */}
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <Button
                variant={chartType === "candles" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("candles")}
              >
                <Candlestick className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("line")}
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "bars" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("bars")}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "heikin-ashi" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("heikin-ashi")}
              >
                <Activity className="h-4 w-4" />
              </Button>
            </div>

            {/* Indicators Button */}
            <Button
              variant={showIndicators ? "default" : "outline"}
              size="sm"
              className="h-7"
              onClick={() => setShowIndicators(!showIndicators)}
            >
              <Layers className="h-4 w-4 mr-1" />
              Indicators
            </Button>

            {/* Drawing Tools Button */}
            <Button
              variant={showDrawings ? "default" : "outline"}
              size="sm"
              className="h-7"
              onClick={() => setShowDrawings(!showDrawings)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M2 12h20" />
                <path d="M12 2v20" />
                <path d="m4.93 4.93 14.14 14.14" />
                <path d="m19.07 4.93-14.14 14.14" />
              </svg>
              Draw
            </Button>

            {/* AI Overlay Toggle */}
            <div className="flex items-center gap-1 ml-2">
              <Switch
                id="ai-overlay"
                checked={localShowAIOverlay}
                onCheckedChange={setLocalShowAIOverlay}
                className="data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="ai-overlay" className="text-xs cursor-pointer">
                <Lightbulb className="h-4 w-4" />
              </Label>
            </div>

            {/* Order Flow Toggle */}
            <div className="flex items-center gap-1">
              <Switch
                id="order-flow"
                checked={localShowOrderFlow}
                onCheckedChange={setLocalShowOrderFlow}
                className="data-[state=checked]:bg-purple-500"
              />
              <Label htmlFor="order-flow" className="text-xs cursor-pointer">
                <Zap className="h-4 w-4" />
              </Label>
            </div>

            {/* Fullscreen Button */}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Indicators Panel */}
      {showIndicators && !compact && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
          <Tabs defaultValue="trend">
            <TabsList className="h-8">
              {indicatorCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs h-8">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {indicatorCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-2">
                <div className="grid grid-cols-3 gap-2">
                  {indicators
                    .filter((indicator) => indicator.category === category.id)
                    .map((indicator) => (
                      <Button key={indicator.id} variant="outline" size="sm" className="h-8 text-xs justify-start">
                        {indicator.name}
                      </Button>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Drawing Tools Panel */}
      {showDrawings && !compact && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
          <div className="flex flex-wrap gap-2">
            {drawingTools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeDrawingTool === tool.id ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setActiveDrawingTool(activeDrawingTool === tool.id ? null : tool.id)}
              >
                <span className="mr-1">{tool.icon}</span>
                {tool.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        {/* TradingView Chart Iframe */}
        <iframe
          ref={iframeRef}
          id={`tradingview_widget_${symbol}_${timeframe}`}
          src={tradingViewUrl}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            border: "none",
          }}
          allowTransparency
          frameBorder="0"
          scrolling="no"
          allowFullScreen
        ></iframe>

        {/* AI Overlay */}
        {localShowAIOverlay && (
          <div className="absolute top-2 right-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-md p-2 text-xs max-w-xs">
            <div className="font-medium text-blue-600 dark:text-blue-400 mb-1">AI Analysis</div>
            <div className="text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium">Trend:</span> Bullish momentum detected on {symbol}. Price is testing
                resistance at 1.2150.
              </p>
              <p className="mt-1">
                <span className="font-medium">Support/Resistance:</span> Key levels at 1.2050 and 1.2200.
              </p>
              <p className="mt-1">
                <span className="font-medium">Prediction:</span> 70% probability of breaking above 1.2150 in the next 24
                hours.
              </p>
            </div>
          </div>
        )}

        {/* Order Flow Overlay */}
        {localShowOrderFlow && (
          <div className="absolute left-2 top-1/3 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-md p-2 text-xs">
            <div className="font-medium text-purple-600 dark:text-purple-400 mb-1">Order Flow</div>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between gap-4">
                <span>Buy Volume:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">1,245,678</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Sell Volume:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">987,543</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Delta:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">+258,135</span>
              </div>
              <div className="mt-2 font-medium">Large Orders:</div>
              <div className="flex justify-between gap-4">
                <span>1.2120:</span>
                <span className="text-green-600 dark:text-green-400">Buy 500K</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>1.2080:</span>
                <span className="text-red-600 dark:text-red-400">Sell 350K</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

