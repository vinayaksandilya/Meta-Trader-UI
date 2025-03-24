"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface ResizablePanelProps {
  children: React.ReactNode
  direction: "horizontal" | "vertical"
  defaultSize: number
  minSize?: number
  maxSize?: number
  onResize?: (size: number) => void
}

export function ResizablePanel({
  children,
  direction,
  defaultSize,
  minSize = 100,
  maxSize = 800,
  onResize,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize)
  const [isResizing, setIsResizing] = useState(false)
  const startPosRef = useRef(0)
  const startSizeRef = useRef(defaultSize)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    startPosRef.current = direction === "horizontal" ? e.clientX : e.clientY
    startSizeRef.current = size
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const currentPos = direction === "horizontal" ? e.clientX : e.clientY
    const delta = direction === "horizontal" ? currentPos - startPosRef.current : startPosRef.current - currentPos

    let newSize = startSizeRef.current + delta
    newSize = Math.max(minSize, Math.min(maxSize, newSize))

    setSize(newSize)
    onResize?.(newSize)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    if (isResizing) {
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
  }, [isResizing])

  const style = direction === "horizontal" ? { width: `${size}px` } : { height: `${size}px` }

  const resizeHandleClass =
    direction === "horizontal"
      ? "w-1 h-full cursor-ew-resize right-0 top-0"
      : "h-1 w-full cursor-ns-resize bottom-0 left-0"

  return (
    <div className="relative" style={style}>
      {children}
      <div
        className={`absolute bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 ${resizeHandleClass}`}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

