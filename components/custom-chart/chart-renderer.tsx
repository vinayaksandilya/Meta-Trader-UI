"use client"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface ChartRendererProps {
  data: CandleData[]
  width: number
  height: number
  chartType: "candle" | "line" | "bar" | "area" | "heikinashi"
  indicators: Indicator[]
  drawings: Drawing[]
  onCanvasReady?: (ctx: CanvasRenderingContext2D) => void
  timeframe: string
  symbol: string
  priceRange?: [number, number]
  visibleRange?: [number, number]
  onVisibleRangeChange?: (range: [number, number]) => void
  onPriceRangeChange?: (range: [number, number]) => void
  gridLines?: boolean
  crosshair?: boolean
  showVolume?: boolean
  theme?: "light" | "dark"
}

export interface CandleData {
  timestamp: number
  open: number
  high: number
  close: number
  low: number
  volume: number
}

export interface Indicator {
  id: string
  type: string
  params: Record<string, any>
  data: number[][]
  visible: boolean
  color: string
  lineWidth?: number
  opacity?: number
}

export interface Drawing {
  id: string
  type: string
  points: { x: number; y: number }[]
  color: string
  lineWidth: number
  filled?: boolean
  fillColor?: string
  text?: string
}

export function ChartRenderer({
  data,
  width,
  height,
  chartType = "candle",
  indicators = [],
  drawings = [],
  onCanvasReady,
  timeframe,
  symbol,
  priceRange,
  visibleRange,
  onVisibleRangeChange,
  onPriceRangeChange,
  gridLines = true,
  crosshair = true,
  showVolume = true,
  theme: propTheme,
}: ChartRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState(0)
  const [calculatedPriceRange, setCalculatedPriceRange] = useState<[number, number]>([0, 0])
  const [calculatedVisibleRange, setCalculatedVisibleRange] = useState<[number, number]>([0, data.length - 1])

  // Get theme from next-themes
  const { resolvedTheme } = useTheme()
  const chartTheme = propTheme || (resolvedTheme as "light" | "dark") || "light"

  // Chart styling based on theme
  const chartStyles = {
    backgroundColor: chartTheme === "dark" ? "#1a1a1a" : "#ffffff",
    textColor: chartTheme === "dark" ? "#e0e0e0" : "#333333",
    gridColor: chartTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    axisColor: chartTheme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
    crosshairColor: chartTheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
    upColor: "#26a69a", // Green for up candles
    downColor: "#ef5350", // Red for down candles
    volumeUpColor: "rgba(38, 166, 154, 0.3)", // Transparent green for up volume
    volumeDownColor: "rgba(239, 83, 80, 0.3)", // Transparent red for down volume
  }

  // Initialize chart when data or dimensions change
  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Calculate price range if not provided
    if (!priceRange) {
      const visibleData = data.slice(
        Math.max(0, calculatedVisibleRange[0]),
        Math.min(data.length, calculatedVisibleRange[1] + 1),
      )

      if (visibleData.length > 0) {
        const prices = visibleData.flatMap((candle) => [candle.high, candle.low])
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        const padding = (maxPrice - minPrice) * 0.1 // 10% padding
        setCalculatedPriceRange([minPrice - padding, maxPrice + padding])
      }
    } else {
      setCalculatedPriceRange(priceRange)
    }

    // Notify parent of canvas context
    if (onCanvasReady) {
      onCanvasReady(ctx)
    }

    // Draw chart
    drawChart()
  }, [data, width, height, chartType, indicators, drawings, scale, offset, priceRange, visibleRange, chartTheme])

  // Setup overlay canvas for crosshair and interactive elements
  useEffect(() => {
    if (!overlayCanvasRef.current) return

    const canvas = overlayCanvasRef.current
    canvas.width = width
    canvas.height = height

    // Add event listeners for mouse interactions
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [width, height, crosshair, isDragging, dragStart, calculatedPriceRange, calculatedVisibleRange])

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.offsetX, y: e.offsetY })
  }

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.offsetX, y: e.offsetY })

    if (isDragging) {
      const dx = e.offsetX - dragStart.x
      const dy = e.offsetY - dragStart.y

      // Update offset for horizontal panning
      setOffset((prev) => prev + dx)

      // Update price range for vertical panning
      if (calculatedPriceRange[1] > calculatedPriceRange[0]) {
        const priceDelta = (calculatedPriceRange[1] - calculatedPriceRange[0]) * (dy / height)
        setCalculatedPriceRange([calculatedPriceRange[0] + priceDelta, calculatedPriceRange[1] + priceDelta])
      }

      setDragStart({ x: e.offsetX, y: e.offsetY })
    }

    // Draw crosshair
    if (crosshair) {
      drawCrosshair(e.offsetX, e.offsetY)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    clearOverlay()
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()

    // Zoom in/out
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => prev * zoomFactor)

    // Adjust visible range based on zoom
    const visibleCount = Math.floor((calculatedVisibleRange[1] - calculatedVisibleRange[0]) / zoomFactor)
    const center = (calculatedVisibleRange[0] + calculatedVisibleRange[1]) / 2
    const newStart = Math.max(0, Math.floor(center - visibleCount / 2))
    const newEnd = Math.min(data.length - 1, Math.ceil(center + visibleCount / 2))

    setCalculatedVisibleRange([newStart, newEnd])

    if (onVisibleRangeChange) {
      onVisibleRangeChange([newStart, newEnd])
    }
  }

  // Draw the main chart
  const drawChart = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = chartStyles.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate visible data range
    const visibleData = data.slice(
      Math.max(0, calculatedVisibleRange[0]),
      Math.min(data.length, calculatedVisibleRange[1] + 1),
    )

    if (visibleData.length === 0) return

    // Calculate chart dimensions
    const chartWidth = canvas.width
    const chartHeight = canvas.height * (showVolume ? 0.8 : 1) // Reserve space for volume if needed
    const volumeHeight = canvas.height * (showVolume ? 0.2 : 0)

    // Calculate price range
    const priceRange = calculatedPriceRange
    const priceScale = chartHeight / (priceRange[1] - priceRange[0])

    // Calculate candle width and spacing
    const totalCandles = visibleData.length
    const candleWidth = Math.max(1, (chartWidth / totalCandles) * 0.8)
    const candleSpacing = Math.max(0, (chartWidth / totalCandles) * 0.2)

    // Draw grid lines
    if (gridLines) {
      drawGrid(ctx, chartWidth, chartHeight, priceRange)
    }

    // Draw price axis
    drawPriceAxis(ctx, chartWidth, chartHeight, priceRange)

    // Draw time axis
    drawTimeAxis(ctx, chartWidth, chartHeight, visibleData)

    // Draw chart based on type
    switch (chartType) {
      case "candle":
        drawCandlesticks(ctx, visibleData, candleWidth, candleSpacing, chartHeight, priceRange)
        break
      case "line":
        drawLineChart(ctx, visibleData, chartWidth, chartHeight, priceRange)
        break
      case "bar":
        drawBarChart(ctx, visibleData, candleWidth, candleSpacing, chartHeight, priceRange)
        break
      case "area":
        drawAreaChart(ctx, visibleData, chartWidth, chartHeight, priceRange)
        break
      case "heikinashi":
        drawHeikinAshi(ctx, visibleData, candleWidth, candleSpacing, chartHeight, priceRange)
        break
    }

    // Draw volume if enabled
    if (showVolume) {
      drawVolume(ctx, visibleData, candleWidth, candleSpacing, chartHeight, volumeHeight)
    }

    // Draw indicators
    drawIndicators(ctx, indicators, visibleData, chartWidth, chartHeight, priceRange)

    // Draw drawings
    drawDrawings(ctx, drawings, chartWidth, chartHeight, priceRange, visibleData)

    // Draw symbol and timeframe info
    drawChartInfo(ctx, symbol, timeframe, chartWidth, chartHeight)
  }

  // Draw grid lines
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, priceRange: [number, number]) => {
    ctx.strokeStyle = chartStyles.gridColor
    ctx.lineWidth = 0.5

    // Horizontal grid lines (price levels)
    const priceStep = calculatePriceStep(priceRange[0], priceRange[1])
    const startPrice = Math.floor(priceRange[0] / priceStep) * priceStep

    for (let price = startPrice; price <= priceRange[1]; price += priceStep) {
      const y = height - ((price - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical grid lines (time intervals)
    const totalCandles = calculatedVisibleRange[1] - calculatedVisibleRange[0] + 1
    const timeStep = Math.max(1, Math.floor(totalCandles / 10)) // Show about 10 vertical lines

    for (let i = 0; i <= totalCandles; i += timeStep) {
      const x = (i / totalCandles) * width

      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  // Draw price axis
  const drawPriceAxis = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    priceRange: [number, number],
  ) => {
    ctx.fillStyle = chartStyles.textColor
    ctx.font = "10px Arial"
    ctx.textAlign = "right"

    const priceStep = calculatePriceStep(priceRange[0], priceRange[1])
    const startPrice = Math.floor(priceRange[0] / priceStep) * priceStep

    for (let price = startPrice; price <= priceRange[1]; price += priceStep) {
      const y = height - ((price - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      // Draw price label
      ctx.fillText(formatPrice(price), width - 5, y + 3)
    }
  }

  // Draw time axis
  const drawTimeAxis = (ctx: CanvasRenderingContext2D, width: number, height: number, visibleData: CandleData[]) => {
    ctx.fillStyle = chartStyles.textColor
    ctx.font = "10px Arial"
    ctx.textAlign = "center"

    const totalCandles = visibleData.length
    const timeStep = Math.max(1, Math.floor(totalCandles / 6)) // Show about 6 time labels

    for (let i = 0; i < totalCandles; i += timeStep) {
      const x = (i / totalCandles) * width
      const timestamp = visibleData[i].timestamp
      const date = new Date(timestamp)
      const timeStr = formatTime(date, timeframe)

      // Draw time label
      ctx.fillText(timeStr, x, height + 15)
    }
  }

  // Draw candlestick chart
  const drawCandlesticks = (
    ctx: CanvasRenderingContext2D,
    data: CandleData[],
    candleWidth: number,
    candleSpacing: number,
    height: number,
    priceRange: [number, number],
  ) => {
    const totalCandles = data.length

    data.forEach((candle, i) => {
      const x = (i / totalCandles) * width
      const isUp = candle.close >= candle.open

      // Calculate y-coordinates
      const openY = height - ((candle.open - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const closeY = height - ((candle.close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const highY = height - ((candle.high - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const lowY = height - ((candle.low - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      // Draw candle body
      ctx.fillStyle = isUp ? chartStyles.upColor : chartStyles.downColor
      ctx.fillRect(
        x - candleWidth / 2,
        Math.min(openY, closeY),
        candleWidth,
        Math.abs(closeY - openY) || 1, // Ensure at least 1px height
      )

      // Draw candle wicks
      ctx.strokeStyle = isUp ? chartStyles.upColor : chartStyles.downColor
      ctx.beginPath()
      // Top wick
      ctx.moveTo(x, highY)
      ctx.lineTo(x, Math.min(openY, closeY))
      // Bottom wick
      ctx.moveTo(x, Math.max(openY, closeY))
      ctx.lineTo(x, lowY)
      ctx.stroke()
    })
  }

  // Draw line chart
  const drawLineChart = (
    ctx: CanvasRenderingContext2D,
    data: CandleData[],
    chartWidth: number,
    height: number,
    priceRange: [number, number],
  ) => {
    if (data.length === 0) return

    ctx.strokeStyle = "#2196f3" // Blue line
    ctx.lineWidth = 1.5
    ctx.beginPath()

    data.forEach((candle, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = height - ((candle.close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  // Draw bar chart
  const drawBarChart = (
    ctx: CanvasRenderingContext2D,
    data: CandleData[],
    barWidth: number,
    barSpacing: number,
    height: number,
    priceRange: [number, number],
  ) => {
    const totalBars = data.length

    data.forEach((candle, i) => {
      const x = (i / totalBars) * width
      const isUp = candle.close >= candle.open

      // Calculate y-coordinates
      const openY = height - ((candle.open - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const closeY = height - ((candle.close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const highY = height - ((candle.high - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const lowY = height - ((candle.low - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      // Draw bar
      ctx.strokeStyle = isUp ? chartStyles.upColor : chartStyles.downColor

      // Draw high-low line
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Draw open tick
      ctx.beginPath()
      ctx.moveTo(x, openY)
      ctx.lineTo(x - 3, openY)
      ctx.stroke()

      // Draw close tick
      ctx.beginPath()
      ctx.moveTo(x, closeY)
      ctx.lineTo(x + 3, closeY)
      ctx.stroke()
    })
  }

  // Draw area chart
  const drawAreaChart = (
    ctx: CanvasRenderingContext2D,
    data: CandleData[],
    chartWidth: number,
    height: number,
    priceRange: [number, number],
  ) => {
    if (data.length === 0) return

    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(33, 150, 243, 0.5)") // Semi-transparent blue at top
    gradient.addColorStop(1, "rgba(33, 150, 243, 0.1)") // Very transparent blue at bottom

    ctx.fillStyle = gradient
    ctx.strokeStyle = "#2196f3" // Blue line
    ctx.lineWidth = 1.5
    ctx.beginPath()

    // Start at the bottom left
    ctx.moveTo(0, height)

    // Draw line to the first point
    const firstY = height - ((data[0].close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
    ctx.lineTo(0, firstY)

    // Draw the line through all points
    data.forEach((candle, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = height - ((candle.close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      ctx.lineTo(x, y)
    })

    // Complete the path back to the bottom
    ctx.lineTo(chartWidth, height)
    ctx.closePath()
    ctx.fill()

    // Draw the line on top
    ctx.beginPath()
    data.forEach((candle, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = height - ((candle.close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }

  // Draw Heikin-Ashi chart
  const drawHeikinAshi = (
    ctx: CanvasRenderingContext2D,
    data: CandleData[],
    candleWidth: number,
    candleSpacing: number,
    height: number,
    priceRange: [number, number],
  ) => {
    if (data.length === 0) return

    // Calculate Heikin-Ashi values
    const haData = calculateHeikinAshi(data)
    const totalCandles = haData.length

    haData.forEach((candle, i) => {
      const x = (i / totalCandles) * width
      const isUp = candle.close >= candle.open

      // Calculate y-coordinates
      const openY = height - ((candle.open - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const closeY = height - ((candle.close - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const highY = height - ((candle.high - priceRange[0]) / (priceRange[1] - priceRange[0])) * height
      const lowY = height - ((candle.low - priceRange[0]) / (priceRange[1] - priceRange[0])) * height

      // Draw candle body
      ctx.fillStyle = isUp ? chartStyles.upColor : chartStyles.downColor
      ctx.fillRect(
        x - candleWidth / 2,
        Math.min(openY, closeY),
        candleWidth,
        Math.abs(closeY - openY) || 1, // Ensure at least 1px height
      )

      // Draw candle wicks
      ctx.strokeStyle = isUp ? chartStyles.upColor : chartStyles.downColor
      ctx.beginPath()
      // Top wick
      ctx.moveTo(x, highY)
      ctx.lineTo(x, Math.min(openY, closeY))
      // Bottom wick
      ctx.moveTo(x, Math.max(openY, closeY))
      ctx.lineTo(x, lowY)
      ctx.stroke()
    })
  }

  // Draw volume bars
  const drawVolume = (
    ctx: CanvasRenderingContext2D,
    data: CandleData[],
    barWidth: number,
    barSpacing: number,
    chartHeight: number,
    volumeHeight: number,
  ) => {
    if (data.length === 0 || volumeHeight <= 0) return

    // Find max volume for scaling
    const maxVolume = Math.max(...data.map((candle) => candle.volume))
    const volumeScale = volumeHeight / maxVolume
    const totalBars = data.length

    // Draw volume bars
    data.forEach((candle, i) => {
      const x = (i / totalBars) * width
      const isUp = candle.close >= candle.open
      const volumeBarHeight = candle.volume * volumeScale

      ctx.fillStyle = isUp ? chartStyles.volumeUpColor : chartStyles.volumeDownColor
      ctx.fillRect(x - barWidth / 2, chartHeight + volumeHeight - volumeBarHeight, barWidth, volumeBarHeight)
    })
  }

  // Draw indicators
  const drawIndicators = (
    ctx: CanvasRenderingContext2D,
    indicators: Indicator[],
    data: CandleData[],
    chartWidth: number,
    chartHeight: number,
    priceRange: [number, number],
  ) => {
    indicators.forEach((indicator) => {
      if (!indicator.visible || !indicator.data || indicator.data.length === 0) return

      ctx.strokeStyle = indicator.color
      ctx.lineWidth = indicator.lineWidth || 1

      if (indicator.opacity !== undefined) {
        ctx.globalAlpha = indicator.opacity
      }

      // Draw based on indicator type
      switch (indicator.type) {
        case "ma":
        case "ema":
        case "sma":
          drawLineIndicator(ctx, indicator.data[0], data.length, chartWidth, chartHeight, priceRange)
          break
        case "bollinger":
          // Draw middle band
          drawLineIndicator(ctx, indicator.data[0], data.length, chartWidth, chartHeight, priceRange)
          // Draw upper band
          drawLineIndicator(ctx, indicator.data[1], data.length, chartWidth, chartHeight, priceRange)
          // Draw lower band
          drawLineIndicator(ctx, indicator.data[2], data.length, chartWidth, chartHeight, priceRange)
          break
        case "rsi":
        case "macd":
        case "stochastic":
          // These would typically be drawn in a separate panel
          // For simplicity, we're not implementing that here
          break
      }

      ctx.globalAlpha = 1 // Reset opacity
    })
  }

  // Draw a line indicator
  const drawLineIndicator = (
    ctx: CanvasRenderingContext2D,
    data: number[],
    totalCandles: number,
    chartWidth: number,
    chartHeight: number,
    priceRange: [number, number],
  ) => {
    if (data.length === 0) return

    ctx.beginPath()

    data.forEach((value, i) => {
      if (value === null || value === undefined) return

      const x = (i / (totalCandles - 1)) * chartWidth
      const y = chartHeight - ((value - priceRange[0]) / (priceRange[1] - priceRange[0])) * chartHeight

      if (i === 0 || data[i - 1] === null || data[i - 1] === undefined) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  // Draw drawings (trend lines, fibonacci, etc.)
  const drawDrawings = (
    ctx: CanvasRenderingContext2D,
    drawings: Drawing[],
    chartWidth: number,
    chartHeight: number,
    priceRange: [number, number],
    data: CandleData[],
  ) => {
    drawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color
      ctx.lineWidth = drawing.lineWidth

      switch (drawing.type) {
        case "line":
          if (drawing.points.length >= 2) {
            ctx.beginPath()
            ctx.moveTo(drawing.points[0].x * chartWidth, drawing.points[0].y * chartHeight)
            ctx.lineTo(drawing.points[1].x * chartWidth, drawing.points[1].y * chartHeight)
            ctx.stroke()
          }
          break
        case "rectangle":
          if (drawing.points.length >= 2) {
            const x1 = drawing.points[0].x * chartWidth
            const y1 = drawing.points[0].y * chartHeight
            const x2 = drawing.points[1].x * chartWidth
            const y2 = drawing.points[1].y * chartHeight

            ctx.beginPath()
            ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))
            ctx.stroke()

            if (drawing.filled && drawing.fillColor) {
              ctx.fillStyle = drawing.fillColor
              ctx.fill()
            }
          }
          break
        case "circle":
          if (drawing.points.length >= 2) {
            const x1 = drawing.points[0].x * chartWidth
            const y1 = drawing.points[0].y * chartHeight
            const x2 = drawing.points[1].x * chartWidth
            const y2 = drawing.points[1].y * chartHeight

            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

            ctx.beginPath()
            ctx.arc(x1, y1, radius, 0, Math.PI * 2)
            ctx.stroke()

            if (drawing.filled && drawing.fillColor) {
              ctx.fillStyle = drawing.fillColor
              ctx.fill()
            }
          }
          break
        case "fibonacci":
          if (drawing.points.length >= 2) {
            const x1 = drawing.points[0].x * chartWidth
            const y1 = drawing.points[0].y * chartHeight
            const x2 = drawing.points[1].x * chartWidth
            const y2 = drawing.points[1].y * chartHeight

            const height = y2 - y1
            const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]

            // Draw lines at each Fibonacci level
            levels.forEach((level) => {
              const y = y1 + height * level

              ctx.beginPath()
              ctx.moveTo(0, y)
              ctx.lineTo(chartWidth, y)
              ctx.stroke()

              // Draw level label
              ctx.fillStyle = drawing.color
              ctx.font = "10px Arial"
              ctx.textAlign = "left"
              ctx.fillText(`${(level * 100).toFixed(1)}%`, 5, y - 3)
            })
          }
          break
        case "text":
          if (drawing.points.length >= 1 && drawing.text) {
            const x = drawing.points[0].x * chartWidth
            const y = drawing.points[0].y * chartHeight

            ctx.fillStyle = drawing.color
            ctx.font = "12px Arial"
            ctx.textAlign = "left"
            ctx.fillText(drawing.text, x, y)
          }
          break
      }
    })
  }

  // Draw chart info (symbol, timeframe)
  const drawChartInfo = (
    ctx: CanvasRenderingContext2D,
    symbol: string,
    timeframe: string,
    chartWidth: number,
    chartHeight: number,
  ) => {
    ctx.fillStyle = chartStyles.textColor
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`${symbol} ${timeframe}`, 10, 20)
  }

  // Draw crosshair
  const drawCrosshair = (x: number, y: number) => {
    if (!overlayCanvasRef.current) return

    const canvas = overlayCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear previous crosshair
    clearOverlay()

    // Draw crosshair lines
    ctx.strokeStyle = chartStyles.crosshairColor
    ctx.lineWidth = 0.5

    // Horizontal line
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()

    // Vertical line
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()

    // Draw price label
    if (calculatedPriceRange[1] > calculatedPriceRange[0]) {
      const price = calculatedPriceRange[1] - (y / canvas.height) * (calculatedPriceRange[1] - calculatedPriceRange[0])

      ctx.fillStyle = chartStyles.backgroundColor
      ctx.fillRect(canvas.width - 60, y - 10, 55, 20)
      ctx.strokeRect(canvas.width - 60, y - 10, 55, 20)

      ctx.fillStyle = chartStyles.textColor
      ctx.font = "10px Arial"
      ctx.textAlign = "right"
      ctx.fillText(formatPrice(price), canvas.width - 10, y + 4)
    }

    // Draw time label if we have data
    if (data.length > 0) {
      const dataIndex = Math.floor((x / canvas.width) * data.length)
      if (dataIndex >= 0 && dataIndex < data.length) {
        const timestamp = data[dataIndex].timestamp
        const date = new Date(timestamp)
        const timeStr = formatTime(date, timeframe)

        ctx.fillStyle = chartStyles.backgroundColor
        ctx.fillRect(x - 40, canvas.height - 20, 80, 20)
        ctx.strokeRect(x - 40, canvas.height - 20, 80, 20)

        ctx.fillStyle = chartStyles.textColor
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(timeStr, x, canvas.height - 7)
      }
    }
  }

  // Clear overlay canvas
  const clearOverlay = () => {
    if (!overlayCanvasRef.current) return

    const canvas = overlayCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // Helper functions

  // Calculate appropriate price step for grid lines
  const calculatePriceStep = (minPrice: number, maxPrice: number): number => {
    const range = maxPrice - minPrice
    const magnitude = Math.pow(10, Math.floor(Math.log10(range)))

    if (range / magnitude >= 5) {
      return magnitude
    } else if (range / magnitude >= 2) {
      return magnitude / 2
    } else {
      return magnitude / 5
    }
  }

  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toFixed(2)
    } else if (price >= 100) {
      return price.toFixed(3)
    } else if (price >= 10) {
      return price.toFixed(4)
    } else {
      return price.toFixed(5)
    }
  }

  // Format time based on timeframe
  const formatTime = (date: Date, timeframe: string): string => {
    if (timeframe.includes("M") || timeframe.includes("m")) {
      // Minutes timeframe
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    } else if (timeframe.includes("H") || timeframe.includes("h")) {
      // Hours timeframe
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`
    } else if (timeframe.includes("D") || timeframe.includes("d")) {
      // Daily timeframe
      return `${date.getMonth() + 1}/${date.getDate()}`
    } else if (timeframe.includes("W") || timeframe.includes("w")) {
      // Weekly timeframe
      return `${date.getMonth() + 1}/${date.getDate()}`
    } else if (timeframe.includes("MN") || timeframe.includes("M")) {
      // Monthly timeframe
      return `${date.getMonth() + 1}/${date.getFullYear()}`
    } else {
      // Default format
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    }
  }

  // Calculate Heikin-Ashi values
  const calculateHeikinAshi = (data: CandleData[]): CandleData[] => {
    const result: CandleData[] = []

    data.forEach((candle, i) => {
      if (i === 0) {
        // First candle is the same as regular candle
        result.push({
          timestamp: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: (candle.open + candle.high + candle.low + candle.close) / 4,
          volume: candle.volume,
        })
      } else {
        const prevHA = result[i - 1]
        const haOpen = (prevHA.open + prevHA.close) / 2
        const haClose = (candle.open + candle.high + candle.low + candle.close) / 4
        const haHigh = Math.max(candle.high, haOpen, haClose)
        const haLow = Math.min(candle.low, haOpen, haClose)

        result.push({
          timestamp: candle.timestamp,
          open: haOpen,
          high: haHigh,
          low: haLow,
          close: haClose,
          volume: candle.volume,
        })
      }
    })

    return result
  }

  return (
    <div className="relative" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} className="absolute top-0 left-0" />
      <canvas
        ref={overlayCanvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0"
        style={{ cursor: isDragging ? "grabbing" : "crosshair" }}
      />
    </div>
  )
}

