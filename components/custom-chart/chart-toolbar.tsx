"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BarChart2, BarChart3, ChevronDown, LineChart, Activity, AreaChart, Eye, EyeOff, Trash2 } from "lucide-react"
import type { Indicator } from "./chart-renderer"

interface ChartToolbarProps {
  symbol: string
  timeframe: string
  chartType: "candle" | "line" | "bar" | "area" | "heikinashi"
  onChartTypeChange: (type: "candle" | "line" | "bar" | "area" | "heikinashi") => void
  onSymbolChange?: (symbol: string) => void
  onTimeframeChange?: (timeframe: string) => void
  showVolume: boolean
  onVolumeToggle: () => void
  indicators: Indicator[]
  onAddSMA: () => void
  onAddBollingerBands: () => void
  onRemoveIndicator: (id: string) => void
  onToggleIndicatorVisibility: (id: string) => void
  compact?: boolean
}

export function ChartToolbar({
  symbol,
  timeframe,
  chartType,
  onChartTypeChange,
  onSymbolChange,
  onTimeframeChange,
  showVolume,
  onVolumeToggle,
  indicators,
  onAddSMA,
  onAddBollingerBands,
  onRemoveIndicator,
  onToggleIndicatorVisibility,
  compact = false,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <TooltipProvider>
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={chartType === "candle" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-sm"
                onClick={() => onChartTypeChange("candle")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Candlestick Chart</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-sm"
                onClick={() => onChartTypeChange("line")}
              >
                <LineChart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Line Chart</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={chartType === "bar" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-sm"
                onClick={() => onChartTypeChange("bar")}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bar Chart</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-sm"
                onClick={() => onChartTypeChange("area")}
              >
                <AreaChart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Area Chart</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={chartType === "heikinashi" ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7 rounded-sm"
                onClick={() => onChartTypeChange("heikinashi")}
              >
                <Activity className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heikin-Ashi Chart</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {!compact && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-7 px-2 text-xs flex items-center gap-1 rounded-sm">
                    Indicators <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onAddSMA}>
                    <span>Add SMA (20)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAddBollingerBands}>
                    <span>Add Bollinger Bands (20, 2)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-7 px-2 text-xs flex items-center gap-1 rounded-sm">
                    {timeframe} <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"].map((tf) => (
                    <DropdownMenuItem key={tf} onClick={() => onTimeframeChange?.(tf)}>
                      <span>{tf}</span>
                      {tf === timeframe && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showVolume ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={onVolumeToggle}
              >
                Volume
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Volume Display</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {!compact && indicators.length > 0 && (
        <div className="ml-auto flex items-center space-x-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Active Indicators:</span>
          {indicators.map((indicator) => (
            <div key={indicator.id} className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-1"
                onClick={() => onToggleIndicatorVisibility(indicator.id)}
              >
                {indicator.type.toUpperCase()}
                {indicator.type === "sma" && indicator.params.period && ` (${indicator.params.period})`}
                {indicator.type === "bollinger" && indicator.params.period && ` (${indicator.params.period})`}
                {indicator.visible ? <Eye className="h-3 w-3 ml-1" /> : <EyeOff className="h-3 w-3 ml-1" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500"
                onClick={() => onRemoveIndicator(indicator.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

