"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Maximize2, Minimize2, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DockablePanelProps {
  title: string
  children: React.ReactNode
  onDetach?: () => void
  onClose?: () => void
  className?: string
  defaultPosition?: { x: number; y: number }
  defaultWidth?: number
  defaultHeight?: number
  isDocked?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function DockablePanel({
  title,
  children,
  onDetach,
  onClose,
  className = "",
  defaultPosition = { x: 100, y: 100 },
  defaultWidth = 300,
  defaultHeight = 400,
  isDocked = true,
  isCollapsed = false,
  onToggleCollapse,
}: DockablePanelProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [position, setPosition] = useState(defaultPosition)
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [localIsCollapsed, setLocalIsCollapsed] = useState(isCollapsed)
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0 })
  const startSizeRef = useRef({ width: 0, height: 0 })
  const originalHeightRef = useRef<number | null>(null)

  // Update local state when prop changes
  useEffect(() => {
    setLocalIsCollapsed(isCollapsed)
  }, [isCollapsed])

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || isDocked) return

    // Only proceed if this is the header element
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) {
      return
    }

    e.preventDefault()
    setIsDragging(true)

    // Store initial positions
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }

    // Bring panel to front
    if (panelRef.current) {
      panelRef.current.style.zIndex = "1000"
    }
  }

  // Handle resizing
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (isMaximized || isDocked || localIsCollapsed) return

    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)

    // Store initial positions and sizes
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    }

    startSizeRef.current = {
      width: size.width,
      height: size.height,
    }

    // Bring panel to front
    if (panelRef.current) {
      panelRef.current.style.zIndex = "1000"
    }
  }

  // Handle mouse movement for both dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update position during drag
        setPosition({
          x: e.clientX - startPosRef.current.x,
          y: e.clientY - startPosRef.current.y,
        })
      } else if (isResizing && resizeDirection) {
        // Calculate new size based on resize direction
        const deltaX = e.clientX - startPosRef.current.x
        const deltaY = e.clientY - startPosRef.current.y

        let newWidth = startSizeRef.current.width
        let newHeight = startSizeRef.current.height

        if (resizeDirection.includes("e")) {
          newWidth = Math.max(200, startSizeRef.current.width + deltaX)
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(150, startSizeRef.current.height + deltaY)
        }
        if (resizeDirection.includes("w")) {
          const widthChange = startPosRef.current.x - e.clientX
          newWidth = Math.max(200, startSizeRef.current.width + widthChange)
          if (newWidth !== startSizeRef.current.width) {
            setPosition((prev) => ({
              ...prev,
              x: e.clientX,
            }))
          }
        }
        if (resizeDirection.includes("n")) {
          const heightChange = startPosRef.current.y - e.clientY
          newHeight = Math.max(150, startSizeRef.current.height + heightChange)
          if (newHeight !== startSizeRef.current.height) {
            setPosition((prev) => ({
              ...prev,
              y: e.clientY,
            }))
          }
        }

        setSize({ width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection(null)

      // Reset z-index after a short delay
      if (panelRef.current) {
        setTimeout(() => {
          if (panelRef.current) {
            panelRef.current.style.zIndex = "100"
          }
        }, 100)
      }
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, resizeDirection])

  // Toggle maximize state
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  // Toggle collapse state
  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse()
    } else {
      setLocalIsCollapsed(!localIsCollapsed)
    }
  }

  // Determine if we should use the local or prop-controlled collapsed state
  const effectiveIsCollapsed = onToggleCollapse ? isCollapsed : localIsCollapsed

  return (
    <div
      ref={panelRef}
      className={`flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className} ${!isDocked ? "shadow-lg rounded-md overflow-hidden" : ""}`}
      style={{
        position: !isDocked ? "absolute" : "relative",
        top: !isDocked ? position.y : undefined,
        left: !isDocked ? position.x : undefined,
        width: isMaximized ? "100%" : !isDocked ? `${size.width}px` : "100%",
        height: isMaximized
          ? "100%"
          : effectiveIsCollapsed
            ? "auto" // When collapsed, just take the height of the header
            : !isDocked
              ? `${size.height}px`
              : "100%",
        zIndex: isDragging || isResizing ? 1000 : !isDocked ? 100 : undefined,
        transition: "height 0.2s ease-in-out",
      }}
    >
      <div
        className="bg-gray-100 dark:bg-gray-800 px-2 py-1 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 cursor-move"
        data-drag-handle
        onMouseDown={handleMouseDown}
      >
        <span className="font-medium text-sm">{title}</span>
        <div className="flex items-center space-x-1">
          {onDetach && isDocked && (
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={onDetach}>
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
          )}
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={toggleCollapse}>
            {effectiveIsCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          {!effectiveIsCollapsed && (
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={toggleMaximize}>
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content area - completely hidden when collapsed */}
      {!effectiveIsCollapsed && (
        <div ref={contentRef} className="flex-1 overflow-auto">
          {children}
        </div>
      )}

      {/* Resize handles - only shown when not docked, not maximized, and not collapsed */}
      {!isDocked && !isMaximized && !effectiveIsCollapsed && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="absolute right-0 top-0 w-2 h-full cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
          <div
            className="absolute left-0 top-0 w-2 h-full cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
        </>
      )}
    </div>
  )
}

