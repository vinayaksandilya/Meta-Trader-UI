"use client"

import { Button } from "@/components/ui/button"
import type { Indicator } from "./chart-renderer"
import { Eye, EyeOff, Trash2, Plus } from "lucide-react"

interface IndicatorPanelProps {
  indicators: Indicator[]
  onAddSMA: () => void
  onAddBollingerBands: () => void
  onRemoveIndicator: (id: string) => void
  onToggleIndicatorVisibility: (id: string) => void
}

export function IndicatorPanel({
  indicators,
  onAddSMA,
  onAddBollingerBands,
  onRemoveIndicator,
  onToggleIndicatorVisibility,
}: IndicatorPanelProps) {
  return (
    <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Indicators</h3>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" className="h-6 text-xs" onClick={onAddSMA}>
            <Plus className="h-3 w-3 mr-1" />
            SMA
          </Button>
          <Button variant="outline" size="sm" className="h-6 text-xs" onClick={onAddBollingerBands}>
            <Plus className="h-3 w-3 mr-1" />
            Bollinger
          </Button>
        </div>
      </div>

      {indicators.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-xs py-2">
          No indicators added. Click the buttons above to add indicators.
        </div>
      ) : (
        <div className="space-y-1">
          {indicators.map((indicator) => (
            <div
              key={indicator.id}
              className="flex items-center justify-between p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: indicator.color }}></div>
                <span className="text-xs">
                  {indicator.type.toUpperCase()}
                  {indicator.type === "sma" && indicator.params.period && ` (${indicator.params.period})`}
                  {indicator.type === "bollinger" && indicator.params.period && ` (${indicator.params.period})`}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onToggleIndicatorVisibility(indicator.id)}
                >
                  {indicator.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

