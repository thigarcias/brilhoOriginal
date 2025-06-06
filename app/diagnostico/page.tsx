"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { BrandplotCache } from "@/lib/brandplot-cache"
import ResultsDisplay from "../../components/brilho-original/results-display"

function DiagnosticoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [companyName, setCompanyName] = useState("Sua Marca")
  const [contactData, setContactData] = useState("")

  useEffect(() => {
    // Tentar obter dados do cache
    const cachedData = BrandplotCache.get()
    
    if (cachedData?.diagnostico && cachedData?.companyName) {
      setAnalysis(cachedData.diagnostico)
      setCompanyName(cachedData.companyName)
      setContactData(cachedData.contact || "")
      setLoading(false)
    } else {
      // Verificar se há parâmetros na URL (caso venha de um link direto)
      const urlAnalysis = searchParams.get('analysis')
      const urlCompany = searchParams.get('company')
      const urlContact = searchParams.get('contact')
      
      if (urlAnalysis && urlCompany) {
        setAnalysis(decodeURIComponent(urlAnalysis))
        setCompanyName(decodeURIComponent(urlCompany))
        setContactData(urlContact ? decodeURIComponent(urlContact) : "")
        setLoading(false)
      } else {
        setError("Nenhum diagnóstico encontrado. Complete o processo de diagnóstico primeiro.")
        setLoading(false)
      }
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#c8b79e]/30 border-t-[#c8b79e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Carregando diagnóstico...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <p className="text-white mb-4">{error}</p>
            <button 
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-[#c8b79e] hover:bg-[#d0c0a8] text-[#1a1814] font-medium rounded-lg transition-colors"
            >
              Fazer Diagnóstico
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-700/[0.05] blur-3xl" />

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-700/[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header com navegação */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Voltar</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#c8b79e]/20 flex items-center justify-center">
              <img
                src="/images/brilho-original-logo.png"
                alt="Brilho Original"
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <span className="text-white font-medium">Brilho Original</span>
          </div>
        </div>
      </header>

      <ResultsDisplay 
        analysis={analysis} 
        companyName={companyName} 
        contactData={contactData}
      />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-[#c8b79e]/30 border-t-[#c8b79e] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70">Carregando diagnóstico...</p>
      </motion.div>
    </div>
  )
}

export default function DiagnosticoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DiagnosticoContent />
    </Suspense>
  )
}
