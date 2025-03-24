"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  User,
  BarChart,
  Bot,
  Code,
  Brain,
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  AlertTriangle,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function StrategyNavigatorPanel() {
  const [expanded, setExpanded] = useState({
    accounts: true,
    bots: true,
    indicators: false,
    scripts: false,
    signals: false,
  })

  const [activeTab, setActiveTab] = useState("navigator")
  const [runningBots, setRunningBots] = useState<string[]>(["TrendFollower"])

  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I'm your trading assistant. I can analyze your charts and provide trading insights. What would you like to know?",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [currentPrice, setCurrentPrice] = useState({ symbol: "EURUSD", price: "1.18245", change: "+0.00123" })
  const [news, setNews] = useState([
    { id: 1, time: "10:30", title: "ECB holds interest rates steady", impact: "high" },
    { id: 2, time: "09:15", title: "US Jobless Claims lower than expected", impact: "medium" },
    { id: 3, time: "08:00", title: "German Manufacturing PMI beats forecasts", impact: "medium" },
  ])
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(true)
  const [selectedAI, setSelectedAI] = useState("gemini")
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({
    gemini: "AIzaSyAQ9ls8h3Imznk2dVMO9YYw3U3NqNvTc9g", // In a real app, this would come from environment variables
  })
  const [isApiConfigured, setIsApiConfigured] = useState(false)

  useEffect(() => {
    // Check if the selected API has a key configured
    if (selectedAI !== "built-in" && apiKeys[selectedAI]) {
      setIsApiConfigured(true)
      setShowApiKeyAlert(false)
    } else if (selectedAI !== "built-in") {
      setIsApiConfigured(false)
      setShowApiKeyAlert(true)
    }
  }, [selectedAI, apiKeys])

  const toggleExpanded = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleBotRunning = (botName: string) => {
    if (runningBots.includes(botName)) {
      setRunningBots(runningBots.filter((name) => name !== botName))
    } else {
      setRunningBots([...runningBots, botName])
    }
  }

  const handleBotDragStart = (e: React.DragEvent, botName: string) => {
    e.dataTransfer.setData("application/robot", botName)
    // Set a custom effect
    e.dataTransfer.effectAllowed = "copy"

    // Create a ghost image for dragging
    const ghostElement = document.createElement("div")
    ghostElement.classList.add(
      "bg-blue-100",
      "dark:bg-blue-900",
      "text-blue-800",
      "dark:text-blue-200",
      "px-2",
      "py-1",
      "rounded",
      "text-xs",
      "font-medium",
    )
    ghostElement.innerText = `${botName} Robot`
    document.body.appendChild(ghostElement)
    ghostElement.style.position = "absolute"
    ghostElement.style.top = "-1000px"
    e.dataTransfer.setDragImage(ghostElement, 0, 0)

    // Clean up the ghost element after drag
    setTimeout(() => {
      document.body.removeChild(ghostElement)
    }, 0)

    // Dispatch custom event for chart workspace to listen for
    window.dispatchEvent(
      new CustomEvent("robot-drag-start", {
        detail: { type: "robot", name: botName },
      }),
    )
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: inputMessage }])

    // Show typing indicator
    setMessages((prev) => [...prev, { role: "typing", content: "" }])

    // If user selected an external AI but hasn't configured API key
    if (selectedAI !== "built-in" && !isApiConfigured) {
      setTimeout(() => {
        // Remove typing indicator
        setMessages((prev) => prev.filter((msg) => msg.role !== "typing"))

        // Add system message about API key
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `To use ${selectedAI === "gemini" ? "Google Gemini" : selectedAI === "gpt" ? "ChatGPT" : "Claude"}, you need to configure an API key. Please go to Settings > API Keys to set up your credentials.`,
          },
        ])
      }, 1000)

      setInputMessage("")
      return
    }

    // If using Gemini and API key is configured
    if (selectedAI === "gemini" && isApiConfigured) {
      setTimeout(() => {
        // Remove typing indicator
        setMessages((prev) => prev.filter((msg) => msg.role !== "typing"))

        // In a real implementation, this would be an actual API call to Gemini
        // For example:
        // const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${apiKeys.gemini}`
        //   },
        //   body: JSON.stringify({
        //     contents: [{ role: 'user', parts: [{ text: inputMessage }] }],
        //     generationConfig: { temperature: 0.7, topK: 40, topP: 0.95 }
        //   })
        // });
        // const data = await response.json();
        // const botResponse = data.candidates[0].content.parts[0].text;

        // Simulate Gemini response
        let botResponse = "I'm analyzing your request using Google Gemini..."

        if (inputMessage.toLowerCase().includes("price")) {
          botResponse = `[Gemini] ${currentPrice.symbol} is currently trading at ${currentPrice.price}. Based on technical analysis, the price is in a ${currentPrice.change.startsWith("+") ? "bullish" : "bearish"} trend with key support at 1.1820 and resistance at 1.1850.`
        } else if (inputMessage.toLowerCase().includes("news")) {
          botResponse = `[Gemini] Here's the latest market news affecting ${currentPrice.symbol}:\n\n1. ECB holds interest rates steady - This suggests continued monetary policy stability in the Eurozone.\n\n2. US Jobless Claims lower than expected - This indicates strength in the US labor market.\n\n3. German Manufacturing PMI beats forecasts - This positive economic indicator for Germany could support EUR.`
        } else if (inputMessage.toLowerCase().includes("trend")) {
          botResponse = `[Gemini] After analyzing the ${currentPrice.symbol} chart, I can see a ${currentPrice.change.startsWith("+") ? "bullish" : "bearish"} trend forming. The price is ${currentPrice.change.startsWith("+") ? "above" : "below"} key moving averages with momentum indicators confirming the direction.`
        } else if (inputMessage.toLowerCase().includes("trade") || inputMessage.toLowerCase().includes("signal")) {
          botResponse = `[Gemini] Based on my analysis of ${currentPrice.symbol}, I've identified a potential ${currentPrice.change.startsWith("+") ? "BUY" : "SELL"} opportunity:\n\n• Entry: ${currentPrice.price}\n• Stop Loss: ${Number.parseFloat(currentPrice.price) + (currentPrice.change.startsWith("+") ? -0.002 : 0.002)}\n• Take Profit: ${Number.parseFloat(currentPrice.price) + (currentPrice.change.startsWith("+") ? 0.004 : -0.004)}\n\nRisk-reward ratio: 1:2\nConfidence: 75%`
        } else if (inputMessage.toLowerCase().includes("analysis")) {
          botResponse = `[Gemini] Here's my comprehensive analysis of ${currentPrice.symbol}:\n\n• Price Action: ${currentPrice.change.startsWith("+") ? "Bullish candle patterns" : "Bearish candle patterns"}\n• Moving Averages: Price ${currentPrice.change.startsWith("+") ? "above" : "below"} 50 EMA\n• RSI: ${currentPrice.change.startsWith("+") ? "62" : "38"}\n• MACD: ${currentPrice.change.startsWith("+") ? "Positive crossover" : "Negative crossover"}\n• Volume: ${currentPrice.change.startsWith("+") ? "Increasing" : "Decreasing"}\n\nOverall sentiment: ${currentPrice.change.startsWith("+") ? "Bullish" : "Bearish"}`
        } else {
          botResponse = `[Gemini] I've analyzed your question about "${inputMessage}". Based on the current market conditions for ${currentPrice.symbol}, I can see that the price is at ${currentPrice.price} with a ${currentPrice.change} change. Would you like me to provide a specific analysis on this topic?`
        }

        setMessages((prev) => [...prev, { role: "bot", content: botResponse }])
      }, 1500)
    } else {
      // Original built-in assistant logic
      setTimeout(() => {
        // Remove typing indicator
        setMessages((prev) => prev.filter((msg) => msg.role !== "typing"))

        let botResponse = "I'm analyzing the market data now..."

        if (inputMessage.toLowerCase().includes("price")) {
          botResponse = `${currentPrice.symbol} is currently trading at ${currentPrice.price} with a change of ${currentPrice.change}. The price is showing ${currentPrice.change.startsWith("+") ? "bullish" : "bearish"} momentum.`
        } else if (inputMessage.toLowerCase().includes("news")) {
          botResponse =
            "Latest market news: ECB holds interest rates steady. US Jobless Claims lower than expected. German Manufacturing PMI beats forecasts."
        } else if (inputMessage.toLowerCase().includes("trend")) {
          botResponse = `${currentPrice.symbol} is in a ${currentPrice.change.startsWith("+") ? "uptrend" : "downtrend"} on the current timeframe. Support at 1.1820, resistance at 1.1850.`
        } else if (inputMessage.toLowerCase().includes("trade") || inputMessage.toLowerCase().includes("signal")) {
          botResponse = `Based on current analysis, potential ${currentPrice.change.startsWith("+") ? "BUY" : "SELL"} opportunity for ${currentPrice.symbol} with entry at ${currentPrice.price}, SL at ${Number.parseFloat(currentPrice.price) + (currentPrice.change.startsWith("+") ? -0.002 : 0.002)}, TP at ${Number.parseFloat(currentPrice.price) + (currentPrice.change.startsWith("+") ? 0.004 : -0.004)}.`
        } else if (inputMessage.toLowerCase().includes("analysis")) {
          botResponse = `${currentPrice.symbol} analysis: Price is ${currentPrice.change.startsWith("+") ? "above" : "below"} key moving averages. RSI: ${currentPrice.change.startsWith("+") ? "62" : "38"}. Support at 1.1820, resistance at 1.1850.`
        }

        setMessages((prev) => [...prev, { role: "bot", content: botResponse }])
      }, 1500)
    }

    setInputMessage("")
  }

  const handleAIChange = (value: string) => {
    setSelectedAI(value)
    if (value !== "built-in") {
      setShowApiKeyAlert(true)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="navigator" onValueChange={setActiveTab}>
        <TabsList className="h-7 p-0 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="navigator" className="text-[10px] h-7 rounded-none">
            Navigator
          </TabsTrigger>
          <TabsTrigger value="signals" className="text-[10px] h-7 rounded-none">
            Signals
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-[10px] h-7 rounded-none">
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="text-[10px] h-7 rounded-none">
            Trading Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigator" className="m-0 p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("accounts")}>
                {expanded.accounts ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <User className="h-3 w-3 mr-1" />
                <span>Accounts</span>
              </div>

              {expanded.accounts && (
                <div className="ml-4">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>Demo Account (10,000.00 USD)</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>Live Account (5,432.78 USD)</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("bots")}>
                {expanded.bots ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <Bot className="h-3 w-3 mr-1" />
                <span>Trading Bots</span>
              </div>

              {expanded.bots && (
                <div className="ml-4">
                  <div
                    className="flex flex-col gap-1 mb-2 p-1 border border-gray-200 dark:border-gray-700 rounded cursor-move hover:border-blue-400 dark:hover:border-blue-400"
                    draggable="true"
                    onDragStart={(e) => handleBotDragStart(e, "TrendFollower")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-3"></span>
                        <span>TrendFollower</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 rounded-sm ${runningBots.includes("TrendFollower") ? "text-green-500" : "text-gray-500"}`}
                          onClick={() => toggleBotRunning("TrendFollower")}
                        >
                          {runningBots.includes("TrendFollower") ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">EURUSD, H1 | P/L: +$127.50</div>
                    <Progress value={65} className="h-1 w-full" />
                  </div>

                  <div
                    className="flex flex-col gap-1 mb-2 p-1 border border-gray-200 dark:border-gray-700 rounded cursor-move hover:border-blue-400 dark:hover:border-blue-400"
                    draggable="true"
                    onDragStart={(e) => handleBotDragStart(e, "GridTrader")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-3"></span>
                        <span>GridTrader</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 rounded-sm ${runningBots.includes("GridTrader") ? "text-green-500" : "text-gray-500"}`}
                          onClick={() => toggleBotRunning("GridTrader")}
                        >
                          {runningBots.includes("GridTrader") ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">GBPUSD, H4 | P/L: -$45.25</div>
                    <Progress value={35} className="h-1 w-full" />
                  </div>

                  <div
                    className="flex flex-col gap-1 mb-2 p-1 border border-gray-200 dark:border-gray-700 rounded cursor-move hover:border-blue-400 dark:hover:border-blue-400"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/robot", "TradeManager")
                      // Dispatch custom event for chart workspace to listen for
                      window.dispatchEvent(
                        new CustomEvent("robot-drag-start", {
                          detail: { type: "TradeManager", name: "TradeManager" },
                        }),
                      )
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-3"></span>
                        <span>TradeManager</span>
                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">
                          Custom
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 rounded-sm ${runningBots.includes("TradeManager") ? "text-green-500" : "text-gray-500"}`}
                          onClick={() => toggleBotRunning("TradeManager")}
                        >
                          {runningBots.includes("TradeManager") ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Custom Charts | Auto Trade Management
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                      <span>Risk: 2% | TP: Auto | SL: Auto</span>
                      <span className="text-green-500 dark:text-green-400">+$215.75</span>
                    </div>
                    <Progress value={85} className="h-1 w-full" />
                  </div>

                  <div className="flex items-center gap-1 mb-1 justify-center">
                    <Button variant="outline" size="sm" className="h-6 text-[10px]">
                      <Plus className="h-3 w-3 mr-1" />
                      New Bot
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("indicators")}>
                {expanded.indicators ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <BarChart className="h-3 w-3 mr-1" />
                <span>Custom Indicators</span>
              </div>

              {expanded.indicators && (
                <div className="ml-4">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>SuperTrend</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>Volume Profile</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>Order Flow</span>
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
                    <span>Trailing Stop</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>Risk Calculator</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 mb-1 cursor-pointer" onClick={() => toggleExpanded("signals")}>
                {expanded.signals ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <Zap className="h-3 w-3 mr-1" />
                <span>Trading Signals</span>
              </div>

              {expanded.signals && (
                <div className="ml-4">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>ForexMaster (Subscribed)</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>SwingTrader</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-3"></span>
                    <span>DayTrader Pro</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="signals" className="m-0 p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Signal Providers</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div>
                      <div className="font-medium">ForexMaster</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        Win rate: 68% | Profit: +1,245 pips
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]">
                      Subscribe
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div>
                      <div className="font-medium">SwingTrader</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        Win rate: 72% | Profit: +987 pips
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Recent Signals</div>
                <div className="flex flex-col gap-2">
                  <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">EURUSD</div>
                      <div className="text-green-600 dark:text-green-400 font-medium">BUY</div>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Entry: 1.18250-1.18300 | SL: 1.18100 | TP: 1.18500
                    </div>
                    <div className="text-[10px]">ForexMaster • 2 hours ago</div>
                  </div>

                  <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">GBPUSD</div>
                      <div className="text-red-600 dark:text-red-400 font-medium">SELL</div>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      Entry: 1.32400-1.32450 | SL: 1.32600 | TP: 1.32200
                    </div>
                    <div className="text-[10px]">SwingTrader • 5 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ai" className="m-0 p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">AI Market Analysis</div>
                <div className="p-2 border border-gray-200 dark:border-gray-700 rounded mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">EURUSD Forecast</span>
                  </div>
                  <div className="text-xs mb-1">
                    Bullish momentum detected with strong support at 1.1820. Price likely to test 1.1850 resistance in
                    the next 24 hours.
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Confidence: 78%</div>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]">
                      Apply to Chart
                    </Button>
                  </div>
                </div>

                <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">GBPUSD Forecast</span>
                  </div>
                  <div className="text-xs mb-1">
                    Bearish pattern forming with resistance at 1.3245. Multiple technical indicators suggest a potential
                    reversal.
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">Confidence: 65%</div>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]">
                      Apply to Chart
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Pattern Recognition</div>
                <div className="flex flex-col gap-2">
                  <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium">EURUSD H1</div>
                      <div className="text-purple-600 dark:text-purple-400 font-medium">Double Bottom</div>
                    </div>
                    <div className="text-xs mb-1">
                      Double bottom pattern detected with neckline at 1.1835. Potential bullish reversal with target at
                      1.1870.
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">Detected 15 minutes ago</div>
                      <Button size="sm" variant="outline" className="h-6 text-[10px]">
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium">USDJPY H4</div>
                      <div className="text-purple-600 dark:text-purple-400 font-medium">Head and Shoulders</div>
                    </div>
                    <div className="text-xs mb-1">
                      Head and shoulders pattern forming with neckline at 106.20. Bearish signal if price breaks below
                      neckline.
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">Detected 1 hour ago</div>
                      <Button size="sm" variant="outline" className="h-6 text-[10px]">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chatbot" className="m-0 p-0 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Trading Assistant</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <select
                      className="bg-transparent border border-gray-300 dark:border-gray-600 rounded text-[10px] py-0.5 px-1"
                      value={selectedAI}
                      onChange={(e) => handleAIChange(e.target.value)}
                    >
                      <option value="built-in">Built-in Assistant</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="gpt">ChatGPT</option>
                      <option value="claude">Claude</option>
                    </select>
                    <span>• Connected to charts</span>
                  </div>
                </div>
                <div className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>

            {showApiKeyAlert && selectedAI !== "built-in" && !isApiConfigured && (
              <Alert className="m-2 py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-xs font-medium">API Key Required</AlertTitle>
                <AlertDescription className="text-xs">
                  To use {selectedAI === "gemini" ? "Google Gemini" : selectedAI === "gpt" ? "ChatGPT" : "Claude"}, you
                  need to configure an API key.
                  <div className="mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[10px] mr-2"
                      onClick={() => {
                        // In a real app, this would open a modal to configure the API key
                        const key = prompt(`Enter your ${selectedAI} API key:`)
                        if (key) {
                          setApiKeys((prev) => ({ ...prev, [selectedAI]: key }))
                          setIsApiConfigured(true)
                          setShowApiKeyAlert(false)
                        }
                      }}
                    >
                      Configure API Key
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      onClick={() => setShowApiKeyAlert(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {selectedAI === "gemini" && isApiConfigured && (
              <div className="px-2 py-1 bg-blue-50 dark:bg-blue-950 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    <span>Google Gemini API Connected</span>
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Trial Version</div>
                </div>
                <div className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1 bg-yellow-50 dark:bg-yellow-950 p-1 rounded border border-yellow-200 dark:border-yellow-800">
                  Note: This is a simulation. In a real implementation, this would connect to the actual Gemini API.
                </div>
              </div>
            )}

            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">Current Price</div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{currentPrice.symbol}</div>
                  <div
                    className={`font-medium ${currentPrice.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {currentPrice.price}
                  </div>
                  <div
                    className={`text-xs ${currentPrice.change.startsWith("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {currentPrice.change}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2">
              <div className="flex flex-col gap-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded max-w-[85%] ${
                      message.role === "user"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ml-auto"
                        : message.role === "typing"
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          : message.role === "system"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {message.role === "typing" ? (
                      <div className="flex gap-1 items-center h-5">
                        <div
                          className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    ) : (
                      <>
                        {selectedAI !== "built-in" && message.role === "bot" && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            <span>
                              {selectedAI === "gemini" ? "Google Gemini" : selectedAI === "gpt" ? "ChatGPT" : "Claude"}
                            </span>
                            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded">
                              SIMULATED
                            </span>
                          </div>
                        )}
                        {message.content}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium mb-1">Latest News</div>
              <div className="mb-2 max-h-20 overflow-auto">
                {news.map((item) => (
                  <div key={item.id} className="flex items-center gap-1 text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{item.time}</span>
                    <span
                      className={`px-1 rounded text-[9px] ${
                        item.impact === "high"
                          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          : item.impact === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      }`}
                    >
                      {item.impact.toUpperCase()}
                    </span>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about markets, news, or trading ideas..."
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button size="sm" onClick={handleSendMessage} className="h-6 text-[10px]">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

