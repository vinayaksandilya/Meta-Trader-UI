"use client"

import { useState, useEffect, useRef } from "react"
import { ChartRenderer, type CandleData, type Indicator, type Drawing } from "./chart-renderer"
import { ChartToolbar } from "./chart-toolbar"
import { IndicatorPanel } from "./indicator-panel"
import { DrawingToolbar } from "./drawing-toolbar"
import { useTheme } from "next-themes"

interface CustomChartProps {
  symbol: string
  timeframe: string
  darkMode?: boolean
  compact?: boolean
  showToolbar?: boolean
  showIndicatorPanel?: boolean
  showDrawingTools?: boolean
  onSymbolChange?: (symbol: string) => void
  onTimeframeChange?: (timeframe: string) => void
  height?: number
  width?: number
  className?: string
}

export function CustomChart({
  symbol,
  timeframe,
  darkMode,
  compact = false,
  showToolbar = true,
  showIndicatorPanel = true,
  showDrawingTools = true,
  onSymbolChange,
  onTimeframeChange,
  height,
  width,
  className = "",
}: CustomChartProps) {
  const [chartData, setChartData] = useState<CandleData[]>([])
  const [chartType, setChartType] = useState<"candle" | "line" | "bar" | "area" | "heikinashi">("candle")
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null)
  const [showVolume, setShowVolume] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(undefined)
  const [visibleRange, setVisibleRange] = useState<[number, number] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Get theme from next-themes
  const { resolvedTheme } = useTheme()
  const chartTheme =
    darkMode !== undefined ? (darkMode ? "dark" : "light") : (resolvedTheme as "light" | "dark") || "light"

  // Generate sample data on mount
  useEffect(() => {
    setIsLoading(true)
    generateSampleData(symbol, timeframe)
      .then((data) => {
        setChartData(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error generating chart data:", err)
        setError("Failed to load chart data")
        setIsLoading(false)
      })
  }, [symbol, timeframe])

  // Update container size on resize
  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: width || containerRef.current.clientWidth,
          height: height || containerRef.current.clientHeight,
        })
      }
    }

    // Initial size
    updateSize()

    // Add resize listener
    window.addEventListener("resize", updateSize)

    return () => {
      window.removeEventListener("resize", updateSize)
    }
  }, [width, height])

  // Add a simple moving average indicator
  const addSMA = (period: number) => {
    if (chartData.length === 0) return

    // Calculate SMA
    const closes = chartData.map((candle) => candle.close)
    const smaData = calculateSMA(closes, period)

    // Add to indicators
    const newIndicator: Indicator = {
      id: `sma-${period}-${Date.now()}`,
      type: "sma",
      params: { period },
      data: [smaData],
      visible: true,
      color: getRandomColor(),
      lineWidth: 1.5,
    }

    setIndicators((prev) => [...prev, newIndicator])
  }

  // Add Bollinger Bands indicator
  const addBollingerBands = (period: number, stdDev: number) => {
    if (chartData.length === 0) return

    // Calculate Bollinger Bands
    const closes = chartData.map((candle) => candle.close)
    const { middle, upper, lower } = calculateBollingerBands(closes, period, stdDev)

    // Add to indicators
    const newIndicator: Indicator = {
      id: `bb-${period}-${stdDev}-${Date.now()}`,
      type: "bollinger",
      params: { period, stdDev },
      data: [middle, upper, lower],
      visible: true,
      color: "#9c27b0", // Purple
      lineWidth: 1,
      opacity: 0.7,
    }

    setIndicators((prev) => [...prev, newIndicator])
  }

  // Add a drawing
  const addDrawing = (drawing: Drawing) => {
    setDrawings((prev) => [...prev, drawing])
  }

  // Handle drawing tool selection
  const handleDrawingToolSelect = (tool: string | null) => {
    setActiveDrawingTool(tool)
  }

  // Clear all drawings
  const clearDrawings = () => {
    setDrawings([])
  }

  // Remove an indicator
  const removeIndicator = (id: string) => {
    setIndicators((prev) => prev.filter((indicator) => indicator.id !== id))
  }

  // Toggle indicator visibility
  const toggleIndicatorVisibility = (id: string) => {
    setIndicators((prev) =>
      prev.map((indicator) => (indicator.id === id ? { ...indicator, visible: !indicator.visible } : indicator)),
    )
  }

  // Handle chart type change
  const handleChartTypeChange = (type: "candle" | "line" | "bar" | "area" | "heikinashi") => {
    setChartType(type)
  }

  // Handle volume toggle
  const handleVolumeToggle = () => {
    setShowVolume((prev) => !prev)
  }

  // Generate sample data
  const generateSampleData = async (symbol: string, timeframe: string): Promise<CandleData[]> => {
    // This would normally fetch from an API
    // For demo purposes, we'll generate random data

    const count = 200 // Number of candles
    const result: CandleData[] = []

    // Set base price based on symbol
    let basePrice = 100
    switch (symbol) {
      case "EURUSD":
        basePrice = 1.18
        break
      case "GBPUSD":
        basePrice = 1.32
        break
      case "USDJPY":
        basePrice = 106.2
        break
      case "AAPL":
        basePrice = 175.25
        break
      case "MSFT":
        basePrice = 325.75
        break
      default:
        basePrice = 100
    }

    // Generate candles
    let lastClose = basePrice
    const now = new Date()
    const timeframeMinutes = parseTimeframe(timeframe)

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now.getTime() - (count - i) * timeframeMinutes * 60 * 1000).getTime()

      // Random price movement
      const changePercent = (Math.random() - 0.5) * 0.02 // -1% to +1%
      const close = lastClose * (1 + changePercent)

      // Random high/low/open
      const high = close * (1 + Math.random() * 0.01)
      const low = close * (1 - Math.random() * 0.01)
      const open = low + Math.random() * (high - low)

      // Random volume
      const volume = Math.floor(Math.random() * 1000) + 100

      result.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      })

      lastClose = close
    }

    return result
  }

  // Parse timeframe string to minutes
  const parseTimeframe = (timeframe: string): number => {
    if (timeframe.includes("M") || timeframe.includes("m")) {
      // Minutes timeframe (M1, M5, M15, M30)
      return Number.parseInt(timeframe.replace(/[Mm]/g, ""))
    } else if (timeframe.includes("H") || timeframe.includes("h")) {
      // Hours timeframe (H1, H4)
      return Number.parseInt(timeframe.replace(/[Hh]/g, "")) * 60
    } else if (timeframe.includes("D") || timeframe.includes("d")) {
      // Daily timeframe
      return 24 * 60
    } else if (timeframe.includes("W") || timeframe.includes("w")) {
      // Weekly timeframe
      return 7 * 24 * 60
    } else if (timeframe.includes("MN") || timeframe.includes("M")) {
      // Monthly timeframe
      return 30 * 24 * 60
    } else {
      // Default to 1 hour
      return 60
    }
  }

  // Calculate Simple Moving Average
  const calculateSMA = (data: number[], period: number): number[] => {
    const result: number[] = []

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // Not enough data for SMA yet
        result.push(Number.NaN)
        continue
      }

      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j]
      }

      result.push(sum / period)
    }

    return result
  }

  // Calculate Bollinger Bands
  const calculateBollingerBands = (data: number[], period: number, stdDev: number) => {
    const middle = calculateSMA(data, period)
    const upper: number[] = []
    const lower: number[] = []

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(Number.NaN)
        lower.push(Number.NaN)
        continue
      }

      // Calculate standard deviation
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[i - j] - middle[i], 2)
      }

      const sd = Math.sqrt(sum / period)

      upper.push(middle[i] + stdDev * sd)
      lower.push(middle[i] - stdDev * sd)
    }

    return { middle, upper, lower }
  }

  // Get a random color for indicators
  const getRandomColor = (): string => {
    const colors = [
      "#2196f3", // Blue
      "#ff9800", // Orange
      "#9c27b0", // Purple
      "#4caf50", // Green
      "#f44336", // Red
      "#00bcd4", // Cyan
      "#ff5722", // Deep Orange
      "#8bc34a", // Light Green
    ]

    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${className}`}
      style={{ height: height || "100%", width: width || "100%" }}
    >
      {showToolbar && (
        <ChartToolbar
          symbol={symbol}
          timeframe={timeframe}
          chartType={chartType}
          onChartTypeChange={handleChartTypeChange}
          onSymbolChange={onSymbolChange}
          onTimeframeChange={onTimeframeChange}
          showVolume={showVolume}
          onVolumeToggle={handleVolumeToggle}
          indicators={indicators}
          onAddSMA={() => addSMA(20)}
          onAddBollingerBands={() => addBollingerBands(20, 2)}
          onRemoveIndicator={removeIndicator}
          onToggleIndicatorVisibility={toggleIndicatorVisibility}
          compact={compact}
        />
      )}

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Loading chart data...</div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-red-500">{error}</div>
          </div>
        ) : (
          <>
            {showDrawingTools && (
              <DrawingToolbar
                activeTool={activeDrawingTool}
                onToolSelect={handleDrawingToolSelect}
                onClearDrawings={clearDrawings}
              />
            )}

            <ChartRenderer
              data={chartData}
              width={containerSize.width}
              height={containerSize.height - (showToolbar ? 40 : 0)}
              chartType={chartType}
              indicators={indicators}
              drawings={drawings}
              timeframe={timeframe}
              symbol={symbol}
              priceRange={priceRange}
              visibleRange={visibleRange}
              onPriceRangeChange={setPriceRange}
              onVisibleRangeChange={setVisibleRange}
              showVolume={showVolume}
              theme={chartTheme}
            />
          </>
        )}
      </div>

      {showIndicatorPanel && !compact && (
        <IndicatorPanel
          indicators={indicators}
          onAddSMA={() => addSMA(20)}
          onAddBollingerBands={() => addBollingerBands(20, 2)}
          onRemoveIndicator={removeIndicator}
          onToggleIndicatorVisibility={toggleIndicatorVisibility}
        />
      )}
    </div>
  )
}

