"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BrandplotCache } from "@/lib/brandplot-cache"

export function SharedHeader({ companyName }: { companyName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === "/dashboard"

  const handleLogout = () => {
    // Limpar dados do cache
    BrandplotCache.clear()
    
    // Limpar dados do localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("brandplot_idUnico")
      localStorage.removeItem("brandplot_cache")
      localStorage.removeItem("user") // Limpar dados do usuário logado
    }
    
    // Redirecionar para a página inicial
    router.push("/")
  }

  return (
    <header className="bg-[#1a1814] border-b border-[#c8b79e]/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/images/brandplot-logo.png" />
            <AvatarFallback className="bg-[#c8b79e] text-[#1a1814] font-semibold">OS</AvatarFallback>
          </Avatar>
          <span className="text-white font-medium">{companyName || "Sua Marca"}</span>
          {!isHome && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="ml-4 border-[#c8b79e]/40 text-[#c8b79e] hover:bg-[#c8b79e] hover:text-[#1a1814]"
            >
              <Link href="/dashboard">← Voltar ao Dashboard</Link>
            </Button>
          )}
        </div>

        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm transition-colors text-white/80 hover:text-[#c8b79e]"
          >
            Página Inicial
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm transition-colors ${isHome ? "text-[#c8b79e]" : "text-white/80 hover:text-[#c8b79e]"}`}
          >
            Dashboard
          </Link>
          <button 
            onClick={handleLogout}
            className="text-white/80 hover:text-[#c8b79e] transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
