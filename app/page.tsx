import { ThemeProvider } from "@/components/theme-provider"
import TradingTerminal from "@/components/trading-terminal"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <main className="h-screen w-screen overflow-hidden">
        <TradingTerminal />
      </main>
    </ThemeProvider>
  )
}

