"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface OptionsAnalysisChartProps {
  options: OptionData[]
  underlyingPrice: number
  width: number
  height: number
  theme?: "light" | "dark"
}

interface OptionData {
  strike: number
  callBid: number
  callAsk: number
  callIV: number
  callDelta: number
  callGamma: number
  callTheta: number
  callVega: number
  putBid: number
  putAsk: number
  putIV: number
  putDelta: number
  putGamma: number
  putTheta: number
  putVega: number
}

export function OptionsAnalysisChart({
  options,
  underlyingPrice,
  width,
  height,
  theme: propTheme,
}: OptionsAnalysisChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredStrike, setHoveredStrike] = useState<number | null>(null)

  // Get theme from next-themes
  const { resolvedTheme } = useTheme()
  const chartTheme = propTheme || (resolvedTheme as "light" | "dark") || "light"

  // Chart styling based on theme
  const chartStyles = {
    backgroundColor: chartTheme === "dark" ? "#1a1a1a" : "#ffffff",
    textColor: chartTheme === "dark" ? "#e0e0e0" : "#333333",
    gridColor: chartTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    axisColor: chartTheme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
    callColor: "#26a69a", // Green for calls
    putColor: "#ef5350", // Red for puts
    underlyingColor: "#ff9800", // Orange for underlying price
    hoverColor: chartTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Draw chart when data or dimensions change
  useEffect(() => {
    if (!canvasRef.current || !options || options.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = chartStyles.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate price range for y-axis
    const prices = options.flatMap((option) => [option.callBid, option.callAsk, option.putBid, option.putAsk])
    const maxPrice = Math.max(...prices) * 1.1 // Add 10% padding
    const minPrice = 0

    // Calculate strike range for x-axis
    const strikes = options.map((option) => option.strike)
    const minStrike = Math.min(...strikes)
    const maxStrike = Math.max(...strikes)
    const strikeRange = maxStrike - minStrike
    const paddedMinStrike = minStrike - strikeRange * 0.1
    const paddedMaxStrike = maxStrike + strikeRange * 0.1

    // Draw grid
    drawGrid(ctx, width, height, paddedMinStrike, paddedMaxStrike, minPrice, maxPrice)

    // Draw price axis
    drawPriceAxis(ctx, width, height, minPrice, maxPrice)

    // Draw strike axis
    drawStrikeAxis(ctx, width, height, paddedMinStrike, paddedMaxStrike)

    // Draw underlying price line
    drawUnderlyingPriceLine(ctx, width, height, underlyingPrice, paddedMinStrike, paddedMaxStrike, minPrice, maxPrice)

    // Draw call option prices
    drawOptionPrices(
      ctx,
      options,
      "call",
      width,
      height,
      paddedMinStrike,
      paddedMaxStrike,
      minPrice,
      maxPrice,
      chartStyles.callColor,
    )

    // Draw put option prices
    drawOptionPrices(
      ctx,
      options,
      "put",
      width,
      height,
      paddedMinStrike,
      paddedMaxStrike,
      minPrice,
      maxPrice,
      chartStyles.putColor,
    )

    // Draw hover effect if a strike is hovered
    if (hoveredStrike !== null) {
      drawHoverEffect(ctx, width, height, hoveredStrike, paddedMinStrike, paddedMaxStrike, minPrice, maxPrice)
    }
  }, [options, underlyingPrice, width, height, hoveredStrike, chartTheme])

  // Handle mouse move to show hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || options.length === 0) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left

    // Calculate strike range for x-axis
    const strikes = options.map((option) => option.strike)
    const minStrike = Math.min(...strikes)
    const maxStrike = Math.max(...strikes)
    const strikeRange = maxStrike - minStrike
    const paddedMinStrike = minStrike - strikeRange * 0.1
    const paddedMaxStrike = maxStrike + strikeRange * 0.1

    // Convert x position to strike price
    const strike = paddedMinStrike + (x / width) * (paddedMaxStrike - paddedMinStrike)

    // Find closest strike
    const closestStrike = options.reduce((prev, curr) => {
      return Math.abs(curr.strike - strike) < Math.abs(prev.strike - strike) ? curr : prev
    }).strike

    setHoveredStrike(closestStrike)
  }

  const handleMouseLeave = () => {
    setHoveredStrike(null)
  }

  // Draw grid lines
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    minStrike: number,
    maxStrike: number,
    minPrice: number,
    maxPrice: number,
  ) => {
    ctx.strokeStyle = chartStyles.gridColor
    ctx.lineWidth = 0.5

    // Horizontal grid lines (price levels)
    const priceStep = calculatePriceStep(minPrice, maxPrice)
    const startPrice = Math.floor(minPrice / priceStep) * priceStep

    for (let price = startPrice; price <= maxPrice; price += priceStep) {
      const y = height - ((price - minPrice) / (maxPrice - minPrice)) * height

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical grid lines (strike prices)
    const strikeStep = calculateStrikeStep(minStrike, maxStrike)
    const startStrike = Math.floor(minStrike / strikeStep) * strikeStep

    for (let strike = startStrike; strike <= maxStrike; strike += strikeStep) {
      const x = ((strike - minStrike) / (maxStrike - minStrike)) * width

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
    minPrice: number,
    maxPrice: number,
  ) => {
    ctx.fillStyle = chartStyles.textColor
    ctx.font = "10px Arial"
    ctx.textAlign = "right"

    const priceStep = calculatePriceStep(minPrice, maxPrice)
    const startPrice = Math.floor(minPrice / priceStep) * priceStep

    for (let price = startPrice; price <= maxPrice; price += priceStep) {
      const y = height - ((price - minPrice) / (maxPrice - minPrice)) * height

      // Draw price label
      ctx.fillText(price.toFixed(2), width - 5, y + 3)
    }
  }

  // Draw strike axis
  const drawStrikeAxis = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    minStrike: number,
    maxStrike: number,
  ) => {
    ctx.fillStyle = chartStyles.textColor
    ctx.font = "10px Arial"
    ctx.textAlign = "center"

    const strikeStep = calculateStrikeStep(minStrike, maxStrike)
    const startStrike = Math.floor(minStrike / strikeStep) * strikeStep

    for (let strike = startStrike; strike <= maxStrike; strike += strikeStep) {
      const x = ((strike - minStrike) / (maxStrike - minStrike)) * width

      // Draw strike label
      ctx.fillText(strike.toFixed(1), x, height - 5)
    }
  }

  // Draw underlying price line
  const drawUnderlyingPriceLine = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    underlyingPrice: number,
    minStrike: number,
    maxStrike: number,
    minPrice: number,
    maxPrice: number,
  ) => {
    const x = ((underlyingPrice - minStrike) / (maxStrike - minStrike)) * width

    ctx.strokeStyle = chartStyles.underlyingColor
    ctx.lineWidth = 1
    ctx.setLineDash([5, 3])

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    ctx.setLineDash([])

    // Draw label
    ctx.fillStyle = chartStyles.underlyingColor
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Current: ${underlyingPrice.toFixed(2)}`, x, 15)
  }

  // Draw option prices
  const drawOptionPrices = (
    ctx: CanvasRenderingContext2D,
    options: OptionData[],
    type: "call" | "put",
    width: number,
    height: number,
    minStrike: number,
    maxStrike: number,
    minPrice: number,
    maxPrice: number,
    color: string,
  ) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    options.forEach((option, i) => {
      const x = ((option.strike - minStrike) / (maxStrike - minStrike)) * width
      const price = type === "call" ? option.callBid : option.putBid
      const y = height - ((price - minPrice) / (maxPrice - minPrice)) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw theoretical price if available
    ctx.strokeStyle = `${color}88` // Semi-transparent
    ctx.lineWidth = 1
    ctx.beginPath()

    options.forEach((option, i) => {
      const x = ((option.strike - minStrike) / (maxStrike - minStrike)) * width
      const price = type === "call" ? option.callAsk : option.putAsk
      const y = height - ((price - minPrice) / (maxPrice - minPrice)) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  }

  // Draw hover effect
  const drawHoverEffect = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    strike: number,
    minStrike: number,
    maxStrike: number,
    minPrice: number,
    maxPrice: number,
  ) => {
    const x = ((strike - minStrike) / (maxStrike - minStrike)) * width

    // Draw vertical line
    ctx.strokeStyle = chartStyles.textColor
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()

    ctx.setLineDash([])

    // Draw strike info
    ctx.fillStyle = chartStyles.hoverColor
    ctx.fillRect(x - 50, 20, 100, 40)
    ctx.strokeStyle = chartStyles.textColor
    ctx.strokeRect(x - 50, 20, 100, 40)

    ctx.fillStyle = chartStyles.textColor
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Strike: ${strike.toFixed(1)}`, x, 35)

    // Find option data for this strike
    const option = options.find((o) => o.strike === strike)
    if (option) {
      ctx.fillText(`C: ${option.callBid.toFixed(2)} / P: ${option.putBid.toFixed(2)}`, x, 50)
    }
  }

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

  // Calculate appropriate strike step for grid lines
  const calculateStrikeStep = (minStrike: number, maxStrike: number): number => {
    const range = maxStrike - minStrike

    if (range <= 10) return 1
    if (range <= 20) return 2
    if (range <= 50) return 5
    if (range <= 100) return 10
    if (range <= 200) return 20
    return 50
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-crosshair"
    />
  )
}

