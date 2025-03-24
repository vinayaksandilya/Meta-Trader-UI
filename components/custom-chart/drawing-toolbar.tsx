"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Square, Circle, LineChart, Hash, Type, Trash2 } from "lucide-react"

interface DrawingToolbarProps {
  activeTool: string | null
  onToolSelect: (tool: string | null) => void
  onClearDrawings: () => void
}

export function DrawingToolbar({ activeTool, onToolSelect, onClearDrawings }: DrawingToolbarProps) {
  return (
    <div className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md p-1 flex flex-col">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "line" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 mb-1"
              onClick={() => onToolSelect(activeTool === "line" ? null : "line")}
            >
              <LineChart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Trend Line</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "rectangle" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 mb-1"
              onClick={() => onToolSelect(activeTool === "rectangle" ? null : "rectangle")}
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Rectangle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "circle" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 mb-1"
              onClick={() => onToolSelect(activeTool === "circle" ? null : "circle")}
            >
              <Circle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Circle</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "fibonacci" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 mb-1"
              onClick={() => onToolSelect(activeTool === "fibonacci" ? null : "fibonacci")}
            >
              <Hash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Fibonacci Retracement</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === "text" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7 mb-1"
              onClick={() => onToolSelect(activeTool === "text" ? null : "text")}
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Text</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onClearDrawings}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Clear All Drawings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

