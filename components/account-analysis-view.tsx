"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AccountAnalysisViewProps {
  activeSymbol: string
}

export function AccountAnalysisView({ activeSymbol }: AccountAnalysisViewProps) {
  const [timeframe, setTimeframe] = useState("1m")

  // Sample account data
  const accountData = {
    netProfit: -25.6,
    profitFactor: 0.0,
    profitabilityPercentage: 0.0,
    maxBalanceDrawdown: 12.8,
    startingBalance: 200.0,
    currentBalance: 174.4,
    equity: 205.5,
    deposits: 200.0,
    withdrawals: 0.0,
    usedMargin: 6.46,
    activeSince: "25 Feb 2025",
    tradedVolume: 2909.63,
    averageDealSize: 2909.63,
    totalTrades: 1,
    winningTrades: 0,
    losingTrades: 1,
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <h3 className="text-sm font-medium mb-3">Summary</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Net profit:</span>
              <span className="text-red-500">${accountData.netProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Profit factor:</span>
              <span>{accountData.profitFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Profitability percentage:</span>
              <span>{accountData.profitabilityPercentage.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Max balance drawdown:</span>
              <span>{accountData.maxBalanceDrawdown.toFixed(2)}%</span>
            </div>
            <div className="mt-4"></div>
            <div className="flex justify-between">
              <span>Starting balance:</span>
              <span>${accountData.startingBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Current balance:</span>
              <span>${accountData.currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Equity:</span>
              <span>${accountData.equity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Deposits:</span>
              <span>${accountData.deposits.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Withdrawals:</span>
              <span>${accountData.withdrawals.toFixed(2)}</span>
            </div>
            <div className="mt-4"></div>
            <div className="flex justify-between">
              <span>Used margin:</span>
              <span>${accountData.usedMargin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Active since:</span>
              <span>{accountData.activeSince}</span>
            </div>
          </div>
        </div>

        {/* Equity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Equity</h3>
            <div className="flex space-x-1">
              {["1w", "1m", "3m", "6m", "1y", "All"].map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">Equity Chart</div>
              <div className="text-xs">Shows balance and equity over time</div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <h3 className="text-sm font-medium mb-3">Performance Stats</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium mb-1">Volume</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Traded volume:</span>
                  <span>${accountData.tradedVolume.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Deal Size:</span>
                  <span>${accountData.averageDealSize.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium mb-1">Trades</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total trades:</span>
                  <span>{accountData.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Winning trades:</span>
                  <span>
                    {accountData.winningTrades} (
                    {accountData.totalTrades > 0
                      ? ((accountData.winningTrades / accountData.totalTrades) * 100).toFixed(0)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Losing trades:</span>
                  <span>
                    {accountData.losingTrades} (
                    {accountData.totalTrades > 0
                      ? ((accountData.losingTrades / accountData.totalTrades) * 100).toFixed(0)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Performance</h3>
            <div className="flex space-x-1">
              <Button variant="default" size="sm" className="h-6 text-xs">
                2025
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-xs">
                Monthly
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-xs">
                Daily
              </Button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">Performance Chart</div>
              <div className="text-xs">Shows winning vs losing trades by period</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

