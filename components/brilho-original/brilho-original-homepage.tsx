"use client"

import type React from "react"
import Image from "next/image"
import { useRef } from "react"
import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import { cn } from "@/lib/utils"
import Link from "next/link"
import ElegantShape from "@/components/ElegantShape"
import {
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  MessageSquareQuote,
} from "lucide-react"
import { useState } from "react"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

export default function BrilhoOriginalHomepage({
  badge = "BrandPlot",
}: {
  badge?: string
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"branding" | "score" | "insights">("branding")

  const startSectionRef = useRef<HTMLDivElement>(null)
  const benefitsSectionRef = useRef<HTMLDivElement>(null)
  const processSectionRef = useRef<HTMLDivElement>(null)
  const faqSectionRef = useRef<HTMLDivElement>(null)
  const previewSectionRef = useRef<HTMLDivElement>(null)

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
  const handleStart = () => {
    // Redireciona para a página de onboarding
    window.location.href = '/onboarding'
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "O que é o diagnóstico de marca da BrandPlot?",
      answer:
        "O diagnóstico de marca da BrandPlot é uma análise profunda e personalizada da sua marca, utilizando inteligência artificial e expertise em branding. Avaliamos a clareza da sua comunicação, posicionamento, público-alvo e percepção no mercado, fornecendo insights acionáveis para melhorar seu desempenho.",
    },
    {
      question: "Quanto tempo leva para receber meu diagnóstico?",
      answer:
        "O diagnóstico é gerado instantaneamente após você responder às perguntas do questionário. Todo o processo leva aproximadamente 5-10 minutos, dependendo do tempo que você dedica a cada resposta.",
    },
    {
      question: "O diagnóstico é realmente personalizado?",
      answer:
        "Sim! Cada diagnóstico é único e baseado exclusivamente nas suas respostas. Nossa tecnologia analisa suas informações específicas e gera recomendações personalizadas para sua marca em particular.",
    },
    {
      question: "Preciso ter uma marca estabelecida para usar o serviço?",
      answer:
        "Não necessariamente. O diagnóstico é útil tanto para marcas estabelecidas quanto para empreendedores que estão começando. Se você está no início da jornada, o diagnóstico pode ajudar a definir direções estratégicas para sua marca.",
    },
    {
      question: "Como posso implementar as recomendações do diagnóstico?",
      answer:
        "Após receber seu diagnóstico, você pode implementar as recomendações por conta própria ou contratar nossos serviços de consultoria para ajudá-lo no processo. Oferecemos planos específicos para diferentes necessidades e orçamentos.",
    },
  ]

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

      <div className="relative z-10">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1814]/80 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#c8b79e]/20 flex items-center justify-center">
                <Image
                  src="/images/brandplot-logo.png"
                  alt="BrandPlot"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <span className="text-white font-medium">BrandPlot</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection(benefitsSectionRef)}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Benefícios
              </button>
              <button
                onClick={() => scrollToSection(processSectionRef)}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection(previewSectionRef)}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Prévia
              </button>
              <button
                onClick={() => scrollToSection(faqSectionRef)}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                FAQ
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-white/60 hover:text-white transition-colors text-sm hidden md:block"
              >
                Login
              </Link>
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-[#1a1814]/40 hover:shadow-xl hover:shadow-[#1a1814]/50 hover:scale-105 border border-[#c8b79e]/30"
              >
                Começar Diagnóstico
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-24 md:pt-32 pb-16 md:pb-24">
          <div className="container mx-auto px-4 md:px-6 min-h-[80vh] flex flex-col justify-center">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                custom={0}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
              >
                <Image
                  src="/images/brandplot-logo.png"
                  alt="BrandPlot"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-sm text-white/60 tracking-wide">{badge}</span>
              </motion.div>

              <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                    Transforme sua
                  </span>
                  <br />
                  <span
                    className={cn(
                      "bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-[#c8b79e] to-amber-200 pr-4",
                      pacifico.className,
                    )}
                  >
                    Marca
                  </span>
                </h1>
              </motion.div>

              <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
                <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                  Descubra o verdadeiro potencial da sua marca com nosso diagnóstico personalizado. Impulsione seu
                  negócio com insights poderosos e estratégias acionáveis.
                </p>
              </motion.div>

              <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4">
                  <button
                    onClick={handleStart}
                    className="group relative px-8 py-4 bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-white font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto shadow-lg shadow-[#1a1814]/40 hover:shadow-xl hover:shadow-[#1a1814]/50 hover:scale-105 border border-[#c8b79e]/30 flex items-center justify-center gap-2"
                  >
                    <span className="relative z-10 text-lg">Começar Diagnóstico Gratuito</span>
                    <ArrowRight className="w-5 h-5" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1a1814] to-transparent" />
        </section>

        {/* Benefits Section */}
        <section ref={benefitsSectionRef} className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-[#c8b79e]/10 text-[#c8b79e] text-sm font-medium mb-4">
                Benefícios
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Por que fazer um diagnóstico de marca?
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Descubra como nossa análise profunda pode transformar sua marca e impulsionar seu negócio com
                insights acionáveis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Benefit 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#c8b79e]/10 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-[#c8b79e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Clareza de Posicionamento</h3>
                <p className="text-white/60">
                  Entenda exatamente onde sua marca se posiciona no mercado e como se diferencia da concorrência,
                  criando uma proposta de valor única.
                </p>
              </motion.div>

              {/* Benefit 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#c8b79e]/10 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-[#c8b79e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Conexão com o Público</h3>
                <p className="text-white/60">
                  Identifique seu público ideal e descubra como criar mensagens que ressoam emocionalmente,
                  construindo relacionamentos mais fortes.
                </p>
              </motion.div>

              {/* Benefit 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#c8b79e]/10 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-[#c8b79e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Estratégia Acionável</h3>
                <p className="text-white/60">
                  Receba recomendações práticas e específicas que você pode implementar imediatamente para melhorar
                  a percepção da sua marca.
                </p>
              </motion.div>

              {/* Benefit 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#c8b79e]/10 flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-[#c8b79e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Crescimento Acelerado</h3>
                <p className="text-white/60">
                  Elimine obstáculos invisíveis que estão limitando seu crescimento e descubra oportunidades
                  inexploradas para expandir sua marca.
                </p>
              </motion.div>

              {/* Benefit 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#c8b79e]/10 flex items-center justify-center mb-6">
                  <MessageSquareQuote className="w-6 h-6 text-[#c8b79e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Narrativa Poderosa</h3>
                <p className="text-white/60">
                  Desenvolva uma história de marca convincente que comunica sua essência e cria uma conexão
                  emocional duradoura com seus clientes.
                </p>
              </motion.div>

              {/* Benefit 6 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 md:p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#c8b79e]/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6 text-[#c8b79e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Vantagem Competitiva</h3>
                <p className="text-white/60">
                  Destaque-se em um mercado saturado com um posicionamento claro e diferenciado que ressoa com seu
                  público-alvo ideal.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section ref={processSectionRef} className="py-16 md:py-24 relative bg-[#1a1814]/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-[#c8b79e]/10 text-[#c8b79e] text-sm font-medium mb-4">
                Processo
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Como funciona o diagnóstico</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Um processo simples e rápido para transformar sua marca em apenas 3 passos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-12">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#c8b79e]/20 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-2xl font-bold text-[#c8b79e]">1</span>
                  <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full bg-[#c8b79e]/10 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Responda o Questionário</h3>
                <p className="text-white/60">
                  Responda 9 perguntas estratégicas sobre sua marca, seus objetivos e seu público-alvo. Leva apenas
                  5 minutos.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#c8b79e]/20 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-2xl font-bold text-[#c8b79e]">2</span>
                  <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full bg-[#c8b79e]/10 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Análise Inteligente</h3>
                <p className="text-white/60">
                  Nossa IA analisa suas respostas e gera um diagnóstico personalizado com insights específicos para
                  sua marca.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#c8b79e]/20 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-2xl font-bold text-[#c8b79e]">3</span>
                  <div className="absolute -right-4 -top-4 w-8 h-8 rounded-full bg-[#c8b79e]/10 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Implemente as Estratégias</h3>
                <p className="text-white/60">
                  Receba um plano de ação detalhado com recomendações práticas para transformar sua marca e acelerar
                  seu crescimento.
                </p>
              </motion.div>
            </div>

            <div className="mt-12 md:mt-16 text-center">
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c8b79e] to-[#b09e85] hover:from-[#d0c0a8] hover:to-[#c8b79e] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1a1814]/40 hover:shadow-xl hover:shadow-[#1a1814]/50 hover:scale-105 border border-[#c8b79e]/30"
              >
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section ref={previewSectionRef} className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-[#c8b79e]/10 text-[#c8b79e] text-sm font-medium mb-4">
                Prévia do Diagnóstico
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Veja o que você vai receber
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Seu diagnóstico personalizado inclui análise profunda, pontuação e insights acionáveis para transformar sua marca.
              </p>
            </div>

            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-12 shadow-xl w-full max-w-3xl mx-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#c8b79e]/20 flex items-center justify-center">
                      <Image
                        src="/images/brandplot-logo.png"
                        alt="BrandPlot"
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    </div>
                    <span className="text-sm text-white/60">Diagnóstico Completo</span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab("branding")}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTab === "branding" ? "bg-[#c8b79e]/20 text-[#c8b79e]" : "text-white/40 hover:text-white/60"}`}
                    >
                      Análise
                    </button>
                    <button
                      onClick={() => setActiveTab("score")}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTab === "score" ? "bg-[#c8b79e]/20 text-[#c8b79e]" : "text-white/40 hover:text-white/60"}`}
                    >
                      Score
                    </button>
                    <button
                      onClick={() => setActiveTab("insights")}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTab === "insights" ? "bg-[#c8b79e]/20 text-[#c8b79e]" : "text-white/40 hover:text-white/60"}`}
                    >
                      Ações
                    </button>
                  </div>
                </div>

                <div className="space-y-4 min-h-[320px]">
                  {activeTab === "branding" && (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
                          <span className="text-sm text-white/60">
                            Diagnóstico de <span className="text-[#c8b79e] font-medium">Sua Empresa</span>
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-3">🎯 Essência da Marca</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Sua marca nasceu de uma motivação genuína e possui elementos distintivos interessantes. A
                        essência está presente, mas precisa ser comunicada de forma mais clara e consistente.
                      </p>

                      <h3 className="text-lg font-bold text-white mb-3 mt-6">🧬 Promessa Central</h3>
                      <div className="bg-white/[0.05] border border-white/[0.1] rounded-lg p-4">
                        <p className="text-white/80 text-sm italic">
                          "Sua marca existe para transformar a experiência do cliente de forma única e memorável."
                        </p>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        A promessa está bem definida conceitualmente, mas precisa ser traduzida em benefícios tangíveis.
                      </p>
                    </div>
                  )}

                  {activeTab === "score" && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                        <svg className="w-full h-full absolute transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2520" strokeWidth="8" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#c8b79e"
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset="81"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="text-center">
                          <span className="text-4xl font-bold text-[#c8b79e]">72</span>
                          <div className="text-white/60 text-sm font-medium">/100</div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-4">Nota de Clareza & Emoção</h3>
                      <p className="text-white/70 text-sm text-center max-w-md leading-relaxed">
                        Sua marca demonstra potencial sólido, mas há oportunidades significativas para maior clareza na comunicação e conexão emocional mais profunda.
                      </p>
                    </div>
                  )}

                  {activeTab === "insights" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white mb-4">🚀 Próximos Passos</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-[#c8b79e] mt-2 shrink-0"></div>
                          <div>
                            <p className="text-white font-medium text-sm">Refinar Posicionamento</p>
                            <p className="text-white/60 text-xs">Definir claramente o que torna sua marca única</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-[#c8b79e] mt-2 shrink-0"></div>
                          <div>
                            <p className="text-white font-medium text-sm">Fortalecer Identidade Visual</p>
                            <p className="text-white/60 text-xs">Alinhar elementos visuais com a personalidade</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-[#c8b79e] mt-2 shrink-0"></div>
                          <div>
                            <p className="text-white font-medium text-sm">Criar Consistência</p>
                            <p className="text-white/60 text-xs">Padronizar comunicação em todos os pontos</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-gradient-to-r from-[#c8b79e]/10 to-[#b09e85]/10 border border-[#c8b79e]/20 rounded-lg">
                        <p className="text-white/80 text-sm text-center">
                          <strong className="text-[#c8b79e]">Pronto para implementar?</strong><br />
                          Fale com um especialista para acelerar sua transformação.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section ref={faqSectionRef} className="py-16 md:py-24 relative bg-[#1a1814]/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-[#c8b79e]/10 text-[#c8b79e] text-sm font-medium mb-4">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                Tire suas dúvidas sobre nosso diagnóstico de marca
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="mb-4"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white pr-8">{faq.question}</h3>
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-[#c8b79e] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#c8b79e] flex-shrink-0" />
                      )}
                    </div>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-white/[0.08]"
                      >
                        <p className="text-white/60 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 md:py-12 border-t border-white/[0.08]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#c8b79e]/20 flex items-center justify-center">
                  <Image
                    src="/images/brandplot-logo.png"
                    alt="BrandPlot"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
                <span className="text-white font-medium">BrandPlot</span>
              </div>
              <p className="text-white/40 text-sm">
                © 2024 BrandPlot. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
