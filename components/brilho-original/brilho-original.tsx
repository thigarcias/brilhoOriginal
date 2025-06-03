"use client"

import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"
import { Pacifico } from "next/font/google"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BrandplotCache, generateIdUnico } from "@/lib/brandplot-cache"
import { useState, useEffect } from "react"
import { ChevronLeft, Upload, Loader2, Award, MessageCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})


const questions = [
  "Qual o nome da sua empresa?",
  "O que te motivou a criar essa marca?",
  "Se sua marca fosse uma pessoa, como ela falaria?",
  "O que sua marca entrega que outras não conseguem?",
  "Quem é o cliente ideal para você?",
  "Hoje, quem mais compra de você? (é o público ideal?)",
  "Como você gostaria que sua marca fosse percebida?",
  'Em uma frase: "Minha marca existe para que as pessoas possam finalmente __________."',
  "Envie um print da página inicial do Instagram da sua marca (com bio, feed e destaques visíveis) para que possamos criar uma nova bio ao final do diagnóstico.",
  "Informe um celular para contato (WhatsApp) ou um e-mail. Pelo menos um dos dois é obrigatório.",
]

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

function LoadingState({ companyName = "sua marca" }: { companyName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative z-10 container mx-auto px-4 md:px-6 min-h-screen flex flex-col items-center justify-center"
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
        >
          <Image
            src="/images/brilho-original-logo.png"
            alt="Brilho Original"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-sm text-white/60 tracking-wide">Analisando suas respostas</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="relative w-24 h-24 mb-6">
            <Loader2 className="w-24 h-24 text-[#c8b79e] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#1a1814] flex items-center justify-center">
                <Image
                  src="/images/brilho-original-logo.png"
                  alt="Brilho Original"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Criando seu diagnóstico</h2>
          <p className="text-white/60 max-w-md">
            Estamos analisando suas respostas e gerando um diagnóstico profundo para{" "}
            <span className="text-[#c8b79e] font-medium">{companyName}</span>. Isso pode levar alguns instantes...
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

function ResultsDisplay({ 
  analysis, 
  companyName = "Sua Marca", 
  contactData = "" 
}: { 
  analysis: string; 
  companyName?: string;
  contactData?: string;
}) {
  const [score, setScore] = useState(0)
  const [markdownContent, setMarkdownContent] = useState("")

  const count = useMotionValue(0)
  const roundedCount = useTransform(count, (latest) => Math.round(latest))
  const displayScore = useTransform(roundedCount, (latest) => `${latest}/100`)

  useEffect(() => {
    if (analysis) {
      // Extract score from analysis
      const scoreMatch = analysis.match(/Nota de Clareza & Emoção da Marca: (\d+)\/100/)
      if (scoreMatch && scoreMatch[1]) {
        const scoreValue = Number.parseInt(scoreMatch[1], 10)
        setScore(scoreValue)

        // Animate the score
        const animation = animate(count, scoreValue, {
          duration: 2.5,
          ease: "easeOut",
          delay: 1,
        })
      }

      // Replace "Sua Marca" with the company name
      let personalizedAnalysis = analysis.replace(/Sua Marca/g, companyName)

      // Remove the score line as we'll display it separately
      personalizedAnalysis = personalizedAnalysis.replace(
        /🏁 Nota de Clareza & Emoção da Marca: \d+\/100\n[^\n]*\n\n/,
        "",
      )

      setMarkdownContent(personalizedAnalysis)
    }
  }, [analysis, companyName, count])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-16 pb-24"
    >
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
              Diagnóstico de <span className="text-[#c8b79e] font-medium">{companyName}</span>
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
            </ReactMarkdown>
          </div>

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
              <p className="text-lg text-white/90 mb-8 font-medium">Dê o próximo passo e fale com um especialista para impulsionar seu negócio.</p>              <a
                href="https://wa.me/5511974564367?text=Olá! Quero valorizar minha marca com a Brilho Original."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:to-green-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-xl hover:scale-105 border-2 border-green-400/40 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <MessageCircle className="w-6 h-6 text-white" />
                Quero valorizar minha marca
              </a>
                {/* Botão de Cadastro - Valorização da Marca */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/70 text-sm mb-4 text-center">
                  Crie sua conta e tenha acesso a mais ferramentas de marca
                </p>                <a
                  href={`/login?mode=register&company=${encodeURIComponent(companyName)}&contact=${encodeURIComponent(contactData || '')}`}
                  className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-white font-semibold text-base rounded-xl transition-all duration-300 shadow-lg hover:scale-105 border border-[#c8b79e]/30 focus:outline-none focus:ring-2 focus:ring-[#c8b79e]/50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Criar Conta Gratuita
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function QuestionStep({
  questionNumber,
  question,
  answer,
  setAnswer,
  onNext,
  onBack,
  isLast,
}: {
  questionNumber: number
  question: string
  answer: string
  setAnswer: (value: string) => void
  onNext: () => void
  onBack: () => void
  isLast: boolean
}) {  const isFileUpload = questionNumber === 9
  const isContactStep = questionNumber === 10
  const isCompanyName = questionNumber === 1
  
  // Estado para feedback de paste
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Para o passo de contato, separar resposta em dois campos
  const [contact, setContact] = useState<{ phone: string; email: string }>(() => {
    if (isContactStep && answer) {
      try {
        return JSON.parse(answer)
      } catch {
        return { phone: '', email: '' }
      }
    }
    return { phone: '', email: '' }
  })

  // Validação simples de e-mail e celular
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  function isValidPhone(phone: string) {
    return /^(\+?\d{10,15})$/.test(phone.replace(/\D/g, ''))
  }
  const isContactValid = isContactStep ? (
    (contact.phone && isValidPhone(contact.phone)) || (contact.email && isValidEmail(contact.email))
  ) : true
  // Atualiza o answer do step pai
  useEffect(() => {
    if (isContactStep) {
      setAnswer(JSON.stringify(contact))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact])
  // Funcionalidade de paste para imagens
  useEffect(() => {
    if (!isFileUpload) return

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          if (blob) {
            // Verifica o tamanho do arquivo (10MB = 10 * 1024 * 1024 bytes)
            if (blob.size > 10 * 1024 * 1024) {
              setPasteStatus('error')
              setTimeout(() => setPasteStatus('idle'), 3000)
              return
            }
            
            // Cria um nome para a imagem colada
            const fileName = `imagem-colada-${Date.now()}.${blob.type.split('/')[1] || 'png'}`
            setAnswer(fileName)
            setPasteStatus('success')
            
            // Remove o feedback após 2 segundos
            setTimeout(() => setPasteStatus('idle'), 2000)
            
            console.log('Imagem colada:', fileName, blob)
          }
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [isFileUpload, setAnswer])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative z-10 container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center"
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
        >
          <Image
            src="/images/brilho-original-logo.png"
            alt="Brilho Original"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="text-sm text-white/60 tracking-wide">
            Pergunta {questionNumber} de {questions.length}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-white leading-relaxed"
        >
          {question}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >          {isFileUpload ? (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setAnswer(file.name)
                    setPasteStatus('idle')
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 bg-white/[0.02] ${
                pasteStatus === 'success' 
                  ? 'border-green-400/50 bg-green-400/10' 
                  : pasteStatus === 'error'
                  ? 'border-red-400/50 bg-red-400/10'
                  : 'border-[#c8b79e]/30 hover:border-[#c8b79e]/50'
              }`}>
                <Upload className={`w-12 h-12 mx-auto mb-4 ${
                  pasteStatus === 'success' 
                    ? 'text-green-400' 
                    : pasteStatus === 'error'
                    ? 'text-red-400'
                    : 'text-[#c8b79e]'
                }`} />
                <p className="text-white/60 mb-2">
                  {pasteStatus === 'success' 
                    ? '✅ Imagem colada com sucesso!' 
                    : pasteStatus === 'error'
                    ? '❌ Erro: Arquivo muito grande (máx. 10MB)'
                    : answer 
                    ? `Arquivo selecionado: ${answer}` 
                    : "Clique para enviar a imagem"
                  }
                </p>
                <p className="text-white/40 text-sm mb-1">PNG, JPG até 10MB</p>
                <p className="text-white/40 text-xs">
                  💡 Dica: Você também pode usar <span className="text-[#c8b79e] font-medium">Ctrl+V</span> para colar uma imagem
                </p>
              </div>
            </div>
          ) : isContactStep ? (
            <div className="flex flex-col gap-4 items-center">
              <input
                type="tel"
                placeholder="Celular (WhatsApp)"
                value={contact.phone}
                onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                className="w-full max-w-md px-6 py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#c8b79e]/50 focus:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={contact.email}
                onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                className="w-full max-w-md px-6 py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#c8b79e]/50 focus:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm"
              />
              <p className="text-white/40 text-sm mt-2">Preencha pelo menos um dos campos acima.</p>
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={isCompanyName ? "Digite o nome da sua empresa..." : "Digite sua resposta aqui..."}
              className="w-full h-32 px-6 py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#c8b79e]/50 focus:bg-white/[0.08] transition-all duration-300 resize-none backdrop-blur-sm"
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {questionNumber > 1 && (
            <button
              onClick={onBack}
              className="group relative px-8 py-4 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 text-white font-semibold rounded-xl transition-all duration-300 min-w-[160px] border border-white/20 hover:border-white/30 backdrop-blur-sm hover:scale-105 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="relative z-10">Voltar</span>
            </button>
          )}

          <button
            onClick={onNext}
            disabled={isContactStep ? !isContactValid : !answer.trim()}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-white font-semibold rounded-xl transition-all duration-300 min-w-[160px] shadow-lg shadow-[#1a1814]/40 hover:shadow-xl hover:shadow-[#1a1814]/50 hover:scale-105 border border-[#c8b79e]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="relative z-10">{isLast ? "Finalizar" : "Próximo"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function BrilhoOriginal({
  badge = "Estrategista de Marca",
  title1 = "Onboarding",
  title2 = "BrandPlot",
}: {
  badge?: string
  title1?: string
  title2?: string
}) {
  const [currentStep, setCurrentStep] = useState(0) // 0 = hero, 1-10 = questions, 11 = loading, 12 = results
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const [error, setError] = useState("")

  // Get the company name from the first answer
  const companyName = answers[0] ? answers[0].trim() : "Sua Marca"
  // Salva diagnóstico e respostas no cache do navegador com idUnico
  useEffect(() => {
    if (analysis && currentStep === 12) {
      // Se ainda não temos idUnico no cache, gera um
      const existingCache = BrandplotCache.get()
      if (!existingCache?.idUnico) {
        const idUnico = generateIdUnico(companyName)
        const cacheData = {
          idUnico,
          companyName,
          analysis,
          answers,
          ...(answers[9] && { contact: answers[9] })
        }
        BrandplotCache.set(cacheData)
        console.log("Cache atualizado com idUnico gerado localmente:", idUnico)
      }
    }
  }, [analysis, answers, currentStep, companyName])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  const slideVariants = {
    enter: { y: "100vh", opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: "-100vh", opacity: 0 },
  }

  const handleStart = () => {
    setCurrentStep(1)
  }

  // Sample analysis for demo purposes (fallback only)
  const getSampleAnalysis = () => {
    return `🧭 Diagnóstico Profundo da Marca — ${companyName}

🏁 Nota de Clareza & Emoção da Marca: 75/100
Sua marca demonstra potencial significativo, mas ainda há oportunidades para maior clareza na comunicação e conexão emocional mais profunda com o público-alvo.

## 🔍 Diagnóstico da Marca Atual

### 🎯 Essência da Marca
Com base nas suas respostas, sua marca nasceu de uma motivação genuína e tem uma proposta de valor clara. A essência está bem definida, mas pode ser comunicada de forma mais impactante.

### 🧬 Promessa Central
"Sua marca existe para transformar a experiência do seu público-alvo de forma única e memorável."
A promessa central está presente, mas precisa ser refinada para criar maior diferenciação no mercado.

### 👥 Público Ideal vs. Atual
Existe um alinhamento parcial entre quem você quer atingir e quem realmente compra de você. Há oportunidade de educar o mercado sobre o verdadeiro valor da sua marca.

### 📍 Percepção Atual
Sua marca já tem elementos distintivos, mas a percepção ainda não reflete completamente o valor que você entrega. É necessário trabalhar a comunicação para fechar essa lacuna.

### 🧠 Insight-chave para Reposicionamento
O próximo passo é criar uma narrativa mais forte que conecte sua motivação original com os benefícios tangíveis que você oferece. Foque em transformar clientes em defensores da marca através de experiências consistentes e memoráveis.`
  }

  const handleNext = async () => {
    if (currentStep < questions.length) {
      // Se ainda há perguntas (steps 1 a 10),
      // avança para a próxima pergunta.
      setCurrentStep(currentStep + 1)
      return // Importante sair aqui para não chamar a API antes da última pergunta
    }

    // Se chegou aqui, é porque currentStep === questions.length (step 10 - Contato)
    // e o usuário clicou em Próximo/Finalizar nesse passo.
    // Agora sim, chama a API e vai para a tela de loading (step 11).
    setIsLoading(true)
    setCurrentStep(11) // Show loading state
    setError("")

    try {
      console.log("Sending request to API with answers:", answers)

      // Make the API call
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API responded with status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If we can't parse the error response, use the status
        }
        throw new Error(errorMessage)
      }      const data = await response.json()
      console.log("API response data:", data)

      if (!data.analysis) {
        throw new Error("No analysis received from API")
      }

      setAnalysis(data.analysis)
      
      // Salva os dados no cache incluindo o idUnico retornado pela API
      if (data.idUnico) {
        const cacheData = {
          idUnico: data.idUnico,
          companyName,
          analysis: data.analysis,
          answers: answers,
          ...(answers[9] && { contact: answers[9] })
        }
        BrandplotCache.set(cacheData)
        console.log("Dados salvos no cache com idUnico:", data.idUnico)
      }
      
      setCurrentStep(12) // Show results
      setIsLoading(false)
    } catch (error: any) {
      console.error("Error analyzing:", error)
      setError(`Erro: ${error.message}. Usando análise de exemplo como fallback.`) // Mensagem de erro mais amigável

      // Use sample data as fallback
      setAnalysis(getSampleAnalysis())
      setCurrentStep(12) // Show results even on error with fallback
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  // Determine which step to render
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="hero"
            variants={slideVariants}
            initial="center"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative z-10 container mx-auto px-4 md:px-6 min-h-screen flex items-center justify-center"
          >
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2">
                <motion.div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-white border border-white/[0.08] mb-8 md:mb-12">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#534A40] tracking-wide">Beta</span>
                  </div>
                </motion.div>

                <motion.div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/brilho-original-logo.png"
                      alt="Brilho Original"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-sm text-white/60 tracking-wide">{badge}</span>
                  </div>
                </motion.div>

              </div>
              <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight px-2 leading-relaxed overflow-visible">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                    {title1}
                  </span>
                  <br />
                  <span
                    className={cn(
                      "bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-[#c8b79e] to-amber-200 overflow-visible pb-2 px-4",
                      "font-bethany"
                    )}
                  >
                    {title2}
                  </span>
                </h1>
              </motion.div>

              <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                  Impulsione sua marca e crie insights utilizando a potência da inteligência artificial e a expertise do Vicgario Brandstudio.
                </p>              </motion.div>              <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
                <div className="flex flex-col justify-center items-center px-4 gap-4">                  <button
                    onClick={handleStart}
                    className="group relative px-8 py-4 bg-gradient-to-r from-[#82772E] to-[#E5CB63] hover:from-[#82772E] hover:to-[#E5CB63] text-white font-semibold rounded-xl transition-all duration-300 w-full max-w-md shadow-lg shadow-[#1a1814]/40 hover:shadow-xl hover:shadow-[#1a1814]/50 hover:scale-105 border border-[#c8b79e]/30"
                  >
                    <span className="relative z-10 text-lg">Começar</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </button>
                  
                  <a
                    href="/login"
                    className="mt-4 inline-flex items-center justify-center text-white/60 hover:text-white/80 transition-colors text-sm"
                  >
                    Já tem uma conta? Faça login
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )
      case 11:
        return (
          <motion.div
            key="loading"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <LoadingState companyName={companyName} />
          </motion.div>
        )
      case 12:
        return (
          <motion.div
            key="results"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <ResultsDisplay analysis={analysis} companyName={companyName} contactData={answers[9] || ""} />
            {error && (
              <div className="text-amber-300 text-center mt-4 max-w-xl mx-auto px-4">
                <p className="text-sm">{error}</p>
              </div>
            )}
          </motion.div>
        )
      default: // Steps 1 through 10 (questions)
        return (
          <motion.div
            key={`question-${currentStep}`}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <QuestionStep
              questionNumber={currentStep}
              question={questions[currentStep - 1]}
              answer={answers[currentStep - 1]} // answers array is 0-indexed
              setAnswer={(value) => updateAnswer(currentStep - 1, value)}
              onNext={handleNext}
              onBack={handleBack}
              isLast={currentStep === questions.length}
            />
          </motion.div>        )
    }
  }
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814]">

      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-700/[0.05] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-amber-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-amber-700/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-amber-600/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-amber-400/[0.15]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  )
}
