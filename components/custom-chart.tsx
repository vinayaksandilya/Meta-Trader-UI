"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  LineChart,
  BarChart2,
  BarChart4,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  Pencil,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomChartProps {
  symbol: string
  timeframe: string
  darkMode: boolean
  compact?: boolean
  showOptionsData?: boolean
  optionsData?: any[]
  attachedRobot?: string
}

// Define types for our chart data
interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Indicator {
  id: string
  name: string
  type: string
  color: string
  visible: boolean
  parameters: Record<string, any>
}

interface DrawingTool {
  id: string
  type: string
  points: { x: number; y: number }[]
  color: string
  width: number
  visible: boolean
}

export function CustomChart({
  symbol,
  timeframe,
  darkMode,
  compact = false,
  showOptionsData = false,
  optionsData = [],
  attachedRobot,
}: CustomChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [price, setPrice] = useState(generateRandomPrice(symbol))
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null)
  const [chartType, setChartType] = useState<"candle" | "line" | "bar" | "heikin-ashi">("candle")
  const [showIndicatorsMenu, setShowIndicatorsMenu] = useState(false)
  const [showDrawingToolsMenu, setShowDrawingToolsMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [chartData, setChartData] = useState<CandleData[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [drawings, setDrawings] = useState<DrawingTool[]>([])
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 })
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showVolume, setShowVolume] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [chartTheme, setChartTheme] = useState({
    background: darkMode ? "#1a1a1a" : "#ffffff",
    text: darkMode ? "#e0e0e0" : "#333333",
    grid: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    candleUp: "#26a69a",
    candleDown: "#ef5350",
    volume: "rgba(100, 100, 100, 0.5)",
    crosshair: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
  })
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0, visible: false })
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingTool | null>(null)
  const [showOptionsOverlay, setShowOptionsOverlay] = useState(showOptionsData)

  const [showTradeManager, setShowTradeManager] = useState(false)
  const [tradeManagerPosition, setTradeManagerPosition] = useState({ x: 50, y: 50 })
  const [isDraggingPanel, setIsDraggingPanel] = useState(false)
  const [dragPanelStart, setDragPanelStart] = useState({ x: 0, y: 0 })
  const [currentTrade, setCurrentTrade] = useState({
    type: "BUY",
    profit: 71.64,
    risk: 1.0,
    comment: "Trade #1",
    tpPoints: 1000.0,
    slPoints: 1000.0,
  })
  const [trailingStopSettings, setTrailingStopSettings] = useState({
    state: "OFF",
    distance: 50.0,
    step: 5.0,
  })
  const [breakEvenSettings, setBreakEvenSettings] = useState({
    state: "OFF",
    trigger: 35.0,
  })
  const [partialCloseSettings, setPartialCloseSettings] = useState({
    state: "OFF",
    trigger: 60.0,
    percentage: 50.0,
  })
  const [pendingOrderSettings, setPendingOrderSettings] = useState({
    points: 50.0,
    type: "Buy Stop",
  })
  const [tradeStats, setTradeStats] = useState({
    currentLoss: 0.0,
    currentProfit: 71.64,
    totalLoss: -995.02,
    totalProfit: 990.05,
  })

  // Check if Trade Manager is attached
  useEffect(() => {
    if (attachedRobot === "TradeManager") {
      setShowTradeManager(true)
    } else {
      setShowTradeManager(false)
    }
  }, [attachedRobot])

  // Handle Trade Manager panel dragging
  const handleTradeManagerDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".panel-header")) {
      setIsDraggingPanel(true)
      setDragPanelStart({
        x: e.clientX - tradeManagerPosition.x,
        y: e.clientY - tradeManagerPosition.y,
      })
    }
  }

  const handleTradeManagerDragMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingPanel) {
        setTradeManagerPosition({
          x: e.clientX - dragPanelStart.x,
          y: e.clientY - dragPanelStart.y,
        })
      }
    },
    [isDraggingPanel, dragPanelStart, tradeManagerPosition],
  )

  const handleTradeManagerDragEnd = useCallback(() => {
    setIsDraggingPanel(false)
  }, [])

  useEffect(() => {
    if (isDraggingPanel) {
      window.addEventListener("mousemove", handleTradeManagerDragMove)
      window.addEventListener("mouseup", handleTradeManagerDragEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleTradeManagerDragMove)
      window.removeEventListener("mouseup", handleTradeManagerDragEnd)
    }
  }, [isDraggingPanel, handleTradeManagerDragMove, handleTradeManagerDragEnd])

  // Toggle trade type
  const toggleTradeType = () => {
    setCurrentTrade((prev) => ({
      ...prev,
      type: prev.type === "BUY" ? "SELL" : "BUY",
    }))
  }

  // Toggle setting state
  const toggleSettingState = (setting: "trailingStop" | "breakEven" | "partialClose") => {
    if (setting === "trailingStop") {
      setTrailingStopSettings((prev) => ({
        ...prev,
        state: prev.state === "OFF" ? "ON" : "OFF",
      }))
    } else if (setting === "breakEven") {
      setBreakEvenSettings((prev) => ({
        ...prev,
        state: prev.state === "OFF" ? "ON" : "OFF",
      }))
    } else if (setting === "partialClose") {
      setPartialCloseSettings((prev) => ({
        ...prev,
        state: prev.state === "OFF" ? "ON" : "OFF",
      }))
    }
  }

  // Generate random price based on symbol
  function generateRandomPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      EURUSD: 1.18,
      GBPUSD: 1.32,
      USDJPY: 106.2,
      USDCHF: 0.91,
      XAUUSD: 1940.0,
      AAPL: 175.25,
      MSFT: 325.75,
      GOOGL: 142.5,
      AMZN: 178.35,
      TSLA: 245.2,
      SPY: 452.8,
      QQQ: 380.45,
    }

    const base = basePrices[symbol] || 100.0
    return base + (Math.random() * 0.01 - 0.005)
  }

  // Generate historical data
  useEffect(() => {
    const basePrice = generateRandomPrice(symbol)
    const data: CandleData[] = []
    const now = new Date()

    // Generate 200 candles
    for (let i = 0; i < 200; i++) {
      const time = new Date(now)
      time.setHours(now.getHours() - (200 - i))

      // Generate random price movement
      const open = i === 0 ? basePrice : data[i - 1].close
      const change = (Math.random() - 0.5) * 0.01 * basePrice
      const close = open + change
      const high = Math.max(open, close) + Math.random() * 0.005 * basePrice
      const low = Math.min(open, close) - Math.random() * 0.005 * basePrice
      const volume = Math.random() * 1000 + 500

      data.push({
        time: time.getTime(),
        open,
        high,
        low,
        close,
        volume,
      })
    }

    setChartData(data)
    setPrice(data[data.length - 1].close)

    // Add some default indicators
    setIndicators([
      {
        id: "ma20",
        name: "Moving Average (20)",
        type: "ma",
        color: "#2196f3",
        visible: true,
        parameters: { period: 20 },
      },
      {
        id: "ma50",
        name: "Moving Average (50)",
        type: "ma",
        color: "#ff9800",
        visible: false,
        parameters: { period: 50 },
      },
      {
        id: "rsi",
        name: "RSI (14)",
        type: "rsi",
        color: "#9c27b0",
        visible: false,
        parameters: { period: 14 },
      },
      {
        id: "macd",
        name: "MACD",
        type: "macd",
        color: "#4caf50",
        visible: false,
        parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      },
    ])
  }, [symbol])

  // Update theme when dark mode changes
  useEffect(() => {
    setChartTheme({
      background: darkMode ? "#1a1a1a" : "#ffffff",
      text: darkMode ? "#e0e0e0" : "#333333",
      grid: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      candleUp: "#26a69a",
      candleDown: "#ef5350",
      volume: "rgba(100, 100, 100, 0.5)",
      crosshair: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
    })
  }, [darkMode])

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (chartData.length === 0) return

      const lastCandle = chartData[chartData.length - 1]
      const oldPrice = price

      // Simulate price movement
      const change = (Math.random() - 0.5) * 0.002 * price
      const newPrice = price + change

      // Update the last candle
      const updatedCandle = {
        ...lastCandle,
        close: newPrice,
        high: Math.max(lastCandle.high, newPrice),
        low: Math.min(lastCandle.low, newPrice),
      }

      const updatedData = [...chartData.slice(0, -1), updatedCandle]
      setChartData(updatedData)
      setPrice(newPrice)
      setPriceDirection(newPrice > oldPrice ? "up" : "down")

      // Reset direction after a short delay
      setTimeout(() => setPriceDirection(null), 1000)
    }, 2000)

    return () => clearInterval(interval)
  }, [chartData, price])

  // Calculate indicator values
  const calculateIndicators = () => {
    return indicators.map((indicator) => {
      if (indicator.type === "ma") {
        const period = indicator.parameters.period
        const values = chartData.map((candle, i, arr) => {
          if (i < period - 1) return null

          let sum = 0
          for (let j = 0; j < period; j++) {
            sum += arr[i - j].close
          }
          return sum / period
        })

        return { ...indicator, values }
      }

      if (indicator.type === "rsi") {
        const period = indicator.parameters.period
        const values = chartData.map((candle, i, arr) => {
          if (i < period) return null

          let gains = 0
          let losses = 0

          for (let j = 0; j < period; j++) {
            const change = arr[i - j].close - arr[i - j - 1].close
            if (change >= 0) {
              gains += change
            } else {
              losses -= change
            }
          }

          const avgGain = gains / period
          const avgLoss = losses / period

          if (avgLoss === 0) return 100

          const rs = avgGain / avgLoss
          return 100 - 100 / (1 + rs)
        })

        return { ...indicator, values }
      }

      if (indicator.type === "macd") {
        const fastPeriod = indicator.parameters.fastPeriod
        const slowPeriod = indicator.parameters.slowPeriod
        const signalPeriod = indicator.parameters.signalPeriod

        // Calculate EMAs
        const fastEMA = calculateEMA(
          chartData.map((c) => c.close),
          fastPeriod,
        )
        const slowEMA = calculateEMA(
          chartData.map((c) => c.close),
          slowPeriod,
        )

        // Calculate MACD line
        const macdLine = fastEMA.map((fast, i) => {
          if (fast === null || slowEMA[i] === null) return null
          return fast - slowEMA[i]
        })

        // Calculate signal line (EMA of MACD line)
        const signalLine = calculateEMA(macdLine, signalPeriod)

        // Calculate histogram
        const histogram = macdLine.map((macd, i) => {
          if (macd === null || signalLine[i] === null) return null
          return macd - signalLine[i]
        })

        return {
          ...indicator,
          values: {
            macdLine,
            signalLine,
            histogram,
          },
        }
      }

      return indicator
    })
  }

  // Helper function to calculate EMA
  const calculateEMA = (data: (number | null)[], period: number) => {
    const k = 2 / (period + 1)
    const ema: (number | null)[] = []

    // Initialize with SMA
    let sum = 0
    let count = 0

    for (let i = 0; i < period; i++) {
      if (data[i] !== null) {
        sum += data[i] as number
        count++
      }
    }

    // Fill initial values with null
    for (let i = 0; i < period - 1; i++) {
      ema.push(null)
    }

    // First EMA is SMA
    const firstEMA = count > 0 ? sum / count : null
    ema.push(firstEMA)

    // Calculate rest of EMAs
    for (let i = period; i < data.length; i++) {
      if (data[i] === null || ema[i - 1] === null) {
        ema.push(null)
      } else {
        ema.push((data[i] as number) * k + (ema[i - 1] as number) * (1 - k))
      }
    }

    return ema
  }

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || chartData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const container = chartContainerRef.current
    if (container) {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    ctx.fillStyle = chartTheme.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate visible data range
    const visibleData = chartData.slice(
      Math.max(0, chartData.length - visibleRange.end),
      Math.max(0, chartData.length - visibleRange.start),
    )

    if (visibleData.length === 0) return

    // Calculate price range
    let minPrice = Math.min(...visibleData.map((d) => d.low))
    let maxPrice = Math.max(...visibleData.map((d) => d.high))

    // Add some padding
    const pricePadding = (maxPrice - minPrice) * 0.1
    minPrice -= pricePadding
    maxPrice += pricePadding

    // Calculate scaling factors
    const xScale = canvas.width / visibleData.length
    const yScale = canvas.height / (maxPrice - minPrice)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = chartTheme.grid
      ctx.lineWidth = 0.5

      // Horizontal grid lines (price levels)
      const priceStep = calculateNiceStep(minPrice, maxPrice, 10)
      for (let price = Math.ceil(minPrice / priceStep) * priceStep; price <= maxPrice; price += priceStep) {
        const y = canvas.height - (price - minPrice) * yScale

        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()

        // Draw price labels
        ctx.fillStyle = chartTheme.text
        ctx.font = "10px Arial"
        ctx.textAlign = "right"
        ctx.fillText(price.toFixed(getDecimalPlaces(symbol)), canvas.width - 5, y - 3)
      }

      // Vertical grid lines (time)
      const timeStep = Math.max(1, Math.floor(visibleData.length / 10))
      for (let i = 0; i < visibleData.length; i += timeStep) {
        const x = i * xScale

        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()

        // Draw time labels
        if (i % timeStep === 0) {
          const date = new Date(visibleData[i].time)
          const timeLabel = date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0")

          ctx.fillStyle = chartTheme.text
          ctx.font = "10px Arial"
          ctx.textAlign = "center"
          ctx.fillText(timeLabel, x, canvas.height - 5)
        }
      }
    }

    // Draw volume if enabled
    if (showVolume) {
      const maxVolume = Math.max(...visibleData.map((d) => d.volume))
      const volumeHeight = canvas.height * 0.2

      visibleData.forEach((candle, i) => {
        const x = i * xScale
        const volumeY = canvas.height - (candle.volume / maxVolume) * volumeHeight
        const width = Math.max(1, xScale - 1)

        ctx.fillStyle = candle.close >= candle.open ? chartTheme.candleUp : chartTheme.candleDown
        ctx.globalAlpha = 0.5
        ctx.fillRect(x, canvas.height - volumeHeight, width, canvas.height - volumeY)
        ctx.globalAlpha = 1.0
      })
    }

    // Draw chart based on chart type
    if (chartType === "candle" || chartType === "heikin-ashi") {
      visibleData.forEach((candle, i) => {
        let open, high, low, close

        if (chartType === "heikin-ashi" && i > 0) {
          // Calculate Heikin-Ashi values
          const prevCandle = visibleData[i - 1]
          open = (prevCandle.open + prevCandle.close) / 2
          close = (candle.open + candle.high + candle.low + candle.close) / 4
          high = Math.max(candle.high, open, close)
          low = Math.min(candle.low, open, close)
        } else {
          // Regular candle values
          open = candle.open
          high = candle.high
          low = candle.low
          close = candle.close
        }

        const x = i * xScale
        const y_open = canvas.height - (open - minPrice) * yScale
        const y_close = canvas.height - (close - minPrice) * yScale
        const y_high = canvas.height - (high - minPrice) * yScale
        const y_low = canvas.height - (low - minPrice) * yScale

        const isUp = close >= open
        const width = Math.max(1, xScale - 1)

        // Draw candle body
        ctx.fillStyle = isUp ? chartTheme.candleUp : chartTheme.candleDown
        ctx.fillRect(x, Math.min(y_open, y_close), width, Math.abs(y_close - y_open) || 1)

        // Draw candle wicks
        ctx.strokeStyle = isUp ? chartTheme.candleUp : chartTheme.candleDown
        ctx.beginPath()
        ctx.moveTo(x + width / 2, y_high)
        ctx.lineTo(x + width / 2, Math.min(y_open, y_close))
        ctx.moveTo(x + width / 2, Math.max(y_open, y_close))
        ctx.lineTo(x + width / 2, y_low)
        ctx.stroke()
      })
    } else if (chartType === "bar") {
      visibleData.forEach((candle, i) => {
        const x = i * xScale
        const y_open = canvas.height - (candle.open - minPrice) * yScale
        const y_close = canvas.height - (candle.close - minPrice) * yScale
        const y_high = canvas.height - (candle.high - minPrice) * yScale
        const y_low = canvas.height - (candle.low - minPrice) * yScale

        const isUp = candle.close >= candle.open
        const centerX = x + xScale / 2

        // Draw bar
        ctx.strokeStyle = isUp ? chartTheme.candleUp : chartTheme.candleDown

        // High to low vertical line
        ctx.beginPath()
        ctx.moveTo(centerX, y_high)
        ctx.lineTo(centerX, y_low)
        ctx.stroke()

        // Open tick
        ctx.beginPath()
        ctx.moveTo(centerX - 3, y_open)
        ctx.lineTo(centerX, y_open)
        ctx.stroke()

        // Close tick
        ctx.beginPath()
        ctx.moveTo(centerX, y_close)
        ctx.lineTo(centerX + 3, y_close)
        ctx.stroke()
      })
    } else if (chartType === "line") {
      ctx.strokeStyle = "#2196f3"
      ctx.lineWidth = 1.5
      ctx.beginPath()

      visibleData.forEach((candle, i) => {
        const x = i * xScale
        const y = canvas.height - (candle.close - minPrice) * yScale

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    }

    // Draw indicators
    const calculatedIndicators = calculateIndicators()

    calculatedIndicators.forEach((indicator) => {
      if (!indicator.visible) return

      if (indicator.type === "ma") {
        ctx.strokeStyle = indicator.color
        ctx.lineWidth = 1.5
        ctx.beginPath()

        indicator.values.forEach((value, i) => {
          if (value === null) return

          const dataIndex = chartData.length - visibleRange.end + i
          if (dataIndex < 0 || dataIndex >= visibleData.length) return

          const x = i * xScale
          const y = canvas.height - (value - minPrice) * yScale

          if (i === 0 || indicator.values[i - 1] === null) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })

        ctx.stroke()
      }

      // Other indicators would be drawn here
    })

    // Draw drawings
    drawings.forEach((drawing) => {
      if (!drawing.visible) return

      ctx.strokeStyle = drawing.color
      ctx.lineWidth = drawing.width

      if (drawing.type === "line" && drawing.points.length >= 2) {
        const p1 = drawing.points[0]
        const p2 = drawing.points[1]

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      } else if (drawing.type === "rectangle" && drawing.points.length >= 2) {
        const p1 = drawing.points[0]
        const p2 = drawing.points[1]

        ctx.beginPath()
        ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
        ctx.stroke()
      } else if (drawing.type === "fibonacci" && drawing.points.length >= 2) {
        const p1 = drawing.points[0]
        const p2 = drawing.points[1]
        const height = p2.y - p1.y

        // Draw main line
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()

        // Draw Fibonacci levels
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

        levels.forEach((level) => {
          const y = p1.y + height * level

          ctx.beginPath()
          ctx.moveTo(p1.x, y)
          ctx.lineTo(p2.x, y)
          ctx.stroke()

          ctx.fillStyle = chartTheme.text
          ctx.font = "10px Arial"
          ctx.textAlign = "left"
          ctx.fillText(`${(level * 100).toFixed(1)}%`, p2.x + 5, y + 3)
        })
      }
    })

    // Draw crosshair
    if (crosshair.visible) {
      ctx.strokeStyle = chartTheme.crosshair
      ctx.lineWidth = 0.5

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(crosshair.x, 0)
      ctx.lineTo(crosshair.x, canvas.height)
      ctx.stroke()

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(0, crosshair.y)
      ctx.lineTo(canvas.width, crosshair.y)
      ctx.stroke()

      // Price label
      const crosshairPrice = minPrice + (canvas.height - crosshair.y) / yScale

      ctx.fillStyle = chartTheme.background
      ctx.fillRect(canvas.width - 60, crosshair.y - 10, 55, 20)
      ctx.strokeStyle = chartTheme.text
      ctx.strokeRect(canvas.width - 60, crosshair.y - 10, 55, 20)

      ctx.fillStyle = chartTheme.text
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(crosshairPrice.toFixed(getDecimalPlaces(symbol)), canvas.width - 32, crosshair.y + 3)

      // Time label
      const dataIndex = Math.floor(crosshair.x / xScale)
      if (dataIndex >= 0 && dataIndex < visibleData.length) {
        const date = new Date(visibleData[dataIndex].time)
        const timeLabel = date.getHours() + ":" + date.getMinutes().toString().padStart(2, "0")

        ctx.fillStyle = chartTheme.background
        ctx.fillRect(crosshair.x - 30, canvas.height - 25, 60, 20)
        ctx.strokeStyle = chartTheme.text
        ctx.strokeRect(crosshair.x - 30, canvas.height - 25, 60, 20)

        ctx.fillStyle = chartTheme.text
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(timeLabel, crosshair.x, canvas.height - 12)
      }
    }

    // Draw options data overlay if enabled
    if (showOptionsOverlay && optionsData && optionsData.length > 0) {
      // This is a simplified visualization - in a real app, you'd map option strikes to price levels
      const strikeMin = Math.min(...optionsData.map((o: any) => o.strike))
      const strikeMax = Math.max(...optionsData.map((o: any) => o.strike))

      // Only show if strikes are within visible price range
      if (strikeMin <= maxPrice && strikeMax >= minPrice) {
        // Draw call density
        ctx.fillStyle = "rgba(0, 128, 255, 0.2)"
        optionsData.forEach((option: any) => {
          if (option.strike < minPrice || option.strike > maxPrice) return

          const y = canvas.height - (option.strike - minPrice) * yScale
          const height = 2
          const width = (option.callVolume / 1000) * 50 // Scale based on volume

          ctx.fillRect(0, y - height / 2, width, height)
        })

        // Draw put density
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)"
        optionsData.forEach((option: any) => {
          if (option.strike < minPrice || option.strike > maxPrice) return

          const y = canvas.height - (option.strike - minPrice) * yScale
          const height = 2
          const width = (option.putVolume / 1000) * 50 // Scale based on volume

          ctx.fillRect(canvas.width - width, y - height / 2, width, height)
        })
      }
    }

    // Draw current price
    const y_price = canvas.height - (price - minPrice) * yScale

    ctx.strokeStyle =
      priceDirection === "up" ? chartTheme.candleUp : priceDirection === "down" ? chartTheme.candleDown : "#2196f3"
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])

    ctx.beginPath()
    ctx.moveTo(0, y_price)
    ctx.lineTo(canvas.width, y_price)
    ctx.stroke()

    ctx.setLineDash([])

    // Price label
    ctx.fillStyle =
      priceDirection === "up" ? chartTheme.candleUp : priceDirection === "down" ? chartTheme.candleDown : "#2196f3"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "left"

    ctx.fillText(price.toFixed(getDecimalPlaces(symbol)), 5, y_price - 5)

    // Draw trade levels if Trade Manager is visible
    if (showTradeManager) {
      // Calculate TP and SL levels based on current price
      const tpLevel =
        currentTrade.type === "BUY"
          ? price + currentTrade.tpPoints * Math.pow(10, -getDecimalPlaces(symbol))
          : price - currentTrade.tpPoints * Math.pow(10, -getDecimalPlaces(symbol))

      const slLevel =
        currentTrade.type === "BUY"
          ? price - currentTrade.slPoints * Math.pow(10, -getDecimalPlaces(symbol))
          : price + currentTrade.slPoints * Math.pow(10, -getDecimalPlaces(symbol))

      // Only draw if levels are within visible range
      if (tpLevel >= minPrice && tpLevel <= maxPrice) {
        const y_tp = canvas.height - (tpLevel - minPrice) * yScale

        // Draw TP line
        ctx.strokeStyle = "#26a69a" // Green for TP
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])

        ctx.beginPath()
        ctx.moveTo(0, y_tp)
        ctx.lineTo(canvas.width, y_tp)
        ctx.stroke()

        // TP Label
        ctx.fillStyle = "#26a69a"
        ctx.font = "10px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`TP: ${tpLevel.toFixed(getDecimalPlaces(symbol))}`, 5, y_tp - 3)
      }

      if (slLevel >= minPrice && slLevel <= maxPrice) {
        const y_sl = canvas.height - (slLevel - minPrice) * yScale

        // Draw SL line
        ctx.strokeStyle = "#ef5350" // Red for SL
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])

        ctx.beginPath()
        ctx.moveTo(0, y_sl)
        ctx.lineTo(canvas.width, y_sl)
        ctx.stroke()

        // SL Label
        ctx.fillStyle = "#ef5350"
        ctx.font = "10px Arial"
        ctx.textAlign = "left"
        ctx.fillText(`SL: ${slLevel.toFixed(getDecimalPlaces(symbol))}`, 5, y_sl - 3)
      }

      // Reset dash pattern
      ctx.setLineDash([])
    }
  }, [
    chartData,
    chartType,
    chartTheme,
    crosshair,
    darkMode,
    drawings,
    indicators,
    optionsData,
    price,
    priceDirection,
    scale,
    showGrid,
    showOptionsOverlay,
    showVolume,
    symbol,
    visibleRange,
    showTradeManager,
    currentTrade,
  ])

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCrosshair({ x, y, visible: true })

    if (isDragging) {
      const dx = x - dragStart.x
      const dy = y - dragStart.y

      if (activeDrawingTool) {
        // Update the last point of the current drawing
        if (drawings.length > 0 && isDrawing) {
          const lastDrawing = { ...drawings[drawings.length - 1] }
          if (lastDrawing.points.length > 1) {
            lastDrawing.points[lastDrawing.points.length - 1] = { x, y }
            setDrawings([...drawings.slice(0, -1), lastDrawing])
          }
        }
      } else {
        // Pan the chart
        setPan({ x: pan.x + dx, y: pan.y + dy })
        setDragStart({ x, y })
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDragStart({ x, y })
    setIsDragging(true)

    if (activeDrawingTool) {
      if (!isDrawing) {
        // Start a new drawing
        const newDrawing: DrawingTool = {
          id: `drawing-${Date.now()}`,
          type: activeDrawingTool,
          points: [{ x, y }],
          color: "#ff9800",
          width: 1,
          visible: true,
        }

        setDrawings([...drawings, newDrawing])
        setIsDrawing(true)
      } else {
        // Add a point to the current drawing
        const lastDrawing = { ...drawings[drawings.length - 1] }
        lastDrawing.points.push({ x, y })
        setDrawings([...drawings.slice(0, -1), lastDrawing])

        // If it's a line or fibonacci, complete the drawing after 2 points
        if ((activeDrawingTool === "line" || activeDrawingTool === "fibonacci") && lastDrawing.points.length >= 2) {
          setIsDrawing(false)
        }
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setCrosshair({ ...crosshair, visible: false })
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    // Zoom in/out
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setScale(scale * zoomFactor)

    // Adjust visible range
    const rangeSize = visibleRange.end - visibleRange.start
    const newRangeSize = Math.max(10, Math.min(chartData.length, rangeSize / zoomFactor))

    setVisibleRange({
      start: Math.max(0, visibleRange.start),
      end: Math.min(chartData.length, visibleRange.start + newRangeSize),
    })
  }

  // Helper functions
  const calculateNiceStep = (min: number, max: number, targetSteps: number) => {
    const range = max - min
    const roughStep = range / targetSteps

    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)))
    const normalized = roughStep / magnitude

    let niceStep
    if (normalized < 1.5) niceStep = 1
    else if (normalized < 3) niceStep = 2
    else if (normalized < 7) niceStep = 5
    else niceStep = 10

    return niceStep * magnitude
  }

  const getDecimalPlaces = (symbol: string) => {
    if (symbol.includes("JPY")) return 3
    if (symbol === "XAUUSD") return 2
    if (["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "SPY", "QQQ"].includes(symbol)) return 2
    return 5
  }

  // Toggle indicator visibility
  const toggleIndicator = (id: string) => {
    setIndicators(indicators.map((ind) => (ind.id === id ? { ...ind, visible: !ind.visible } : ind)))
  }

  // Add a new indicator
  const addIndicator = (type: string, name: string) => {
    const newIndicator: Indicator = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      color: getRandomColor(),
      visible: true,
      parameters: getDefaultParameters(type),
    }

    setIndicators([...indicators, newIndicator])
    setShowIndicatorsMenu(false)
  }

  // Get default parameters for indicator
  const getDefaultParameters = (type: string) => {
    switch (type) {
      case "ma":
        return { period: 20 }
      case "ema":
        return { period: 20 }
      case "rsi":
        return { period: 14 }
      case "macd":
        return { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
      case "bollinger":
        return { period: 20, deviations: 2 }
      default:
        return {}
    }
  }

  // Generate a random color
  const getRandomColor = () => {
    const colors = ["#2196f3", "#ff9800", "#9c27b0", "#4caf50", "#f44336", "#3f51b5", "#009688"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Remove an indicator
  const removeIndicator = (id: string) => {
    setIndicators(indicators.filter((ind) => ind.id !== id))
    if (selectedIndicator?.id === id) {
      setSelectedIndicator(null)
    }
  }

  // Remove a drawing
  const removeDrawing = (id: string) => {
    setDrawings(drawings.filter((d) => d.id !== id))
    if (selectedDrawing?.id === id) {
      setSelectedDrawing(null)
    }
  }

  // Clear all drawings
  const clearDrawings = () => {
    setDrawings([])
    setSelectedDrawing(null)
  }

  // Cancel current drawing
  const cancelDrawing = () => {
    if (isDrawing && drawings.length > 0) {
      setDrawings(drawings.slice(0, -1))
    }
    setIsDrawing(false)
    setActiveDrawingTool(null)
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${compact ? "text-xs" : ""}`}>
      {/* Chart Header */}
      {!compact && (
        <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {symbol} {timeframe}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Chart Type Selector */}
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <Button
                variant={chartType === "candle" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("candle")}
              >
                <BarChart4 className="h-4 w-4" />
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
                variant={chartType === "bar" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("bar")}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "heikin-ashi" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-none"
                onClick={() => setChartType("heikin-ashi")}
                title="Heikin-Ashi"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="9" width="4" height="11" />
                  <line x1="8" y1="12" x2="8" y2="2" />
                  <line x1="16" y1="15" x2="16" y2="5" />
                </svg>
              </Button>
            </div>

            {/* Indicators Button */}
            <Popover open={showIndicatorsMenu} onOpenChange={setShowIndicatorsMenu}>
              <PopoverTrigger asChild>
                <Button variant={indicators.some((i) => i.visible) ? "default" : "outline"} size="sm" className="h-7">
                  <Layers className="h-4 w-4 mr-1" />
                  Indicators
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Add Indicator</h4>
                  <div className="grid grid-cols-2 gap-1">
                    <Button size="sm" onClick={() => addIndicator("ma", "Moving Average")}>
                      Moving Average
                    </Button>
                    <Button size="sm" onClick={() => addIndicator("ema", "Exponential MA")}>
                      Exponential MA
                    </Button>
                    <Button size="sm" onClick={() => addIndicator("bollinger", "Bollinger Bands")}>
                      Bollinger Bands
                    </Button>
                    <Button size="sm" onClick={() => addIndicator("rsi", "RSI")}>
                      RSI
                    </Button>
                    <Button size="sm" onClick={() => addIndicator("macd", "MACD")}>
                      MACD
                    </Button>
                    <Button size="sm" onClick={() => addIndicator("volume", "Volume")}>
                      Volume
                    </Button>
                  </div>

                  <h4 className="font-medium text-sm pt-2">Active Indicators</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {indicators.map((indicator) => (
                      <div key={indicator.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: indicator.color }} />
                          <span>{indicator.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleIndicator(indicator.id)}
                          >
                            {indicator.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => removeIndicator(indicator.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {indicators.length === 0 && (
                      <div className="text-gray-500 text-center py-2">No indicators added</div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Drawing Tools Button */}
            <Popover open={showDrawingToolsMenu} onOpenChange={setShowDrawingToolsMenu}>
              <PopoverTrigger asChild>
                <Button variant={activeDrawingTool ? "default" : "outline"} size="sm" className="h-7">
                  <Pencil className="h-4 w-4 mr-1" />
                  Draw
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Drawing Tools</h4>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant={activeDrawingTool === "line" ? "default" : "outline"}
                      onClick={() => {
                        setActiveDrawingTool(activeDrawingTool === "line" ? null : "line")
                        setIsDrawing(false)
                      }}
                    >
                      Line
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDrawingTool === "rectangle" ? "default" : "outline"}
                      onClick={() => {
                        setActiveDrawingTool(activeDrawingTool === "rectangle" ? null : "rectangle")
                        setIsDrawing(false)
                      }}
                    >
                      Rectangle
                    </Button>
                    <Button
                      size="sm"
                      variant={activeDrawingTool === "fibonacci" ? "default" : "outline"}
                      onClick={() => {
                        setActiveDrawingTool(activeDrawingTool === "fibonacci" ? null : "fibonacci")
                        setIsDrawing(false)
                      }}
                    >
                      Fibonacci
                    </Button>
                  </div>

                  {activeDrawingTool && (
                    <div className="pt-2">
                      <Button size="sm" variant="destructive" onClick={cancelDrawing}>
                        Cancel Drawing
                      </Button>
                    </div>
                  )}

                  <h4 className="font-medium text-sm pt-2">Drawings</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {drawings.map((drawing) => (
                      <div key={drawing.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: drawing.color }} />
                          <span>{drawing.type}</span>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => removeDrawing(drawing.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {drawings.length === 0 && <div className="text-gray-500 text-center py-2">No drawings added</div>}
                  </div>

                  {drawings.length > 0 && (
                    <div className="pt-2">
                      <Button size="sm" variant="destructive" onClick={clearDrawings}>
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Settings Button */}
            <Popover open={showSettingsMenu} onOpenChange={setShowSettingsMenu}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Chart Settings</h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-volume">Show Volume</Label>
                    <Switch id="show-volume" checked={showVolume} onCheckedChange={setShowVolume} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid">Show Grid</Label>
                    <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
                  </div>

                  {showOptionsData && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-options">Show Options Data</Label>
                      <Switch id="show-options" checked={showOptionsOverlay} onCheckedChange={setShowOptionsOverlay} />
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Zoom Controls */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const newRangeSize = (visibleRange.end - visibleRange.start) * 0.8
                      setVisibleRange({
                        start: visibleRange.start,
                        end: Math.min(chartData.length, visibleRange.start + newRangeSize),
                      })
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const newRangeSize = (visibleRange.end - visibleRange.start) * 1.2
                      setVisibleRange({
                        start: visibleRange.start,
                        end: Math.min(chartData.length, visibleRange.start + newRangeSize),
                      })
                    }}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setVisibleRange({ start: 0, end: chartData.length })
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Zoom</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="flex-1 relative" onWheel={handleWheel}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

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
              {price.toFixed(getDecimalPlaces(symbol))}
              {priceDirection === "up" && <ArrowUpRight className="inline h-4 w-4 ml-1" />}
              {priceDirection === "down" && <ArrowDownRight className="inline h-4 w-4 ml-1" />}
            </div>
          </div>
        </div>
      </div>
      {/* Trade Manager Panel */}
      {showTradeManager && (
        <div
          className="absolute bg-blue-100/90 dark:bg-blue-900/90 border border-blue-300 dark:border-blue-700 rounded shadow-lg z-50"
          style={{
            top: `${tradeManagerPosition.y}px`,
            left: `${tradeManagerPosition.x}px`,
            width: "380px",
          }}
          onMouseDown={handleTradeManagerDragStart}
        >
          <div className="panel-header bg-blue-500 dark:bg-blue-800 text-white px-2 py-1 flex justify-between items-center cursor-move">
            <div className="font-medium">
              KT Trade Manager EA <span className="text-xs ml-1">({symbol})</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="text-white hover:text-gray-200 text-xs">_</button>
              <button className="text-white hover:text-gray-200 text-xs" onClick={() => setShowTradeManager(false)}>
                ×
              </button>
            </div>
          </div>

          <div className="p-2">
            {/* Current Price Display - New Integration */}
            <div className="mb-2 flex justify-between items-center border-b border-blue-200 dark:border-blue-700 pb-1">
              <div className="text-sm font-semibold">Current Price:</div>
              <div
                className={`text-lg font-bold ${priceDirection === "down" ? "text-red-500" : priceDirection === "up" ? "text-green-500" : "text-blue-500"}`}
              >
                {price.toFixed(getDecimalPlaces(symbol))}
                {priceDirection === "up" && <ArrowUpRight className="inline h-4 w-4 ml-1" />}
                {priceDirection === "down" && <ArrowDownRight className="inline h-4 w-4 ml-1" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Trading Action */}
              <div className="border border-gray-300 dark:border-gray-700 rounded p-2">
                <div className="text-center font-bold mb-2">Trading Action</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center">
                    <label className="text-xs mr-1">% Risk</label>
                    <select className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full">
                      <option>1% Risk</option>
                      <option>2% Risk</option>
                      <option>3% Risk</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={currentTrade.risk}
                      onChange={(e) => setCurrentTrade({ ...currentTrade, risk: Number.parseFloat(e.target.value) })}
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center">
                    <label className="text-xs mr-1">Comment</label>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={currentTrade.comment}
                      onChange={(e) => setCurrentTrade({ ...currentTrade, comment: e.target.value })}
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center">
                    <label className="text-xs mr-1">TP Points</label>
                    <select className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full">
                      <option>TP Points</option>
                      <option>TP Price</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={currentTrade.tpPoints}
                      onChange={(e) =>
                        setCurrentTrade({ ...currentTrade, tpPoints: Number.parseFloat(e.target.value) })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center">
                    <label className="text-xs mr-1">SL Points</label>
                    <select className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full">
                      <option>SL Points</option>
                      <option>SL Price</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={currentTrade.slPoints}
                      onChange={(e) =>
                        setCurrentTrade({ ...currentTrade, slPoints: Number.parseFloat(e.target.value) })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`text-white font-bold py-1 px-2 rounded ${currentTrade.type === "SELL" ? "bg-red-500 hover:bg-red-600" : "bg-gray-400"}`}
                    onClick={() => setCurrentTrade({ ...currentTrade, type: "SELL" })}
                  >
                    SELL
                  </button>
                  <button
                    className={`text-white font-bold py-1 px-2 rounded ${currentTrade.type === "BUY" ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"}`}
                    onClick={() => setCurrentTrade({ ...currentTrade, type: "BUY" })}
                  >
                    BUY
                  </button>
                </div>

                <div className="text-center mt-2 font-bold text-green-500">{currentTrade.profit.toFixed(2)}</div>

                <div className="text-xs mt-2">
                  <div>Current Loss : {tradeStats.currentLoss.toFixed(2)}</div>
                  <div>Current Profit: {tradeStats.currentProfit.toFixed(2)}</div>
                  <div>Total Loss : {tradeStats.totalLoss.toFixed(2)}</div>
                  <div>Total Profit: {tradeStats.totalProfit.toFixed(2)}</div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                {/* Trailing Stop */}
                <div className="border border-gray-300 dark:border-gray-700 rounded p-2 mb-2">
                  <div className="text-center font-bold mb-2">Trailing Stop</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-xs">State</div>
                    <button
                      className={`text-white text-xs font-bold py-1 px-2 rounded ${trailingStopSettings.state === "ON" ? "bg-green-500" : "bg-orange-500"}`}
                      onClick={() => toggleSettingState("trailingStop")}
                    >
                      {trailingStopSettings.state}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-xs">Distance</div>
                    <input
                      type="text"
                      value={trailingStopSettings.distance}
                      onChange={(e) =>
                        setTrailingStopSettings({
                          ...trailingStopSettings,
                          distance: Number.parseFloat(e.target.value),
                        })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs">Trail Step</div>
                    <input
                      type="text"
                      value={trailingStopSettings.step}
                      onChange={(e) =>
                        setTrailingStopSettings({ ...trailingStopSettings, step: Number.parseFloat(e.target.value) })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
                    />
                  </div>
                </div>

                {/* Breakeven */}
                <div className="border border-gray-300 dark:border-gray-700 rounded p-2 mb-2">
                  <div className="text-center font-bold mb-2">Breakeven</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-xs">State</div>
                    <button
                      className={`text-white text-xs font-bold py-1 px-2 rounded ${breakEvenSettings.state === "ON" ? "bg-green-500" : "bg-orange-500"}`}
                      onClick={() => toggleSettingState("breakEven")}
                    >
                      {breakEvenSettings.state}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs">Trigger</div>
                    <input
                      type="text"
                      value={breakEvenSettings.trigger}
                      onChange={(e) =>
                        setBreakEvenSettings({ ...breakEvenSettings, trigger: Number.parseFloat(e.target.value) })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
                    />
                  </div>
                </div>

                {/* Partial Close */}
                <div className="border border-gray-300 dark:border-gray-700 rounded p-2 mb-2">
                  <div className="text-center font-bold mb-2">Partial Close</div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-xs">State</div>
                    <button
                      className={`text-white text-xs font-bold py-1 px-2 rounded ${partialCloseSettings.state === "ON" ? "bg-green-500" : "bg-orange-500"}`}
                      onClick={() => toggleSettingState("partialClose")}
                    >
                      {partialCloseSettings.state}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-xs">Trigger</div>
                    <input
                      type="text"
                      value={partialCloseSettings.trigger}
                      onChange={(e) =>
                        setPartialCloseSettings({ ...partialCloseSettings, trigger: Number.parseFloat(e.target.value) })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs">Close %</div>
                    <input
                      type="text"
                      value={partialCloseSettings.percentage}
                      onChange={(e) =>
                        setPartialCloseSettings({
                          ...partialCloseSettings,
                          percentage: Number.parseFloat(e.target.value),
                        })
                      }
                      className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Place Pending */}
            <div className="border border-gray-300 dark:border-gray-700 rounded p-2 mb-2">
              <div className="text-center font-bold mb-2">Place Pending</div>
              <div className="flex items-center gap-2">
                <select
                  className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
                  value={pendingOrderSettings.type}
                  onChange={(e) => setPendingOrderSettings({ ...pendingOrderSettings, type: e.target.value })}
                >
                  <option>Points</option>
                  <option>Price</option>
                </select>
                <input
                  type="text"
                  value={pendingOrderSettings.points}
                  onChange={(e) =>
                    setPendingOrderSettings({ ...pendingOrderSettings, points: Number.parseFloat(e.target.value) })
                  }
                  className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1 flex-1"
                />
                <select className="text-xs border border-gray-300 dark:border-gray-700 rounded p-1">
                  <option>Buy Stop</option>
                  <option>Sell Stop</option>
                  <option>Buy Limit</option>
                  <option>Sell Limit</option>
                </select>
                <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">
                  Execute
                </button>
              </div>
            </div>

            {/* Closing Actions */}
            <div className="mb-2">
              <div className="text-center font-bold mb-2">Closing Actions</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button className="bg-orange-200 hover:bg-orange-300 text-orange-800 text-xs font-bold py-1 px-2 rounded">
                  Delete Pending
                </button>
                <button className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold py-1 px-2 rounded">
                  Close All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-purple-200 hover:bg-purple-300 text-purple-800 text-xs font-bold py-1 px-2 rounded">
                  Close All Loss
                </button>
                <button className="bg-green-200 hover:bg-green-300 text-green-800 text-xs font-bold py-1 px-2 rounded">
                  Close All Profit
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-2">www.keenbase-trading.com</div>
          </div>
        </div>
      )}
    </div>
  )
}

