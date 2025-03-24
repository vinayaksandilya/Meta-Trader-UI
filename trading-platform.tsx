"use client"

import { useState } from "react"
import {
  BarChart2,
  BarChart3,
  ChevronDown,
  Copy,
  FileText,
  FolderOpen,
  Grid,
  LineChart,
  Moon,
  Save,
  Sun,
  Zap,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Resizable } from "./resizable"
import { DraggablePanel } from "./draggable-panel"
import { Chart } from "./chart"
import { MarketWatch } from "./market-watch"
import { Navigator } from "./navigator"
import { Toolbox } from "./toolbox"
import { DepthOfMarket } from "./depth-of-market"
import { TradingTerminal } from "./trading-terminal"

export default function TradingPlatform() {
  const [darkMode, setDarkMode] = useState(false)
  const [timeframe, setTimeframe] = useState("H1")
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false)
  const [activeSymbol, setActiveSymbol] = useState("EURUSD")
  const [chartLayout, setChartLayout] = useState("single") // single, grid2x2, grid1x2
  const [panels, setPanels] = useState({
    marketWatch: true,
    navigator: true,
    toolbox: true,
    dom: false,
    terminal: true,
  })

  // Toggle panel visibility
  const togglePanel = (panel: keyof typeof panels) => {
    setPanels((prev) => ({ ...prev, [panel]: !prev[panel] }))
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={`flex flex-col h-screen bg-[#f0f0f0] text-xs overflow-hidden ${darkMode ? "dark" : ""}`}>
      {/* Top Menu Bar */}
      <div className="bg-[#e4e4e4] border-b border-gray-300 flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
        <div className="flex items-center px-2 py-1 justify-between">
          <div className="flex space-x-4">
            <span className="font-medium">File</span>
            <span className="font-medium">View</span>
            <span className="font-medium">Insert</span>
            <span className="font-medium">Charts</span>
            <span className="font-medium">Tools</span>
            <span className="font-medium">Window</span>
            <span className="font-medium">Help</span>
          </div>
          <div>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-2 py-1 bg-[#e4e4e4] border-t border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700">
          <TooltipProvider>
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New Chart</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open Chart</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save Chart</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <LineChart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Line Chart</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bar Chart</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Candlestick Chart</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none dark:text-gray-300">
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Auto Trading</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="h-6 px-2 rounded-none text-xs dark:text-gray-300">
                    New Order
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open New Order</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              <div className="relative">
                <Button
                  variant="ghost"
                  className="h-6 px-2 rounded-none text-xs flex items-center gap-1 dark:text-gray-300"
                  onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                >
                  {timeframe} <ChevronDown className="h-3 w-3" />
                </Button>

                {showTimeframeDropdown && (
                  <div className="absolute top-6 left-0 bg-white border border-gray-300 shadow-md z-50 w-32 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-1 bg-[#e4e4e4] border-b border-gray-300 font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      Timeframes
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("M1")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      M1 1 Minute
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("M5")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      M5 5 Minutes
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("M15")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      M15 15 Minutes
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("M30")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      M30 30 Minutes
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("H1")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      H1 1 Hour
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("H4")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      H4 4 Hours
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("D1")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      D1 Daily
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("W1")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      W1 Weekly
                    </div>
                    <div
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setTimeframe("MN")
                        setShowTimeframeDropdown(false)
                      }}
                    >
                      MN Monthly
                    </div>
                  </div>
                )}
              </div>

              <Separator orientation="vertical" className="h-6 dark:bg-gray-600" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none dark:text-gray-300"
                    onClick={() => setChartLayout("single")}
                  >
                    <div className="w-4 h-4 border border-current"></div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Single Chart</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none dark:text-gray-300"
                    onClick={() => setChartLayout("grid1x2")}
                  >
                    <div className="w-4 h-4 border border-current flex">
                      <div className="w-1/2 border-r border-current"></div>
                      <div className="w-1/2"></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Two Charts Horizontal</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none dark:text-gray-300"
                    onClick={() => setChartLayout("grid2x2")}
                  >
                    <div className="w-4 h-4 border border-current grid grid-cols-2 grid-rows-2">
                      <div className="border-r border-b border-current"></div>
                      <div className="border-b border-current"></div>
                      <div className="border-r border-current"></div>
                      <div></div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Four Charts Grid</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-sm text-xs dark:text-gray-300"
              onClick={() => togglePanel("marketWatch")}
            >
              Market Watch
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-sm text-xs dark:text-gray-300"
              onClick={() => togglePanel("navigator")}
            >
              Navigator
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-sm text-xs dark:text-gray-300"
              onClick={() => togglePanel("toolbox")}
            >
              Toolbox
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-sm text-xs dark:text-gray-300"
              onClick={() => togglePanel("dom")}
            >
              DOM
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-sm text-xs dark:text-gray-300"
              onClick={() => togglePanel("terminal")}
            >
              Terminal
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex flex-col">
          {panels.marketWatch && (
            <DraggablePanel
              title="Market Watch"
              defaultWidth={220}
              defaultHeight={300}
              onClose={() => togglePanel("marketWatch")}
              className="dark:bg-gray-900 dark:text-gray-200"
            >
              <MarketWatch onSymbolSelect={setActiveSymbol} activeSymbol={activeSymbol} darkMode={darkMode} />
            </DraggablePanel>
          )}

          {panels.navigator && (
            <DraggablePanel
              title="Navigator"
              defaultWidth={220}
              defaultHeight={300}
              onClose={() => togglePanel("navigator")}
              className="dark:bg-gray-900 dark:text-gray-200"
            >
              <Navigator darkMode={darkMode} />
            </DraggablePanel>
          )}
        </div>

        {/* Main Charts Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            {chartLayout === "single" && <Chart symbol={activeSymbol} timeframe={timeframe} darkMode={darkMode} />}

            {chartLayout === "grid1x2" && (
              <div className="grid grid-cols-2 h-full">
                <Chart symbol={activeSymbol} timeframe={timeframe} darkMode={darkMode} />
                <Chart symbol="GBPUSD" timeframe={timeframe} darkMode={darkMode} />
              </div>
            )}

            {chartLayout === "grid2x2" && (
              <div className="grid grid-cols-2 grid-rows-2 h-full">
                <Chart symbol={activeSymbol} timeframe={timeframe} darkMode={darkMode} />
                <Chart symbol="GBPUSD" timeframe={timeframe} darkMode={darkMode} />
                <Chart symbol="USDJPY" timeframe={timeframe} darkMode={darkMode} />
                <Chart symbol="USDCHF" timeframe={timeframe} darkMode={darkMode} />
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          {panels.terminal && (
            <Resizable
              direction="vertical"
              defaultSize={200}
              minSize={100}
              maxSize={500}
              className="border-t border-gray-300 dark:border-gray-700"
            >
              <TradingTerminal darkMode={darkMode} />
            </Resizable>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col">
          {panels.dom && (
            <DraggablePanel
              title="Depth of Market"
              defaultWidth={220}
              defaultHeight={300}
              onClose={() => togglePanel("dom")}
              className="dark:bg-gray-900 dark:text-gray-200"
            >
              <DepthOfMarket symbol={activeSymbol} darkMode={darkMode} />
            </DraggablePanel>
          )}

          {panels.toolbox && (
            <DraggablePanel
              title="Toolbox"
              defaultWidth={220}
              defaultHeight={300}
              onClose={() => togglePanel("toolbox")}
              className="dark:bg-gray-900 dark:text-gray-200"
            >
              <Toolbox darkMode={darkMode} />
            </DraggablePanel>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#e4e4e4] border-t border-gray-300 flex items-center px-2 justify-between text-[10px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-4">
          <span>Connected</span>
          <span>Ping: 42ms</span>
          <span>CPU: 12%</span>
          <span>MEM: 245MB</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{new Date().toLocaleTimeString()}</span>
          <span>Server Time: 12:34:56</span>
        </div>
      </div>
    </div>
  )
}

