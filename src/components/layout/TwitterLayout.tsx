
import { Header } from "@/components/navigation/Header"
import { ReactNode } from "react"

interface TwitterLayoutProps {
  children: ReactNode
}

export function TwitterLayout({ children }: TwitterLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {children}
      </main>
    </div>
  )
}
