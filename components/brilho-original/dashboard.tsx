"use client"

import { Button } from "@/components/ui/button"
import { Download, Palette, Type, ImageIcon, MessageCircle, FileDown, Loader2, Award, ArrowRight, Zap, CheckCircle2, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BrandplotCache } from "@/lib/brandplot-cache"
import ScoreCounter from "../ScoreCounter"
import { SharedHeader } from "@/components/SharedHeader"

const sections = [
  { id: "/logo", title: "Logo", icon: FileDown },
  { id: "/colors", title: "Colors", icon: Palette },
  { id: "/typography", title: "Typography", icon: Type },
  { id: "/imagery", title: "Imagery", icon: ImageIcon },
  { id: "/tone", title: "Tone of voice", icon: MessageCircle },
  { id: "/download", title: "Download", icon: Download },
]

async function fetchBrandData(idUnico: string) {
  const response = await fetch(`/api/brand-data?idUnico=${encodeURIComponent(idUnico)}`)
  if (!response.ok) return null
  const result = await response.json()
  if (result.success && result.data) return result.data
  return null
}

export default function Dashboard() {
  const [score, setScore] = useState<number>(0)
  const [companyName, setCompanyName] = useState<string>("Sua Marca")
  const [estrategia, setEstrategia] = useState<any>(null)
  const [loadingEstrategia, setLoadingEstrategia] = useState(false)
  const [erroEstrategia, setErroEstrategia] = useState<string | null>(null)
  const [enviadoDesigner, setEnviadoDesigner] = useState<boolean | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const startTime = Date.now()
      
      let idUnico = null
      if (typeof window !== "undefined") {
        const cache = BrandplotCache.get()
        if (cache && cache.idUnico) {
          idUnico = cache.idUnico
        } else {
          const storedId = localStorage.getItem("brandplot_idUnico")
          if (storedId) idUnico = storedId
        }
      }
      if (idUnico) {
        const response = await fetch(`/api/brand-data?idUnico=${encodeURIComponent(idUnico)}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const scoreValue = result.data.scoreDiagnostico ? parseInt(result.data.scoreDiagnostico, 10) : 95
            setScore(scoreValue)
            setCompanyName(result.data.nome_empresa || "Sua Marca")
            if (result.data.estrategia) {
              try {
                setEstrategia(JSON.parse(result.data.estrategia))
              } catch {
                setEstrategia(result.data.estrategia)
              }
            }
            if (typeof result.data.enviadoDesigner !== 'undefined') {
              setEnviadoDesigner(result.data.enviadoDesigner)
            }
          }
        }
      }

      // Garantir que o loading dure pelo menos 2 segundos
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)
      
      setTimeout(() => {
        setIsInitialLoading(false)
      }, remainingTime)
    }
    loadData()
  }, [])

  async function handleGerarEstrategia() {
    setLoadingEstrategia(true)
    setErroEstrategia(null)
    let idUnico = null
    if (typeof window !== "undefined") {
      const cache = BrandplotCache.get()
      if (cache && cache.idUnico) {
        idUnico = cache.idUnico
      } else {
        const storedId = localStorage.getItem("brandplot_idUnico")
        if (storedId) idUnico = storedId
      }
    }
    if (!idUnico) {
      setErroEstrategia("ID não encontrado. Faça login novamente.")
      setLoadingEstrategia(false)
      return
    }
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUnico })
      })
      if (!response.ok) {
        throw new Error("Erro ao gerar estratégia")
      }
      const result = await response.json()
      if (result.estrategia) {
        setEstrategia(result.estrategia)
      }
    } catch (err) {
      setErroEstrategia("Erro ao gerar estratégia. Tente novamente.")
    } finally {
      setLoadingEstrategia(false)
    }
  }

  async function handleEnviarDesigner() {
    let idUnico = null
    if (typeof window !== "undefined") {
      const cache = BrandplotCache.get()
      if (cache && cache.idUnico) {
        idUnico = cache.idUnico
      } else {
        const storedId = localStorage.getItem("brandplot_idUnico")
        if (storedId) idUnico = storedId
      }
    }
    if (!idUnico) {
      setErroEstrategia("ID não encontrado. Faça login novamente.")
      return
    }
    try {
      const response = await fetch("/api/brand-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUnico, enviadoDesigner: true })
      })
      if (!response.ok) throw new Error("Erro ao enviar ao designer")
      setEnviadoDesigner(true)
    } catch {
      setErroEstrategia("Erro ao enviar ao designer. Tente novamente.")
    }
  }

  // Skeleton Components para o novo design
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl"
    >
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/10"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-white/5 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-white/5 rounded mb-6 w-full"></div>
        
        <div className="flex items-center justify-center mb-6">
          <div className="w-32 h-32 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="text-center">
          <div className="h-10 bg-white/10 rounded w-full"></div>
        </div>
      </div>
    </motion.div>
  )

  if (isInitialLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814]">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-700/[0.05] blur-3xl" />
        
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-700/[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <div className="relative z-10">
          <div className="bg-[#1a1814] border-b border-[#c8b79e]/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                <div className="h-5 bg-white/10 rounded w-24 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-8">
                <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-8 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <main className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="h-8 bg-white/10 rounded mb-8 w-1/3 mx-auto animate-pulse"></div>
            </motion.div>

            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </main>
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

      {/* Header */}
      <div className="relative z-10">
        <SharedHeader companyName={companyName} />
      </div>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
              <Image
                src="/images/brilho-original-logo.png"
                alt="BrandPlot"
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-sm text-white/60 tracking-wide">
                Dashboard de <span className="text-[#c8b79e] font-medium">{companyName}</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bem-vindo de volta
            </h1>
            <p className="text-white/60">
              Acompanhe o progresso da sua marca e acesse todas as ferramentas
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Card: Diagnóstico da Marca */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 flex items-center justify-center border border-amber-500/30">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Diagnóstico da Marca</h2>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Veja o resultado do diagnóstico completo de <span className="font-bold text-[#c8b79e]">{companyName}</span>, 
                com insights personalizados e score de clareza & emoção da marca.
              </p>

              <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <ScoreCounter targetScore={score} duration={2000} />
                  </div>
                  <p className="text-white/60 text-sm text-center">
                    Nota de Clareza & Emoção
                  </p>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">Diagnóstico Completo</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Star className="w-4 h-4 text-[#c8b79e]" />
                      <span className="text-white/80 text-sm">Insights Personalizados</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 text-sm">Próximos Passos Definidos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button asChild className="bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-[#1a1814] font-medium border-0 px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Link href="/diagnostico" className="flex items-center gap-2">
                    Ver diagnóstico completo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Card: Estratégia de Marca */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Estratégia de Marca</h2>
                </div>
                <span className="text-[#c8b79e]/60 text-xs italic bg-[#c8b79e]/10 px-2 py-1 rounded-full border border-[#c8b79e]/20">
                  Gerado por IA
                </span>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Acesse a análise de perfil e direcionamento estratégico para sua marca, com insights personalizados e
                recomendações acionáveis para crescimento.
              </p>

              <div className="space-y-4">
                {!estrategia ? (
                  <Button
                    className="bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-[#1a1814] font-medium border-0 w-full py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    onClick={handleGerarEstrategia}
                    disabled={loadingEstrategia}
                  >
                    {loadingEstrategia ? (
                      <>
                        <Loader2 className="animate-spin mr-2 w-4 h-4" />
                        Gerando estratégia...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 w-4 h-4" />
                        Gerar estratégia de marca
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-[#1a1814] font-medium border-0 flex-1 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                      <Link href="/estrategia" className="flex items-center justify-center gap-2">
                        Visualizar estratégia
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 text-green-300 border border-green-500/30 flex-1 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleEnviarDesigner}
                      disabled={enviadoDesigner === true}
                    >
                      {enviadoDesigner === true ? (
                        <>
                          <CheckCircle2 className="mr-2 w-4 h-4" />
                          Enviado ao Designer
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 w-4 h-4" />
                          Aprovar e Enviar
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {erroEstrategia && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                    {erroEstrategia}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Card: Guidelines (quando estratégia existe) */}
            {estrategia && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-gradient-to-br from-[#c8b79e]/[0.15] to-[#c8b79e]/[0.05] backdrop-blur-sm border border-[#c8b79e]/20 rounded-2xl p-6 md:p-8 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c8b79e]/30 to-[#c8b79e]/20 flex items-center justify-center border border-[#c8b79e]/40">
                    <Palette className="w-6 h-6 text-[#c8b79e]" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Guidelines de Marca</h2>
                </div>
                
                <div className="text-white/80 mb-6">
                  {enviadoDesigner === true ? (
                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/30 rounded-xl p-4 text-green-300">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Em revisão pelo designer</span>
                      </div>
                      <p className="text-sm text-green-200">
                        Entraremos em contato quando os guidelines estiverem disponíveis para download.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-[#c8b79e]/10 to-[#c8b79e]/5 border border-[#c8b79e]/30 rounded-xl p-4 text-[#c8b79e]">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5" />
                        <span className="font-semibold">Pronto para envio</span>
                      </div>
                      <p className="text-sm text-[#c8b79e]/80">
                        Envie sua estratégia ao designer para começar o processo de criação dos guidelines da marca.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
