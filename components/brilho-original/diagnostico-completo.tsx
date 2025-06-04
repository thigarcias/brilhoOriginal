"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useState, useEffect } from "react"
import { Award, ArrowLeft, MessageCircle } from "lucide-react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface BrandData {
  nome_empresa: string | null
  idUnico: string
  resposta_1: string | null
  resposta_2: string | null
  resposta_3: string | null
  resposta_4: string | null
  resposta_5: string | null
  resposta_6: string | null
  resposta_7: string | null
  resposta_8: string | null
  contato_telefone: string | null
  contato_email: string | null
  scoreDiagnostico: string | null
  analysis?: string | null
  contexto: string | null
}

interface DiagnosticoCompletoProps {
  brandData: BrandData
  onBack: () => void
}

export default function DiagnosticoCompleto({ brandData, onBack }: DiagnosticoCompletoProps) {
  const [score, setScore] = useState(0)
  const [markdownContent, setMarkdownContent] = useState("")
  const [analysis, setAnalysis] = useState("")

  const count = useMotionValue(0)
  const roundedCount = useTransform(count, (latest) => Math.round(latest))
  const displayScore = useTransform(roundedCount, (latest) => `${latest}/100`)

  const companyName = brandData.nome_empresa || "Sua Marca"
  const contactData = JSON.stringify({
    phone: brandData.contato_telefone,
    email: brandData.contato_email
  })

  // Gerar análise de exemplo caso não tenha uma análise salva
  const getSampleAnalysis = () => {
    return `🧭 Diagnóstico Profundo da Marca — ${companyName}

🏁 Nota de Clareza & Emoção da Marca: ${brandData.scoreDiagnostico || '75'}/100
Sua marca demonstra potencial significativo, mas ainda há oportunidades para maior clareza na comunicação e conexão emocional mais profunda com o público-alvo.

## 🔍 Diagnóstico da Marca Atual

### 🎯 Essência da Marca
${brandData.resposta_1 ? `Com base na sua motivação: "${brandData.resposta_1}", sua marca nasceu de uma necessidade genuína do mercado.` : 'Sua marca tem uma proposta de valor clara, mas pode ser comunicada de forma mais impactante.'}

### 🗣️ Tom de Voz
${brandData.resposta_2 ? `Sua marca se comunica de forma ${brandData.resposta_2}. Isso cria uma personalidade única que pode ser ainda mais explorada.` : 'O tom de voz da sua marca precisa ser mais bem definido para criar conexão emocional.'}

### 🎯 Diferencial Competitivo
${brandData.resposta_3 ? `Seu principal diferencial: "${brandData.resposta_3}". Esse é um ponto forte que deve ser amplificado em toda comunicação.` : 'O diferencial da sua marca precisa ser mais claramente comunicado no mercado.'}

### 👥 Público-Alvo
${brandData.resposta_4 ? `Cliente ideal: ${brandData.resposta_4}` : 'O público-alvo precisa ser melhor definido.'}
${brandData.resposta_5 ? `\\nAtualmente atende: ${brandData.resposta_5}` : ''}
${brandData.resposta_4 && brandData.resposta_5 ? '\\n\\nExiste um alinhamento entre público ideal e atual que pode ser otimizado.' : ''}

### 📍 Percepção Desejada vs. Atual
${brandData.resposta_6 ? `Você deseja que sua marca seja percebida como: "${brandData.resposta_6}". Esta percepção pode ser fortalecida através de estratégias específicas de comunicação.` : 'A percepção desejada da marca precisa ser melhor definida.'}

### 🎯 Propósito Central
${brandData.resposta_7 ? `"Minha marca existe para que as pessoas possam finalmente ${brandData.resposta_7}". Este propósito é o coração da sua marca e deve guiar todas as decisões de comunicação.` : 'O propósito da marca precisa ser claramente articulado.'}

## 🧠 Insights-chave para Reposicionamento

### 💡 Principais Oportunidades
1. **Clareza na Comunicação**: Simplifique sua mensagem principal
2. **Consistência Visual**: Alinhe todos os pontos de contato da marca
3. **Conexão Emocional**: Fortaleça o vínculo com seu público
4. **Diferenciação**: Destaque seus diferenciais únicos

### 🚀 Próximos Passos Recomendados
1. Refinar o posicionamento estratégico
2. Desenvolver guidelines de comunicação
3. Criar estratégia de conteúdo alinhada
4. Implementar identidade visual consistente

### 📈 Potencial de Crescimento
Sua marca tem excelente potencial para se destacar no mercado. Com os ajustes corretos, pode alcançar uma posição de liderança em seu segmento.`
  }

  useEffect(() => {
    // Usar análise salva ou gerar uma de exemplo
    const currentAnalysis = brandData.analysis || getSampleAnalysis()
    setAnalysis(currentAnalysis)

    if (currentAnalysis) {
      // Extract score from analysis
      const scoreMatch = currentAnalysis.match(/Nota de Clareza & Emoção da Marca: (\d+)\/100/)
      if (scoreMatch && scoreMatch[1]) {
        const scoreValue = Number.parseInt(scoreMatch[1], 10)
        setScore(scoreValue)

        // Animate the score
        const animation = animate(count, scoreValue, {
          duration: 2.5,
          ease: "easeOut",
          delay: 1,
        })
      } else if (brandData.scoreDiagnostico) {
        // Fallback para o score salvo no banco
        const scoreValue = Number.parseInt(brandData.scoreDiagnostico, 10)
        setScore(scoreValue)
        
        const animation = animate(count, scoreValue, {
          duration: 2.5,
          ease: "easeOut",
          delay: 1,
        })
      }

      // Replace "Sua Marca" with the company name
      let personalizedAnalysis = currentAnalysis.replace(/Sua Marca/g, companyName)

      // Remove the score line as we'll display it separately
      personalizedAnalysis = personalizedAnalysis.replace(
        /🏁 Nota de Clareza & Emoção da Marca: \d+\/100\n[^\n]*\n\n/,
        "",
      )

      setMarkdownContent(personalizedAnalysis)
    }
  }, [brandData, companyName, count])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-700/[0.05] blur-3xl" />

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-700/[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar ao Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#c8b79e]/20 flex items-center justify-center">
              <Image
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

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16 pb-24">
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
                alt="Brilho Original"
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-sm text-white/60 tracking-wide">
                Diagnóstico Completo de <span className="text-[#c8b79e] font-medium">{companyName}</span>
              </span>
            </div>

            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col items-center justify-center mb-8"
            >
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-white/[0.03] border-4 border-[#c8b79e]/30 flex items-center justify-center relative">
                  <Award className="w-8 h-8 text-[#c8b79e] absolute -top-6 left-1/2 transform -translate-x-1/2" />
                  <motion.span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-[#c8b79e] to-amber-200">
                    {displayScore}
                  </motion.span>
                </div>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2 }}
                className="text-white/60 text-sm"
              >
                Nota de Clareza & Emoção da Marca
              </motion.p>
            </motion.div>
          </motion.div>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl sm:text-2xl font-bold mb-4 text-white text-center" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg sm:text-xl font-bold mb-3 text-white mt-6" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-white mt-4" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-sm sm:text-base text-white/80 mb-4 leading-relaxed" {...props} />
                  ),
                  strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                  em: ({ node, ...props }) => <em className="text-white/90 italic" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-white/80" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-white/80" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1 text-sm sm:text-base" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-[#c8b79e]/50 pl-4 italic text-white/70 my-4" {...props} />
                  ),
                }}
              >
                {markdownContent}
              </ReactMarkdown>            </div>

            {/* Company Context Section */}
            {brandData.contexto && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="mt-8"
              >
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-[#c8b79e]">🏢</span>
                    Contexto e Análise de Mercado
                  </h2>
                  <p className="text-white/60 mb-4 text-sm">
                    Análise detalhada da empresa e posicionamento no mercado
                  </p>
                  <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.08]">
                    <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {brandData.contexto}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-10 flex flex-col gap-6 justify-center items-center"
            >
              <div className="bg-gradient-to-r from-[#1C1914] to-[#553F1D] to-90% border border-[#553F1D]/30 shadow-2xl rounded-2xl p-8 md:p-10 text-center max-w-2xl w-full">
                <p className="text-2xl md:text-3xl font-extrabold text-white mb-3 drop-shadow-sm">
                  Pronto para <span className="text-[#fde68a]">transformar sua marca</span> e <span className="text-[#fde68a]">atrair clientes que pagam mais?</span>
                </p>
                <p className="text-lg text-white/90 mb-8 font-medium">Dê o próximo passo e fale com um especialista para impulsionar seu negócio.</p>
                
                <a
                  href="https://wa.me/5511974564367?text=Olá! Quero valorizar minha marca com a Brilho Original."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:to-green-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-xl hover:scale-105 border-2 border-green-400/40 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                  Quero valorizar minha marca
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
