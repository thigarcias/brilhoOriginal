"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Check } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

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

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className={cn(
                "text-sm transition-colors",
                activeTab === "dashboard" ? "text-white" : "text-white/60 hover:text-white/80",
              )}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/planos"
              className={cn(
                "text-sm transition-colors",
                activeTab === "planos" ? "text-white" : "text-white/60 hover:text-white/80",
              )}
              onClick={() => setActiveTab("planos")}
            >
              Planos
            </Link>
            <Link
              href="/dashboard/suporte"
              className={cn(
                "text-sm transition-colors",
                activeTab === "suporte" ? "text-white" : "text-white/60 hover:text-white/80",
              )}
              onClick={() => setActiveTab("suporte")}
            >
              Suporte
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Bem-vindo de volta</h1>

        {/* Top cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Diagnostic card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1a1814]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Diagnóstico da sua marca</h2>
            <p className="text-white/70 mb-8">
              Sua marca apresentou uma identidade inconsistente e não comunica com clareza seus valores e diferenciais.
            </p>

            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full absolute" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2520" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#c8b79e"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset="133"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="text-4xl font-bold text-white">52</span>
              </div>
            </div>

            <div className="text-center">
              <button className="text-[#c8b79e] hover:text-[#d0c0a8] transition-colors text-sm font-medium">
                Ver diagnóstico completo
              </button>
            </div>
          </motion.div>

          {/* Positioning card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#1a1814]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Mude seu posicionamento</h2>
            <p className="text-white/70 mb-8 flex-grow">
              Descubra novas estratégias e implemente a ideal para elevar sua marca no mercado.
            </p>

            <div className="flex justify-start">
              <button className="px-6 py-3 bg-[#c8b79e] hover:bg-[#d0c0a8] text-[#1a1814] font-medium rounded-lg transition-colors">
                Começar
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#1a1814]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-lg font-medium text-white/80 mb-2">Basic</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">R$ 100</span>
              <span className="text-white/60">/mês</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Acesso ao diagnóstico básico</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Geração de estratégias</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Briefing para designer</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Suporte por email</span>
              </li>
            </ul>

            <button className="w-full px-6 py-3 border border-[#c8b79e]/50 text-[#c8b79e] hover:bg-[#c8b79e]/10 font-medium rounded-lg transition-colors">
              Escolher
            </button>
          </motion.div>

          {/* Pro plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#1a1814]/80 backdrop-blur-sm border border-[#c8b79e]/30 rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-lg font-medium text-white/80 mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">R$ 200</span>
              <span className="text-white/60">/mês</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Acesso ao diagnóstico básico</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Geração de estratégias</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Geração da identidade visual</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Suporte por e-mail</span>
              </li>
            </ul>

            <button className="w-full px-6 py-3 bg-[#c8b79e] hover:bg-[#d0c0a8] text-[#1a1814] font-medium rounded-lg transition-colors">
              Escolher
            </button>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-[#1a1814]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-lg font-medium text-white/80 mb-2">Premium</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">R$ 400</span>
              <span className="text-white/60">/mês</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Acesso ao diagnóstico básico</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Geração de estratégias</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Geração da identidade visual</span>
              </li>
              <li className="flex items-start gap-2 text-white/80 text-sm">
                <Check className="w-5 h-5 text-[#c8b79e] shrink-0 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
            </ul>

            <button className="w-full px-6 py-3 border border-[#c8b79e]/50 text-[#c8b79e] hover:bg-[#c8b79e]/10 font-medium rounded-lg transition-colors">
              Escolher
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
