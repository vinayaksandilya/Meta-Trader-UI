"use client"

import { useState } from "react"
import {
  BarChart3,
  BarChart4,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  LineChart,
  Moon,
  Plus,
  Save,
  Settings,
  Sun,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopNavigationProps {
  theme: "light" | "dark"
  toggleTheme: () => void
  activeTimeframe: string
  setActiveTimeframe: (timeframe: string) => void
  chartLayout: "single" | "grid2x2" | "grid1x2" | "grid2x1"
  setChartLayout: (layout: "single" | "grid2x2" | "grid1x2" | "grid2x1") => void
  togglePanel: (panel: string) => void
  layout: {
    marketWatch: { visible: boolean; width: number }
    strategyNavigator: { visible: boolean; width: number }
    tradeTerminal: { visible: boolean; height: number }
    optionsChain: { visible: boolean }
  }
  onNewChart?: () => void
}

export function TopNavigation({
  theme,
  toggleTheme,
  activeTimeframe,
  setActiveTimeframe,
  chartLayout,
  setChartLayout,
  togglePanel,
  layout,
  onNewChart,
}: TopNavigationProps) {
  const [activeChartType, setActiveChartType] = useState<"candle" | "line" | "bar">("candle")

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Main Menu */}
      <div className="flex items-center px-2 py-1 text-sm">
        <div className="flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">File</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>New Chart</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Save className="mr-2 h-4 w-4" />
                <span>Save Layout</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">View</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => togglePanel("marketWatch")}>
                <span>Market Watch</span>
                <span className="ml-auto">{layout.marketWatch.visible ? "✓" : ""}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePanel("strategyNavigator")}>
                <span>Strategy Navigator</span>
                <span className="ml-auto">{layout.strategyNavigator.visible ? "✓" : ""}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePanel("tradeTerminal")}>
                <span>Trade Terminal</span>
                <span className="ml-auto">{layout.tradeTerminal.visible ? "✓" : ""}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePanel("optionsChain")}>
                <span>Options Chain</span>
                <span className="ml-auto">{layout.optionsChain.visible ? "✓" : ""}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Tools</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <Zap className="mr-2 h-4 w-4" />
                <span>Strategy Tester</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Indicators</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>AI Analysis</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Window</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={onNewChart}>
                <Plus className="mr-2 h-4 w-4" />
                <span>New Chart</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setChartLayout("single")}>
                <span>Single Chart</span>
                <span className="ml-auto">{chartLayout === "single" ? "✓" : ""}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartLayout("grid1x2")}>
                <span>2 Charts (Horizontal)</span>
                <span className="ml-auto">{chartLayout === "grid1x2" ? "✓" : ""}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartLayout("grid2x1")}>
                <span>2 Charts (Vertical)</span>
                <span className="ml-auto">{chartLayout === "grid2x1" ? "✓" : ""}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartLayout("grid2x2")}>
                <span>4 Charts (Grid)</span>
                <span className="ml-auto">{chartLayout === "grid2x2" ? "✓" : ""}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="font-medium hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">Help</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Keyboard Shortcuts</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>About</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center px-2 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <TooltipProvider>
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-sm ${activeChartType === "candle" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => setActiveChartType("candle")}
                >
                  <BarChart4 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Candlestick Chart</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-sm ${activeChartType === "bar" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => setActiveChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bar Chart</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-sm ${activeChartType === "line" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => setActiveChartType("line")}
                >
                  <LineChart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Line Chart</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 px-2 text-xs flex items-center gap-1 rounded-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {activeTimeframe} <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveTimeframe("M1")}>
                  <span>M1 (1 Minute)</span>
                  <span className="ml-auto">{activeTimeframe === "M1" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("M5")}>
                  <span>M5 (5 Minutes)</span>
                  <span className="ml-auto">{activeTimeframe === "M5" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("M15")}>
                  <span>M15 (15 Minutes)</span>
                  <span className="ml-auto">{activeTimeframe === "M15" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("M30")}>
                  <span>M30 (30 Minutes)</span>
                  <span className="ml-auto">{activeTimeframe === "M30" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("H1")}>
                  <span>H1 (1 Hour)</span>
                  <span className="ml-auto">{activeTimeframe === "H1" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("H4")}>
                  <span>H4 (4 Hours)</span>
                  <span className="ml-auto">{activeTimeframe === "H4" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("D1")}>
                  <span>D1 (Daily)</span>
                  <span className="ml-auto">{activeTimeframe === "D1" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("W1")}>
                  <span>W1 (Weekly)</span>
                  <span className="ml-auto">{activeTimeframe === "W1" ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTimeframe("MN")}>
                  <span>MN (Monthly)</span>
                  <span className="ml-auto">{activeTimeframe === "MN" ? "✓" : ""}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 px-2 text-xs flex items-center gap-1 rounded-sm">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Indicators <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <span>Moving Average (MA)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Bollinger Bands (BB)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Relative Strength Index (RSI)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>MACD</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Fibonacci Retracement</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Volume Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Ichimoku Cloud</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Stochastic Oscillator</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Custom Indicators...</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-sm ${chartLayout === "single" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
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
                  className={`h-7 w-7 rounded-sm ${chartLayout === "grid1x2" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => setChartLayout("grid1x2")}
                >
                  <div className="w-4 h-4 border border-current flex">
                    <div className="w-1/2 border-r border-current"></div>
                    <div className="w-1/2"></div>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>2 Charts (Horizontal)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-sm ${chartLayout === "grid2x1" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  onClick={() => setChartLayout("grid2x1")}
                >
                  <div className="w-4 h-4 border border-current flex flex-col">
                    <div className="h-1/2 border-b border-current"></div>
                    <div className="h-1/2"></div>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>2 Charts (Vertical)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-sm ${chartLayout === "grid2x2" ? "bg-gray-200 dark:bg-gray-700" : ""}`}
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
              <TooltipContent>4 Charts (Grid)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onNewChart}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chart</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Chart</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm">
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Chart Template</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="ml-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-sm text-xs"
            onClick={() => togglePanel("marketWatch")}
          >
            Market Watch
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-sm text-xs"
            onClick={() => togglePanel("strategyNavigator")}
          >
            Strategy Navigator
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-sm text-xs"
            onClick={() => togglePanel("tradeTerminal")}
          >
            Trade Terminal
          </Button>
        </div>
      </div>
    </div>
  )
}

