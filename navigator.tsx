"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, User, BarChart, Bot, Code } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavigatorProps {
  darkMode: boolean
}

export function Navigator({ darkMode }: NavigatorProps) {
  const [expanded, setExpanded] = useState({
    accounts: true,
    indicators: false,
    expertAdvisors: false,
    scripts: false,
    demo: false,
    real: true,
  })

  const toggleExpanded = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("accounts")}>
          {expanded.accounts ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <User className="h-3 w-3 mr-1" />
          <span>Accounts</span>
        </div>

        {expanded.accounts && (
          <div className="ml-4">
            <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("demo")}>
              {expanded.demo ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>Demo Accounts</span>
            </div>

            {expanded.demo && (
              <div className="ml-4">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-3"></span>
                  <span>12345: Demo Account</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("real")}>
              {expanded.real ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <span>Real Accounts</span>
            </div>

            {expanded.real && (
              <div className="ml-4">
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-3"></span>
                  <span>255953: Ben Chadzoga</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-3"></span>
                  <span>716096: Tanqueray Limited</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-3"></span>
                  <span>722175: Jereme Baker</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="w-3"></span>
                  <span>256033: Sebby Morgy</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("indicators")}>
          {expanded.indicators ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <BarChart className="h-3 w-3 mr-1" />
          <span>Indicators</span>
        </div>

        {expanded.indicators && (
          <div className="ml-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Moving Averages</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Oscillators</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Volumes</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Bill Williams</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("expertAdvisors")}>
          {expanded.expertAdvisors ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Bot className="h-3 w-3 mr-1" />
          <span>Expert Advisors</span>
        </div>

        {expanded.expertAdvisors && (
          <div className="ml-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Trend Follower EA</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Scalper EA</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Grid Trader EA</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("scripts")}>
          {expanded.scripts ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Code className="h-3 w-3 mr-1" />
          <span>Scripts</span>
        </div>

        {expanded.scripts && (
          <div className="ml-4">
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Close All Orders</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Delete All Pending</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="w-3"></span>
              <span>Trailing Stop</span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

