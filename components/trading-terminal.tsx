"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TopNavigation } from "./top-navigation"
import { MarketWatchPanel } from "./market-watch-panel"
import { ChartWorkspace } from "./chart-workspace"
import { StrategyNavigatorPanel } from "./strategy-navigator-panel"
import { TradeTerminalPanel } from "./trade-terminal-panel"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useWindowSize } from "@/hooks/use-window-size"
import { Button } from "@/components/ui/button"
// First, import the BarChart2 icon for the Account Analysis button
import { X, ChevronDown, ChevronUp, Maximize2, Plus, ChevronLeft, BarChart2 } from "lucide-react"
import { AccountAnalysisView } from "./account-analysis-view"
// Import the OptionsChainPanel component at the top of the file
import { OptionsChainPanel } from "./options-chain-panel"

// CSS for hiding scrollbars but allowing scrolling
const scrollbarStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  .drag-over {
    border: 2px dashed #3b82f6 !important;
    background-color: rgba(59, 130, 246, 0.1);
  }
`

export default function TradingTerminal() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Update the layout state to include optionsChain
  const defaultLayout = {
    marketWatch: { visible: true, width: 280 },
    strategyNavigator: { visible: true, width: 280 },
    tradeTerminal: { visible: true, height: 250 },
    optionsChain: { visible: false, width: 280 }, // Add this line
  }

  const [layout, setLayout] = useLocalStorage("terminal-layout", defaultLayout)

  const [activeSymbol, setActiveSymbol] = useState("EURUSD")
  const [activeTimeframe, setActiveTimeframe] = useState("H1")
  const [chartLayout, setChartLayout] = useState<"single" | "grid2x2" | "grid1x2" | "grid2x1">("single")
  const [floatingPanels, setFloatingPanels] = useState<any[]>([])
  const windowSize = useWindowSize()

  // Update the collapsedPanels state to include optionsChain
  const [collapsedPanels, setCollapsedPanels] = useState({
    marketWatch: false,
    strategyNavigator: false,
    tradeTerminal: false,
    optionsChain: false, // Add this line
  })

  // Replace the activeBottomPanel state with a more flexible tabs system
  const [bottomPanelTabs, setBottomPanelTabs] = useState([
    { id: "tradeTerminal", title: "Trade Terminal", type: "tradeTerminal", active: true },
    { id: "strategyNavigator1", title: "Strategy Navigator", type: "strategyNavigator", active: false },
  ])

  const [activeBottomPanelTab, setActiveBottomPanelTab] = useState("tradeTerminal")

  // Then, add a new state to track if the analysis view is active
  const [showAnalysisView, setShowAnalysisView] = useState(false)

  // Add a new state to track where the analysis view should be displayed
  const [analysisViewPosition, setAnalysisViewPosition] = useState<"main" | "bottom">("bottom")

  // Add a function to add a new tab to the bottom panel
  const addBottomPanelTab = (type: string) => {
    const newId = `${type}${bottomPanelTabs.filter((tab) => tab.type === type).length + 1}`
    const title =
      type === "strategyNavigator" ? "Strategy Navigator" : type === "marketWatch" ? "Market Watch" : "New Tab"

    const newTab = { id: newId, title, type, active: false }

    setBottomPanelTabs([...bottomPanelTabs, newTab])
  }

  // Add a function to close a tab
  const closeBottomPanelTab = (tabId: string) => {
    const isActive = tabId === activeBottomPanelTab
    const newTabs = bottomPanelTabs.filter((tab) => tab.id !== tabId)

    // If we're about to close all tabs, add a default Trade Terminal tab
    if (newTabs.length === 0) {
      const defaultTab = { id: "tradeTerminal", title: "Trade Terminal", type: "tradeTerminal", active: true }
      setBottomPanelTabs([defaultTab])
      setActiveBottomPanelTab("tradeTerminal")
      return
    }

    if (isActive && newTabs.length > 0) {
      setActiveBottomPanelTab(newTabs[0].id)
    }

    setBottomPanelTabs(newTabs)
  }

  // Function to switch active tab
  const switchBottomPanelTab = (tabId: string) => {
    setActiveBottomPanelTab(tabId)
  }

  // Update the toggleAnalysisView function to handle both positions
  const toggleAnalysisView = () => {
    // If analysis is not showing, turn it on in the bottom position
    if (!showAnalysisView) {
      setShowAnalysisView(true)
      setAnalysisViewPosition("bottom")
    }
    // If analysis is already showing in the bottom, move it to the main area and collapse Market Watch
    else if (showAnalysisView && analysisViewPosition === "bottom") {
      setAnalysisViewPosition("main")
      if (!collapsedPanels.marketWatch) {
        setCollapsedPanels((prev) => ({
          ...prev,
          marketWatch: true,
        }))
      }
    }
    // If analysis is showing in the main area, turn it off
    else {
      setShowAnalysisView(false)
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  // Toggle panel visibility
  const togglePanel = (panel: keyof typeof layout) => {
    setLayout((prevLayout) => ({
      ...prevLayout,
      [panel]: {
        ...prevLayout[panel],
        visible: !prevLayout[panel].visible,
      },
    }))
  }

  // Resize panel
  const resizePanel = (panel: keyof typeof layout, size: number) => {
    setLayout((prevLayout) => ({
      ...prevLayout,
      [panel]: {
        ...prevLayout[panel],
        width: panel === "marketWatch" || panel === "strategyNavigator" ? size : prevLayout[panel].width,
        height: panel === "tradeTerminal" ? size : prevLayout[panel].height,
      },
    }))
  }

  // Detach panel to floating window
  const detachPanel = (panel: keyof typeof layout, title: string) => {
    setFloatingPanels((prev) => [
      ...prev,
      {
        id: panel,
        title,
        position: {
          x: Math.random() * (windowSize.width - 400) + 100,
          y: Math.random() * (windowSize.height - 400) + 100,
        },
        width: panel === "marketWatch" || panel === "strategyNavigator" ? 280 : 500,
        height: panel === "tradeTerminal" ? 250 : 400,
      },
    ])
    togglePanel(panel)
  }

  // Close floating panel
  const closeFloatingPanel = (id: string) => {
    setFloatingPanels((prev) => prev.filter((panel) => panel.id !== id))
  }

  // Add a function to toggle collapsed state
  const togglePanelCollapse = (panel: keyof typeof collapsedPanels) => {
    setCollapsedPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }))
  }

  // Set dark mode on initial load if needed
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Draggable functionality for floating panels
  const dragStartRef = useRef({ x: 0, y: 0, panelId: "" })

  const handlePanelMouseDown = (e: React.MouseEvent, panelId: string) => {
    // Only proceed if this is the header element
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) {
      return
    }

    e.preventDefault()

    const panel = floatingPanels.find((p) => p.id === panelId)
    if (!panel) return

    dragStartRef.current = {
      x: e.clientX - panel.position.x,
      y: e.clientY - panel.position.y,
      panelId,
    }

    document.addEventListener("mousemove", handlePanelMouseMove)
    document.addEventListener("mouseup", handlePanelMouseUp)

    // Bring panel to front
    const panelElement = (e.target as HTMLElement).closest(".floating-panel") as HTMLElement
    if (panelElement) {
      panelElement.style.zIndex = "1000"
    }
  }

  const handlePanelMouseMove = (e: MouseEvent) => {
    const { x, y, panelId } = dragStartRef.current
    if (!panelId) return

    setFloatingPanels((prev) =>
      prev.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              position: {
                x: e.clientX - x,
                y: e.clientY - y,
              },
            }
          : panel,
      ),
    )
  }

  const handlePanelMouseUp = () => {
    document.removeEventListener("mousemove", handlePanelMouseMove)
    document.removeEventListener("mouseup", handlePanelMouseUp)
    dragStartRef.current = { x: 0, y: 0, panelId: "" }

    // Reset z-index after a short delay
    setTimeout(() => {
      document.querySelectorAll(".floating-panel").forEach((panel) => {
        ;(panel as HTMLElement).style.zIndex = "100"
      })
    }, 100)
  }

  // Refs for resizable panels
  const marketWatchRef = useRef<HTMLDivElement>(null)
  const strategyNavigatorRef = useRef<HTMLDivElement>(null)
  const tradeTerminalRef = useRef<HTMLDivElement>(null)

  // Handle resizing for Market Watch panel
  const handleMarketWatchResize = (e: React.MouseEvent) => {
    e.preventDefault()

    const startX = e.clientX
    const startWidth = layout.marketWatch.width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(400, startWidth + (moveEvent.clientX - startX)))
      resizePanel("marketWatch", newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle resizing for Strategy Navigator panel
  const handleStrategyNavigatorResize = (e: React.MouseEvent) => {
    e.preventDefault()

    const startX = e.clientX
    const startWidth = layout.strategyNavigator.width

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(400, startWidth - (moveEvent.clientX - startX)))
      resizePanel("strategyNavigator", newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle resizing for Trade Terminal panel
  const handleTradeTerminalResize = (e: React.MouseEvent) => {
    e.preventDefault()

    const startY = e.clientY
    const startHeight = layout.tradeTerminal.height

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(150, Math.min(500, startHeight - (moveEvent.clientY - startY)))
      resizePanel("tradeTerminal", newHeight)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Add state for floating charts
  const [floatingCharts, setFloatingCharts] = useState<any[]>([])

  // Add this useEffect near the other useEffect hooks
  useEffect(() => {
    // When changing chart layout, clear any floating charts
    if (chartLayout !== "single" && floatingCharts.length > 0) {
      setFloatingCharts([])
    }
  }, [chartLayout])

  useEffect(() => {
    const handleSymbolDragStart = (e: CustomEvent) => {
      const chartWorkspace = document.querySelector(".chart-workspace")
      if (chartWorkspace) {
        chartWorkspace.classList.add("drag-target")
      }
    }

    const handleDragEnd = () => {
      const chartWorkspace = document.querySelector(".chart-workspace")
      if (chartWorkspace) {
        chartWorkspace.classList.remove("drag-target")
      }
    }

    window.addEventListener("symbol-drag-start", handleSymbolDragStart as EventListener)
    window.addEventListener("dragend", handleDragEnd)

    return () => {
      window.removeEventListener("symbol-drag-start", handleSymbolDragStart as EventListener)
      window.removeEventListener("dragend", handleDragEnd)
    }
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`flex flex-col h-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 overflow-hidden`}
      >
        {/* Top Navigation */}
        <TopNavigation
          theme={theme}
          toggleTheme={toggleTheme}
          activeTimeframe={activeTimeframe}
          setActiveTimeframe={setActiveTimeframe}
          chartLayout={chartLayout}
          setChartLayout={setChartLayout}
          togglePanel={togglePanel}
          layout={layout}
          onNewChart={() => {
            // This will trigger the ChartWorkspace to create a new floating chart
            const event = new CustomEvent("create-new-chart", {
              detail: { symbol: activeSymbol, timeframe: activeTimeframe },
            })
            window.dispatchEvent(event)
          }}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Market Watch */}
          {layout.marketWatch.visible && (
            <div
              className={`relative border-r border-gray-200 dark:border-gray-700 flex flex-col ${collapsedPanels.marketWatch ? "w-[30px]" : ""}`}
            >
              {!collapsedPanels.marketWatch ? (
                <>
                  <div
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 cursor-move text-xs"
                    data-drag-handle
                  >
                    <span className="font-medium text-sm">Market Watch</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanelCollapse("marketWatch")}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => detachPanel("marketWatch", "Market Watch")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="5" y="5" width="14" height="14" rx="2" />
                          <path d="M16 16h5v5" />
                          <path d="M21 16l-5 5" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanel("marketWatch")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div
                    ref={marketWatchRef}
                    style={{ width: layout.marketWatch.width + "px" }}
                    className="h-full overflow-auto relative"
                  >
                    <MarketWatchPanel activeSymbol={activeSymbol} setActiveSymbol={setActiveSymbol} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  {/* Market Watch Icon at the top */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={() => togglePanelCollapse("marketWatch")}
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
                      >
                        <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
                        <line x1="12" y1="6" x2="12" y2="18" />
                        <line x1="8" y1="10" x2="8" y2="14" />
                        <line x1="16" y1="10" x2="16" y2="14" />
                      </svg>
                    </Button>

                    {/* Account Analysis button */}
                    <Button
                      variant={showAnalysisView ? "default" : "ghost"}
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={toggleAnalysisView}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>

                    {/* Strategy Navigator button */}
                    <Button
                      variant={layout.strategyNavigator.visible ? "default" : "ghost"}
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={() => {
                        // Hide Market Watch and show Strategy Navigator in the left panel
                        setLayout((prevLayout) => ({
                          ...prevLayout,
                          marketWatch: {
                            ...prevLayout.marketWatch,
                            visible: false,
                          },
                          strategyNavigator: {
                            ...prevLayout.strategyNavigator,
                            visible: true,
                          },
                        }))

                        // Add a new floating panel for Strategy Navigator on the left
                        setFloatingPanels((prev) => [
                          ...prev,
                          {
                            id: "strategyNavigator",
                            title: "Strategy Navigator",
                            position: {
                              x: 0,
                              y: 50, // Position below the top navigation
                            },
                            width: 280,
                            height: windowSize.height - 100,
                            leftSidebar: true, // Mark this as a left sidebar panel
                          },
                        ])
                      }}
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
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </Button>

                    {/* Options Chain button */}
                    <Button
                      variant={layout.optionsChain.visible ? "default" : "ghost"}
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={() => togglePanel("optionsChain")}
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
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                    </Button>
                  </div>

                  {/* Toggle at the bottom */}
                  <div className="mt-auto mb-2 flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-sm"
                      onClick={() => togglePanelCollapse("marketWatch")}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {layout.optionsChain.visible && (
            <div
              className={`relative border-r border-gray-200 dark:border-gray-700 flex flex-col ${collapsedPanels.optionsChain ? "w-[30px]" : ""}`}
            >
              {!collapsedPanels.optionsChain ? (
                <>
                  <div
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 cursor-move text-xs"
                    data-drag-handle
                  >
                    <span className="font-medium text-sm">Options Chain</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanelCollapse("optionsChain")}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => detachPanel("optionsChain", "Options Chain")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="5" y="5" width="14" height="14" rx="2" />
                          <path d="M16 16h5v5" />
                          <path d="M21 16l-5 5" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanel("optionsChain")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div style={{ width: layout.optionsChain.width + "px" }} className="h-full overflow-auto relative">
                    <OptionsChainPanel activeSymbol={activeSymbol} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  {/* Options Chain Icon at the top */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-sm"
                      onClick={() => togglePanelCollapse("optionsChain")}
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
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                    </Button>
                  </div>

                  {/* Toggle at the bottom */}
                  <div className="mt-auto mb-2 flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-sm"
                      onClick={() => togglePanelCollapse("optionsChain")}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Center Area - Chart Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden chart-workspace">
              {showAnalysisView && analysisViewPosition === "main" ? (
                <AccountAnalysisView activeSymbol={activeSymbol} />
              ) : (
                <ChartWorkspace
                  activeSymbol={activeSymbol}
                  activeTimeframe={activeTimeframe}
                  chartLayout={chartLayout}
                />
              )}
            </div>

            {/* Bottom Panel - Trade Terminal & Strategy Navigator */}
            {layout.tradeTerminal.visible && (
              <div className="border-t border-gray-300 dark:border-gray-700 flex flex-col">
                {!collapsedPanels.tradeTerminal ? (
                  <>
                    <div
                      className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 cursor-move text-xs"
                      data-drag-handle
                    >
                      <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar">
                        {bottomPanelTabs.map((tab) => (
                          <button
                            key={tab.id}
                            className={`font-medium text-sm px-2 py-0.5 rounded flex items-center ${activeBottomPanelTab === tab.id ? "bg-white dark:bg-gray-700" : ""}`}
                            onClick={() => switchBottomPanelTab(tab.id)}
                          >
                            <span>{tab.title}</span>
                            {bottomPanelTabs.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  closeBottomPanelTab(tab.id)
                                }}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            )}
                          </button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 rounded-sm"
                          onClick={(e) => {
                            e.stopPropagation()

                            // Remove any existing dropdown first
                            const existingDropdown = document.getElementById("tab-dropdown-menu")
                            if (existingDropdown) {
                              document.body.removeChild(existingDropdown)
                              return // If we're closing an existing dropdown, just return
                            }

                            // Get the button position for proper dropdown placement
                            const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect()

                            // Create a dropdown menu element
                            const dropdown = document.createElement("div")
                            dropdown.id = "tab-dropdown-menu"
                            dropdown.className =
                              "absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1"

                            // Position dropdown below the add button
                            dropdown.style.top = `${buttonRect.bottom + 5}px`
                            dropdown.style.left = `${buttonRect.left}px`

                            // Add menu items
                            const menuItems = [
                              { label: "Add Trade Terminal", action: () => addBottomPanelTab("tradeTerminal") },
                              { label: "Add Strategy Navigator", action: () => addBottomPanelTab("strategyNavigator") },
                              { label: "Add Market Watch", action: () => addBottomPanelTab("marketWatch") },
                            ]

                            menuItems.forEach((item) => {
                              const menuItem = document.createElement("button")
                              menuItem.className =
                                "w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              menuItem.innerText = item.label
                              menuItem.onclick = (menuEvent) => {
                                menuEvent.stopPropagation()
                                item.action()
                                // Remove dropdown
                                if (document.body.contains(dropdown)) {
                                  document.body.removeChild(dropdown)
                                }
                              }
                              dropdown.appendChild(menuItem)
                            })

                            document.body.appendChild(dropdown)

                            // Function to handle clicks outside the dropdown
                            const handleClickOutside = (clickEvent: MouseEvent) => {
                              if (!dropdown.contains(clickEvent.target as Node)) {
                                if (document.body.contains(dropdown)) {
                                  document.body.removeChild(dropdown)
                                }
                                document.removeEventListener("click", handleClickOutside)
                              }
                            }

                            // Add the event listener with a slight delay to prevent immediate closing
                            setTimeout(() => {
                              document.addEventListener("click", handleClickOutside)
                            }, 10)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-sm"
                          onClick={() => togglePanelCollapse("tradeTerminal")}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-sm"
                          onClick={() => detachPanel("tradeTerminal", "Terminal")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="5" y="5" width="14" height="14" rx="2" />
                            <path d="M16 16h5v5" />
                            <path d="M21 16l-5 5" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-sm"
                          onClick={() => togglePanel("tradeTerminal")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div
                      ref={tradeTerminalRef}
                      style={{
                        height: layout.tradeTerminal.height + "px",
                        scrollbarWidth: "none" /* Firefox */,
                        msOverflowStyle: "none" /* IE and Edge */,
                      }}
                      className="overflow-auto relative [&::-webkit-scrollbar]:hidden"
                    >
                      {bottomPanelTabs.map((tab) => (
                        <div key={tab.id} className={`h-full ${activeBottomPanelTab === tab.id ? "block" : "hidden"}`}>
                          {tab.type === "tradeTerminal" && <TradeTerminalPanel activeSymbol={activeSymbol} />}
                          {tab.type === "strategyNavigator" && <StrategyNavigatorPanel />}
                          {tab.type === "marketWatch" && (
                            <MarketWatchPanel activeSymbol={activeSymbol} setActiveSymbol={setActiveSymbol} />
                          )}
                        </div>
                      ))}

                      {/* Resize handle */}
                      <div
                        className="absolute top-0 left-0 w-full h-1 cursor-ns-resize bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                        onMouseDown={handleTradeTerminalResize}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <div
                      className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 cursor-move text-xs"
                      data-drag-handle
                    >
                      <div className="flex items-center space-x-4 overflow-x-auto hide-scrollbar">
                        {bottomPanelTabs.map((tab) => (
                          <button
                            key={tab.id}
                            className={`font-medium text-sm px-2 py-0.5 rounded ${activeBottomPanelTab === tab.id ? "bg-white dark:bg-gray-700" : ""}`}
                            onClick={() => switchBottomPanelTab(tab.id)}
                          >
                            {tab.title}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-sm"
                          onClick={() => togglePanelCollapse("tradeTerminal")}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-sm"
                          onClick={() => detachPanel("tradeTerminal", "Terminal")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="5" y="5" width="14" height="14" rx="2" />
                            <path d="M16 16h5v5" />
                            <path d="M21 16l-5 5" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-sm"
                          onClick={() => togglePanel("tradeTerminal")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {showAnalysisView && analysisViewPosition === "bottom" && (
              <div className="border-t border-gray-300 dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center">
                  <span className="font-medium text-sm">Account Analysis</span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-sm"
                      onClick={() => setAnalysisViewPosition("main")}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-sm"
                      onClick={() => setShowAnalysisView(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div style={{ height: "300px" }} className="overflow-auto">
                  <AccountAnalysisView activeSymbol={activeSymbol} />
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Strategy Navigator */}
          {layout.strategyNavigator.visible && (
            <div
              className={`relative border-l border-gray-200 dark:border-gray-700 flex flex-col ${collapsedPanels.strategyNavigator ? "w-[30px]" : ""}`}
            >
              {!collapsedPanels.strategyNavigator ? (
                <>
                  <div
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 cursor-move text-xs"
                    data-drag-handle
                  >
                    <span className="font-medium text-sm">Strategy Navigator</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanelCollapse("strategyNavigator")}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => detachPanel("strategyNavigator", "Strategy Navigator")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="5" y="5" width="14" height="14" rx="2" />
                          <path d="M16 16h5v5" />
                          <path d="M21 16l-5 5" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanel("strategyNavigator")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div
                    ref={strategyNavigatorRef}
                    style={{ width: layout.strategyNavigator.width + "px" }}
                    className="h-full overflow-auto relative"
                  >
                    <StrategyNavigatorPanel />

                    {/* Resize handle */}
                    <div
                      className="absolute top-0 left-0 w-1 h-full cursor-ew-resize bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                      onMouseDown={handleStrategyNavigatorResize}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-auto">
                  <div
                    className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 cursor-move transform rotate-90 origin-bottom-right translate-y-full whitespace-nowrap"
                    data-drag-handle
                    style={{ width: "200px", position: "absolute", bottom: 0, right: "30px" }}
                  >
                    <span className="font-medium text-sm">Strategy Navigator</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanelCollapse("strategyNavigator")}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => detachPanel("strategyNavigator", "Strategy Navigator")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="5" y="5" width="14" height="14" rx="2" />
                          <path d="M16 16h5v5" />
                          <path d="M21 16l-5 5" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-sm"
                        onClick={() => togglePanel("strategyNavigator")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Panels */}
        {floatingPanels.map((panel) => {
          const isCollapsed = collapsedPanels[panel.id as keyof typeof collapsedPanels] || false
          const isLeftSidebar = panel.leftSidebar === true

          return (
            <div
              key={panel.id}
              className={`floating-panel border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden ${isLeftSidebar ? "border-r" : "border rounded-md"}`}
              style={{
                position: "absolute",
                top: panel.position.y,
                left: panel.position.x,
                width: panel.width,
                height: isCollapsed ? "auto" : panel.height,
                zIndex: 100,
                ...(isLeftSidebar && {
                  position: "fixed",
                  left: 0,
                  top: 50, // Position exactly below the top navigation
                  height: "calc(100vh - 50px)", // Full height minus top nav
                  borderRadius: 0,
                }),
              }}
            >
              <div
                className={`bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 cursor-move`}
                data-drag-handle
                onMouseDown={(e) => !isLeftSidebar && handlePanelMouseDown(e, panel.id)}
              >
                <span className="font-medium text-sm">{panel.title}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-sm"
                    onClick={() => {
                      // Toggle the collapsed state
                      togglePanelCollapse(panel.id as keyof typeof collapsedPanels)

                      // If this is a Strategy Navigator panel and it's being collapsed
                      if (panel.id === "strategyNavigator" && !isCollapsed) {
                        // Close this floating panel
                        closeFloatingPanel(panel.id)

                        // Make sure the Strategy Navigator is visible in the sidebar
                        setLayout((prevLayout) => ({
                          ...prevLayout,
                          strategyNavigator: {
                            ...prevLayout.strategyNavigator,
                            visible: true,
                          },
                        }))

                        // Make sure the Market Watch is hidden to avoid overlap
                        if (layout.marketWatch.visible) {
                          setLayout((prevLayout) => ({
                            ...prevLayout,
                            marketWatch: {
                              ...prevLayout.marketWatch,
                              visible: false,
                            },
                          }))
                        }
                      }
                    }}
                  >
                    {isCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  {!isCollapsed && !isLeftSidebar && (
                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-sm"
                    onClick={() => closeFloatingPanel(panel.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="h-[calc(100%-28px)] overflow-auto">
                  {panel.id === "marketWatch" && (
                    <MarketWatchPanel activeSymbol={activeSymbol} setActiveSymbol={setActiveSymbol} />
                  )}
                  {panel.id === "strategyNavigator" && <StrategyNavigatorPanel />}
                  {panel.id === "tradeTerminal" && <TradeTerminalPanel activeSymbol={activeSymbol} />}
                  {panel.id === "optionsChain" && <OptionsChainPanel activeSymbol={activeSymbol} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </DndProvider>
  )
}

