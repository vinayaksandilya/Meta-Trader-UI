"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface ResizableProps {
  children: React.ReactNode
  direction: "horizontal" | "vertical"
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
}

export function Resizable({
  children,
  direction,
  defaultSize = 300,
  minSize = 100,
  maxSize = 800,
  className = "",
}: ResizableProps) {
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
    const delta = currentPos - startPosRef.current

    let newSize
    if (direction === "horizontal") {
      newSize = startSizeRef.current + delta
    } else {
      newSize = startSizeRef.current - delta
    }

    newSize = Math.max(minSize, Math.min(maxSize, newSize))
    setSize(newSize)
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

  const resizeHandleClass = direction === "horizontal" ? "w-1 h-full cursor-ew-resize" : "h-1 w-full cursor-ns-resize"

  return (
    <div className={`relative ${className}`} style={style}>
      {children}
      <div
        className={`absolute bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 ${resizeHandleClass}`}
        style={direction === "horizontal" ? { top: 0, right: 0 } : { left: 0, top: 0 }}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

