"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Maximize2, Minimize2, X } from "lucide-react"

interface DraggablePanelProps {
  title: string
  children: React.ReactNode
  defaultWidth?: number
  defaultHeight?: number
  onClose?: () => void
  className?: string
}

export function DraggablePanel({
  title,
  children,
  defaultWidth = 300,
  defaultHeight = 400,
  onClose,
  className = "",
}: DraggablePanelProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [originalSize, setOriginalSize] = useState({ width: defaultWidth, height: defaultHeight })
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return

    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const toggleMaximize = () => {
    if (!isMaximized) {
      setOriginalSize({
        width: panelRef.current?.offsetWidth || defaultWidth,
        height: panelRef.current?.offsetHeight || defaultHeight,
      })
    }
    setIsMaximized(!isMaximized)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={panelRef}
      className={`absolute border border-gray-300 bg-white shadow-md flex flex-col overflow-hidden ${className}`}
      style={{
        width: isMaximized ? "100%" : `${defaultWidth}px`,
        height: isMaximized ? "100%" : `${defaultHeight}px`,
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        zIndex: isDragging ? 10 : 1,
      }}
    >
      <div
        className="bg-[#c8d8e8] px-2 py-1 flex justify-between items-center cursor-move dark:bg-gray-700"
        onMouseDown={handleMouseDown}
      >
        <span>{title}</span>
        <div className="flex items-center space-x-1">
          <button
            className="h-4 w-4 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={toggleMaximize}
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          {onClose && (
            <button
              className="h-4 w-4 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}

