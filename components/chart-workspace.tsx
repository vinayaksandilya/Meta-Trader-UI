"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TradingChart } from "./trading-chart"
import { CustomChart } from "./custom-chart"
import { ChevronDown, Maximize2, X, Plus } from "lucide-react"

interface ChartWorkspaceProps {
  activeSymbol: string
  activeTimeframe: string
  chartLayout: "single" | "grid2x2" | "grid1x2" | "grid2x1"
}

export function ChartWorkspace({ activeSymbol, activeTimeframe, chartLayout }: ChartWorkspaceProps) {
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null)
  const [showAIOverlay, setShowAIOverlay] = useState(false)
  const [showOrderFlow, setShowOrderFlow] = useState(false)
  const [floatingCharts, setFloatingCharts] = useState<any[]>([])
  const [allChartsVisible, setAllChartsVisible] = useState(true)
  const [maximizedChartId, setMaximizedChartId] = useState<string | null>(null)
  const [chartCounter, setChartCounter] = useState(1)
  const [chartEngine, setChartEngine] = useState<"tradingview" | "custom">("tradingview")
  const [optionsData, setOptionsData] = useState<any[]>([])
  const [showOptionsData, setShowOptionsData] = useState(false)
  const [runningBots, setRunningBots] = useState<string[]>([])

  // Chart symbols for multi-chart layout
  const chartSymbols = {
    chart1: activeSymbol,
    chart2: "GBPUSD",
    chart3: "USDJPY",
    chart4: "XAUUSD",
  }

  // Initialize with a default chart if no floating charts exist
  useEffect(() => {
    if (floatingCharts.length === 0) {
      createFloatingChart(activeSymbol, activeTimeframe)
    } else {
      setAllChartsVisible(true)
    }
  }, [])

  // Create a new floating chart
  const createFloatingChart = (symbol: string, timeframe: string, customChartId?: string) => {
    const newChartId = customChartId || `chart-${Date.now()}-${chartCounter}`
    setChartCounter((prev) => prev + 1)

    // If we already have charts, position the new one in the grid
    if (floatingCharts.length > 0) {
      // Calculate available space
      const containerWidth = window.innerWidth
      const containerHeight = window.innerHeight - 100

      // Determine current grid dimensions
      const chartCount = floatingCharts.length + 1
      const cols = Math.ceil(Math.sqrt(chartCount))
      const rows = Math.ceil(chartCount / cols)

      // Calculate chart dimensions
      const gapSize = 2
      const chartWidth = Math.floor((containerWidth - gapSize * (cols - 1)) / cols)
      const chartHeight = Math.floor((containerHeight - gapSize * (rows - 1)) / rows)

      // Position for the new chart
      const row = Math.floor((chartCount - 1) / cols)
      const col = (chartCount - 1) % cols
      const x = col * (chartWidth + gapSize)
      const y = row * (chartHeight + gapSize)

      setFloatingCharts((prev) => [
        ...prev,
        {
          id: newChartId,
          position: { x, y },
          size: { width: chartWidth, height: chartHeight },
          tabs: [{ id: `tab-${Date.now()}`, symbol, timeframe }],
          activeTabIndex: 0,
          isMinimized: false,
        },
      ])
    } else {
      // First chart takes the full container
      setFloatingCharts([
        {
          id: newChartId,
          position: { x: 0, y: 0 },
          size: {
            width: window.innerWidth,
            height: window.innerHeight - 100,
          },
          tabs: [{ id: `tab-${Date.now()}`, symbol, timeframe }],
          activeTabIndex: 0,
          isMinimized: false,
        },
      ])
    }

    setAllChartsVisible(true)
  }

  // Add a tab to an existing floating chart
  const addTabToChart = (chartId: string, symbol: string, timeframe: string) => {
    setFloatingCharts((prev) =>
      prev.map((chart) => {
        if (chart.id === chartId) {
          const newTabs = [...chart.tabs, { id: `tab-${Date.now()}`, symbol, timeframe }]
          return {
            ...chart,
            tabs: newTabs,
            activeTabIndex: newTabs.length - 1,
          }
        }
        return chart
      }),
    )
  }

  // Switch active tab in a floating chart
  const switchChartTab = (chartId: string, tabIndex: number) => {
    setFloatingCharts((prev) =>
      prev.map((chart) => (chart.id === chartId ? { ...chart, activeTabIndex: tabIndex } : chart)),
    )
  }

  // Update floating chart position
  const updateChartPosition = (chartId: string, x: number, y: number) => {
    // Special case: if x and y are -9999, this is a signal to remove the chart
    if (x === -9999 && y === -9999) {
      closeFloatingChart(chartId)
      return
    }

    setFloatingCharts((prev) => prev.map((chart) => (chart.id === chartId ? { ...chart, position: { x, y } } : chart)))
  }

  // Update floating chart size
  const updateChartSize = (chartId: string, width: number, height: number) => {
    setFloatingCharts((prev) =>
      prev.map((chart) => (chart.id === chartId ? { ...chart, size: { width, height } } : chart)),
    )
  }

  // Close a floating chart
  const closeFloatingChart = (chartId: string) => {
    setFloatingCharts((prev) => {
      const newCharts = prev.filter((chart) => chart.id !== chartId)
      // If we removed the last chart, set allChartsVisible to false
      if (newCharts.length === 0) {
        setAllChartsVisible(false)
      }
      return newCharts
    })

    // If the maximized chart is closed, reset maximized state
    if (maximizedChartId === chartId) {
      setMaximizedChartId(null)
    }
  }

  // Close a tab in a floating chart
  const closeChartTab = (chartId: string, tabIndex: number) => {
    setFloatingCharts((prev) =>
      prev
        .map((chart) => {
          if (chart.id === chartId) {
            if (chart.tabs.length === 1) {
              // If this is the last tab, signal to remove the entire chart
              return { ...chart, shouldRemove: true }
            }

            const newTabs = chart.tabs.filter((_, i) => i !== tabIndex)
            const newActiveTabIndex =
              chart.activeTabIndex >= tabIndex ? Math.max(0, chart.activeTabIndex - 1) : chart.activeTabIndex

            return {
              ...chart,
              tabs: newTabs,
              activeTabIndex: newActiveTabIndex,
            }
          }
          return chart
        })
        .filter((chart) => !chart.shouldRemove),
    )
  }

  // Toggle maximize/restore for a chart
  const toggleMaximizeChart = (chartId: string) => {
    if (maximizedChartId === chartId) {
      setMaximizedChartId(null)
    } else {
      setMaximizedChartId(chartId)
    }
  }

  // Toggle minimize/restore for a chart
  const toggleMinimizeChart = (chartId: string) => {
    setFloatingCharts((prev) =>
      prev.map((chart) => {
        if (chart.id === chartId) {
          return { ...chart, isMinimized: !chart.isMinimized }
        }
        return chart
      }),
    )
  }

  // Bring a chart to the front (increase z-index)
  const bringChartToFront = (chartId: string) => {
    setFloatingCharts((prev) => {
      const chart = prev.find((c) => c.id === chartId)
      if (!chart) return prev

      return [...prev.filter((c) => c.id !== chartId), chart]
    })
  }

  useEffect(() => {
    const handleCreateNewChart = (event: CustomEvent) => {
      if (event.detail) {
        const { symbol, timeframe } = event.detail
        createFloatingChart(symbol, timeframe)
      } else {
        createFloatingChart(activeSymbol, activeTimeframe)
      }
    }

    window.addEventListener("create-new-chart", handleCreateNewChart as EventListener)

    return () => {
      window.removeEventListener("create-new-chart", handleCreateNewChart as EventListener)
    }
  }, [activeSymbol, activeTimeframe])

  // Handle drag and drop from market watch or robots
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    // Check if this is a symbol from market watch
    const symbol = e.dataTransfer.getData("text/plain")
    if (symbol) {
      createFloatingChart(symbol, activeTimeframe)
      return
    }

    // Check if this is a robot
    const robot = e.dataTransfer.getData("application/robot")
    if (robot) {
      // Get the chart under the drop point
      const chartElement = findChartElementUnderDrop(e)
      if (chartElement) {
        const chartId = chartElement.getAttribute("data-chart-id")
        if (chartId) {
          attachRobotToChart(robot, chartId)
          // Show visual feedback
          showRobotAttachedNotification(robot, chartId)
        }
      } else {
        // If dropped on empty area, create a new chart with the robot attached
        const newChartId = `chart-${Date.now()}-${chartCounter}`
        createFloatingChart(activeSymbol, activeTimeframe, newChartId)
        setTimeout(() => {
          attachRobotToChart(robot, newChartId)
          showRobotAttachedNotification(robot, newChartId)
        }, 100)
      }
    }
  }

  // Helper function to find chart element under drop point
  const findChartElementUnderDrop = (e: React.DragEvent) => {
    const elements = document.elementsFromPoint(e.clientX, e.clientY)
    return elements.find((el) => el.hasAttribute("data-chart-id"))
  }

  // Attach robot to chart
  const attachRobotToChart = (robotName: string, chartId: string) => {
    // Find the chart in floating charts
    setFloatingCharts((prev) =>
      prev.map((chart) => {
        if (chart.id === chartId) {
          return {
            ...chart,
            attachedRobot: robotName,
          }
        }
        return chart
      }),
    )

    // If it's the TradeManager robot, add it to running bots
    if (robotName === "TradeManager" && !runningBots.includes("TradeManager")) {
      setRunningBots((prev) => [...prev, "TradeManager"])

      // Dispatch event to notify the strategy navigator
      window.dispatchEvent(
        new CustomEvent("robot-attached", {
          detail: { robot: robotName, chartId },
        }),
      )
    }
  }

  // Show notification when robot is attached
  const showRobotAttachedNotification = (robotName: string, chartId: string) => {
    // Find the chart element
    const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`)
    if (!chartElement) return

    // Create notification element
    const notification = document.createElement("div")
    notification.className =
      "absolute top-10 left-1/2 transform -translate-x-1/2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-md text-sm z-50"
    notification.textContent = `${robotName} attached to chart`

    // Add to document
    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("opacity-0", "transition-opacity", "duration-500")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 500)
    }, 3000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  // Add event listener for symbol drag events
  useEffect(() => {
    const handleSymbolDragStart = () => {
      // We could add visual feedback here if needed
    }

    window.addEventListener("symbol-drag-start", handleSymbolDragStart as EventListener)

    return () => {
      window.removeEventListener("symbol-drag-start", handleSymbolDragStart as EventListener)
    }
  }, [])

  // Add this useRef at the top of the component, after the state declarations
  const prevLayoutRef = useRef(chartLayout)

  // Replace the layout adjustment useEffect with this version
  useEffect(() => {
    // Only run when chartLayout changes, not on every floatingCharts update
    if (prevLayoutRef.current === chartLayout) return
    prevLayoutRef.current = chartLayout

    // Only adjust if we have floating charts
    if (floatingCharts.length > 0) {
      // Reset any maximized chart
      setMaximizedChartId(null)

      // Create a copy of the charts array
      const newCharts = [...floatingCharts]

      // Restore any minimized charts
      newCharts.forEach((chart) => {
        if (chart.isMinimized) {
          chart.isMinimized = false
        }
      })

      // Calculate available space
      const containerWidth = window.innerWidth
      const containerHeight = window.innerHeight - 100 // Account for header/toolbar

      // Determine grid dimensions based on number of charts
      let cols = 1
      let rows = 1

      if (chartLayout === "grid1x2") {
        cols = 2
        rows = 1
      } else if (chartLayout === "grid2x1") {
        cols = 1
        rows = 2
      } else if (chartLayout === "grid2x2") {
        cols = 2
        rows = 2
      } else if (chartLayout === "single") {
        // For single layout with many charts, create an optimal grid
        const chartCount = newCharts.length
        // Calculate optimal grid dimensions
        if (chartCount <= 2) {
          cols = chartCount
          rows = 1
        } else if (chartCount <= 4) {
          cols = 2
          rows = Math.ceil(chartCount / 2)
        } else if (chartCount <= 6) {
          cols = 3
          rows = Math.ceil(chartCount / 3)
        } else if (chartCount <= 9) {
          cols = 3
          rows = Math.ceil(chartCount / 3)
        } else {
          cols = 4
          rows = Math.ceil(chartCount / 4)
        }
      }

      // Calculate chart dimensions with a small gap
      const gapSize = 2 // Small gap between charts in pixels
      const chartWidth = Math.floor((containerWidth - gapSize * (cols - 1)) / cols)
      const chartHeight = Math.floor((containerHeight - gapSize * (rows - 1)) / rows)

      // Position each chart in the grid
      newCharts.forEach((chart, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols

        // Calculate position with gaps
        const x = col * (chartWidth + gapSize)
        const y = row * (chartHeight + gapSize)

        // Update chart position and size
        chart.position = { x, y }
        chart.size = { width: chartWidth, height: chartHeight }
      })

      setFloatingCharts(newCharts)
    }
  }, [chartLayout])

  // Generate sample options data for visualization
  useEffect(() => {
    if (
      activeSymbol === "AAPL" ||
      activeSymbol === "MSFT" ||
      activeSymbol === "GOOGL" ||
      activeSymbol === "AMZN" ||
      activeSymbol === "TSLA" ||
      activeSymbol === "SPY" ||
      activeSymbol === "QQQ"
    ) {
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
          price = 100.0
      }

      // Generate strike prices around the underlying price
      const strikePriceStep = price < 50 ? 2.5 : price < 100 ? 5 : price < 200 ? 10 : 20
      const numStrikes = 10 // Number of strikes above and below the current price

      const baseStrike = Math.round(price / strikePriceStep) * strikePriceStep
      const minStrike = baseStrike - numStrikes * strikePriceStep
      const maxStrike = baseStrike + numStrikes * strikePriceStep

      const optionsDataArray = []

      for (let strike = minStrike; strike <= maxStrike; strike += strikePriceStep) {
        // Calculate option values based on strike and underlying price
        const distanceFromUnderlying = Math.abs(strike - price)

        // Very simplified option pricing model
        const callVolume = Math.floor(Math.random() * 1000)
        const putVolume = Math.floor(Math.random() * 1000)

        optionsDataArray.push({
          strike,
          callVolume,
          putVolume,
        })
      }

      setOptionsData(optionsDataArray)
    } else {
      setOptionsData([])
    }
  }, [activeSymbol])

  return (
    <div
      className="h-full flex flex-col bg-gray-100 dark:bg-gray-800 relative overflow-hidden [&>*]:m-0 [&>*]:p-0"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Chart Engine Selector */}
      <div className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-900 rounded-md shadow-md p-1 flex items-center gap-1">
        <Tabs value={chartEngine} onValueChange={(value) => setChartEngine(value as "tradingview" | "custom")}>
          <TabsList className="h-7">
            <TabsTrigger value="tradingview" className="text-xs h-7">
              TradingView
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs h-7">
              Custom
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeSymbol === "AAPL" ||
        activeSymbol === "MSFT" ||
        activeSymbol === "GOOGL" ||
        activeSymbol === "AMZN" ||
        activeSymbol === "TSLA" ||
        activeSymbol === "SPY" ||
        activeSymbol === "QQQ" ? (
          <div className="flex items-center ml-2">
            <Switch
              id="show-options-data"
              checked={showOptionsData}
              onCheckedChange={setShowOptionsData}
              className="mr-1"
            />
            <Label htmlFor="show-options-data" className="text-xs">
              Options Data
            </Label>
          </div>
        ) : null}
      </div>

      {/* Main chart area */}
      {allChartsVisible ? (
        <>
          {/* Fixed layouts (when no floating charts are present) */}
          {floatingCharts.length === 0 && !maximizedChartId && (
            <>
              {chartLayout === "single" && (
                <div className="flex-1 relative overflow-hidden">
                  {chartEngine === "tradingview" ? (
                    <TradingChart
                      symbol={activeSymbol}
                      timeframe={activeTimeframe}
                      showAIOverlay={showAIOverlay}
                      showOrderFlow={showOrderFlow}
                    />
                  ) : (
                    <CustomChart
                      symbol={activeSymbol}
                      timeframe={activeTimeframe}
                      darkMode={false}
                      showOptionsData={showOptionsData}
                      optionsData={optionsData}
                      attachedRobot={null}
                    />
                  )}
                </div>
              )}

              {/* Main chart area */}
              {/* Fix the gap issue by removing any remaining spacing and ensuring grid cells touch perfectly */}
              {chartLayout === "grid2x2" && (
                <div className="grid grid-cols-2 grid-rows-2 h-full w-full overflow-hidden">
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart1}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                        compact
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart1}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        compact
                        showOptionsData={showOptionsData}
                        optionsData={optionsData}
                        attachedRobot={null}
                      />
                    )}
                  </div>
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart2}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                        compact
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart2}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        compact
                        attachedRobot={null}
                      />
                    )}
                  </div>
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart3}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                        compact
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart3}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        compact
                        attachedRobot={null}
                      />
                    )}
                  </div>
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart4}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                        compact
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart4}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        compact
                        attachedRobot={null}
                      />
                    )}
                  </div>
                </div>
              )}

              {chartLayout === "grid1x2" && (
                <div className="grid grid-cols-2 h-full w-full overflow-hidden">
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart1}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart1}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        showOptionsData={showOptionsData}
                        optionsData={optionsData}
                        attachedRobot={null}
                      />
                    )}
                  </div>
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart2}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart2}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        attachedRobot={null}
                      />
                    )}
                  </div>
                </div>
              )}

              {chartLayout === "grid2x1" && (
                <div className="grid grid-rows-2 h-full w-full overflow-hidden">
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart1}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart1}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        showOptionsData={showOptionsData}
                        optionsData={optionsData}
                        attachedRobot={null}
                      />
                    )}
                  </div>
                  <div className="relative overflow-hidden">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={chartSymbols.chart3}
                        timeframe={activeTimeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                      />
                    ) : (
                      <CustomChart
                        symbol={chartSymbols.chart3}
                        timeframe={activeTimeframe}
                        darkMode={false}
                        attachedRobot={null}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Floating Chart Windows */}
          {floatingCharts.map((chart, index) => {
            const activeTabData = chart.tabs[chart.activeTabIndex]
            const isMaximized = maximizedChartId === chart.id

            // Skip rendering minimized charts
            if (chart.isMinimized && !isMaximized) {
              return null
            }

            return (
              <div
                key={chart.id}
                data-chart-id={chart.id}
                className="absolute rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                style={{
                  top: isMaximized ? 0 : chart.position.y,
                  left: isMaximized ? 0 : chart.position.x,
                  zIndex: isMaximized ? 1000 : 10 + index,
                  width: isMaximized ? "100%" : `${chart.size.width}px`,
                  height: isMaximized ? "calc(100% - 30px)" : `${chart.size.height}px`,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                onMouseDown={() => bringChartToFront(chart.id)}
              >
                <div className="flex flex-col h-full">
                  {/* Chart header */}
                  <div
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center text-xs cursor-move border-b border-gray-200 dark:border-gray-700"
                    data-drag-handle
                    onMouseDown={(e) => {
                      // Don't initiate drag if clicking on a button or button child elements
                      if ((e.target as HTMLElement).closest("button")) {
                        return
                      }

                      // Prevent default to avoid text selection during drag
                      e.preventDefault()

                      // Only proceed if not maximized
                      if (isMaximized) {
                        return
                      }

                      // Get initial positions
                      const initialX = e.clientX
                      const initialY = e.clientY

                      // Get current position
                      const currentLeft = chart.position.x
                      const currentTop = chart.position.y

                      // Function to handle mouse movement
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        // Calculate new position
                        const newLeft = currentLeft + (moveEvent.clientX - initialX)
                        const newTop = currentTop + (moveEvent.clientY - initialY)

                        // Update chart position
                        updateChartPosition(chart.id, newLeft, newTop)
                      }

                      // Function to handle mouse up - remove event listeners
                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                      }

                      // Add event listeners for dragging
                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)

                      // Bring chart to front
                      bringChartToFront(chart.id)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {activeTabData.symbol}, {activeTabData.timeframe}
                      </span>
                      {chart.attachedRobot && (
                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">
                          {chart.attachedRobot}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => toggleMinimizeChart(chart.id)}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => toggleMaximizeChart(chart.id)}
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => closeFloatingChart(chart.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Chart content */}
                  <div className="flex-1 relative">
                    {chartEngine === "tradingview" ? (
                      <TradingChart
                        symbol={activeTabData.symbol}
                        timeframe={activeTabData.timeframe}
                        showAIOverlay={showAIOverlay}
                        showOrderFlow={showOrderFlow}
                        compact={false}
                      />
                    ) : (
                      <CustomChart
                        symbol={activeTabData.symbol}
                        timeframe={activeTabData.timeframe}
                        darkMode={false}
                        compact={false}
                        showOptionsData={
                          showOptionsData &&
                          (activeTabData.symbol === "AAPL" ||
                            activeTabData.symbol === "MSFT" ||
                            activeTabData.symbol === "GOOGL" ||
                            activeTabData.symbol === "AMZN" ||
                            activeTabData.symbol === "TSLA" ||
                            activeTabData.symbol === "SPY" ||
                            activeTabData.symbol === "QQQ")
                        }
                        optionsData={optionsData}
                        attachedRobot={chart.attachedRobot}
                      />
                    )}
                  </div>
                </div>

                {/* Resize handles - only shown when not maximized */}
                {!isMaximized && (
                  <>
                    {/* Corner resize handles */}
                    <div
                      className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startY = e.clientY
                        const startWidth = chart.size.width
                        const startHeight = chart.size.height

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX))
                          const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY))

                          updateChartSize(chart.id, newWidth, newHeight)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startY = e.clientY
                        const startWidth = chart.size.width
                        const startHeight = chart.size.height
                        const startLeft = chart.position.x

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const deltaX = startX - moveEvent.clientX
                          const newWidth = Math.max(300, startWidth + deltaX)
                          const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY))
                          const newLeft = startLeft - (newWidth - startWidth)

                          updateChartSize(chart.id, newWidth, newHeight)
                          updateChartPosition(chart.id, newLeft, chart.position.y)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-6 h-6 cursor-ne-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startY = e.clientY
                        const startWidth = chart.size.width
                        const startHeight = chart.size.height
                        const startTop = chart.position.y

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const deltaY = startY - moveEvent.clientY
                          const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX))
                          const newHeight = Math.max(200, startHeight + deltaY)
                          const newTop = startTop - (newHeight - startHeight)

                          updateChartSize(chart.id, newWidth, newHeight)
                          updateChartPosition(chart.id, chart.position.x, newTop)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                    <div
                      className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startY = e.clientY
                        const startWidth = chart.size.width
                        const startHeight = chart.size.height
                        const startLeft = chart.position.x
                        const startTop = chart.position.y

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const deltaX = startX - moveEvent.clientX
                          const deltaY = startY - moveEvent.clientY
                          const newWidth = Math.max(300, startWidth + deltaX)
                          const newHeight = Math.max(200, startHeight + deltaY)
                          const newLeft = startLeft - (newWidth - startWidth)
                          const newTop = startTop - (newHeight - startHeight)

                          updateChartSize(chart.id, newWidth, newHeight)
                          updateChartPosition(chart.id, newLeft, newTop)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />

                    {/* Edge resize handles */}
                    <div
                      className="absolute top-6 bottom-6 right-0 w-3 cursor-e-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startWidth = chart.size.width

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX))
                          updateChartSize(chart.id, newWidth, chart.size.height)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                    <div
                      className="absolute top-6 bottom-6 left-0 w-3 cursor-w-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startWidth = chart.size.width
                        const startLeft = chart.position.x

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const deltaX = startX - moveEvent.clientX
                          const newWidth = Math.max(300, startWidth + deltaX)
                          const newLeft = startLeft - (newWidth - startWidth)

                          updateChartSize(chart.id, newWidth, chart.size.height)
                          updateChartPosition(chart.id, newLeft, chart.position.y)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                    <div
                      className="absolute left-6 right-6 bottom-0 h-3 cursor-s-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startY = e.clientY
                        const startHeight = chart.size.height

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const newHeight = Math.max(200, startHeight + (moveEvent.clientY - startY))
                          updateChartSize(chart.id, chart.size.width, newHeight)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                    <div
                      className="absolute left-6 right-6 top-0 h-3 cursor-n-resize hover:bg-blue-500/20"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startY = e.clientY
                        const startHeight = chart.size.height
                        const startTop = chart.position.y

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          moveEvent.preventDefault()
                          moveEvent.stopPropagation()

                          const deltaY = startY - moveEvent.clientY
                          const newHeight = Math.max(200, startHeight + deltaY)
                          const newTop = startTop - (newHeight - startHeight)

                          updateChartSize(chart.id, chart.size.width, newHeight)
                          updateChartPosition(chart.id, chart.position.x, newTop)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                      }}
                    />
                  </>
                )}
              </div>
            )
          })}

          {/* Minimized charts bar at the bottom */}
          {floatingCharts.some((chart) => chart.isMinimized && maximizedChartId !== chart.id) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-100/80 dark:bg-gray-800/80 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center px-1 py-0.5 z-50 backdrop-blur-sm">
              {floatingCharts
                .filter((chart) => chart.isMinimized && maximizedChartId !== chart.id)
                .map((chart) => {
                  const activeTabData = chart.tabs[chart.activeTabIndex]
                  return (
                    <button
                      key={chart.id}
                      className="px-2 py-0.5 text-[10px] rounded-md flex items-center gap-1 bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600 mr-1"
                      onClick={() => toggleMinimizeChart(chart.id)}
                    >
                      {activeTabData.symbol},{activeTabData.timeframe}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 ml-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeFloatingChart(chart.id)
                        }}
                      >
                        <span className="text-[8px]">×</span>
                      </Button>
                    </button>
                  )
                })}
            </div>
          )}
        </>
      ) : (
        // Show a blank light gray screen with "New Chart" button when all charts are closed
        <div className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No charts are currently open</p>
            <Button onClick={() => createFloatingChart(activeSymbol, activeTimeframe)}>
              <Plus className="h-4 w-4 mr-2" /> New Chart
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

