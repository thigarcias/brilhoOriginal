"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { BrandplotCache } from "@/lib/brandplot-cache"
import DiagnosticoCompleto from "../../components/brilho-original/diagnostico-completo"

function DiagnosticoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
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
        // Se não há dados reais, usar dados mock para demonstração
        setAnalysis("") // Vai triggerar o mock no diagnostico-completo.tsx
        setCompanyName("Sua Marca")
        setContactData("")
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
  return (
    <DiagnosticoCompleto 
      brandData={{
        nome_empresa: companyName,
        idUnico: "",
        resposta_1: null,
        resposta_2: null,
        resposta_3: null,
        resposta_4: null,
        resposta_5: null,
        resposta_6: null,
        resposta_7: null,
        resposta_8: null,
        contato_telefone: null,
        contato_email: null,
        scoreDiagnostico: null,
        diagnostico: analysis,
        contexto: null
      }}
      onBack={() => router.push("/")}
    />
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
