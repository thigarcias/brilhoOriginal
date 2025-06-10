"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react"
import { BrandplotCache } from "@/lib/brandplot-cache"
import { SharedHeader } from "@/components/SharedHeader"

export default function VozOtimizada() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState("")
  const [processingStage, setProcessingStage] = useState("")
  
  // Estados para controle de áudio
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  
  // Refs para controle
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const stream = useRef<MediaStream | null>(null)
  const isMouseDown = useRef(false)
  const recordingStartTime = useRef<number>(0)
  
  // Dados da empresa
  const [companyName, setCompanyName] = useState<string>("Sua Marca")
  const [companyData, setCompanyData] = useState<any>(null)

  // Carregar dados da empresa
  useEffect(() => {
    async function loadCompanyData() {
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
        try {
          const response = await fetch(`/api/brand-data?idUnico=${encodeURIComponent(idUnico)}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              setCompanyName(result.data.nome_empresa || "Sua Marca")
              delete result.data.resposta_8
              delete result.data.senha
              delete result.data.telefone
              delete result.data.updated_at
              setCompanyData(result.data)
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados da empresa:", error)
        }
      }
    }
    loadCompanyData()
  }, [])

  // Iniciar gravação (pressionar e manter)
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isProcessing || isPlaying) return
    
    isMouseDown.current = true
    await startRecording()
  }

  // Parar gravação (soltar botão)
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isMouseDown.current) return
    
    isMouseDown.current = false
    stopRecording()
  }

  // Handlers para touch (mobile)
  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault()
    if (isProcessing || isPlaying) return
    
    isMouseDown.current = true
    await startRecording()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isMouseDown.current) return
    
    isMouseDown.current = false
    stopRecording()
  }

  // Iniciar gravação
  const startRecording = async () => {
    try {
      setError("")
      recordingStartTime.current = Date.now()
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })
      
      stream.current = mediaStream
      audioChunks.current = []
      
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        const recordingDuration = Date.now() - recordingStartTime.current
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        
        // Verificar duração mínima (500ms)
        if (recordingDuration < 500) {
          setError("Gravação muito rápida. Mantenha pressionado por mais tempo.")
          setTimeout(() => setError(""), 3000)
          return
        }
        
        if (audioBlob.size > 1000) {
          await processAudio(audioBlob)
        } else {
          setError("Gravação muito curta. Tente novamente.")
          setTimeout(() => setError(""), 3000)
        }
      }
      
      mediaRecorder.current = recorder
      recorder.start()
      setIsRecording(true)
      
    } catch (err: any) {
      setError("Erro ao acessar microfone: " + (err?.message || err))
    }
  }

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
    
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop())
      stream.current = null
    }
  }

  // Processar áudio usando arquitetura chained
  const processAudio = async (audioBlob: Blob) => {
    try {
      setError("")
      setProcessingStage("Transcrevendo áudio...")
      
      // Transcrição
      const transcriptionResponse = await transcribeAudio(audioBlob)
      if (!transcriptionResponse.success) {
        throw new Error(transcriptionResponse.error || "Erro na transcrição")
      }
      
      const userText = transcriptionResponse.text
      
      if (!userText || userText.trim().length < 3) {
        setError("Não consegui entender. Tente falar mais claramente.")
        setTimeout(() => setError(""), 3000)
        return
      }
      
      setProcessingStage("Processando resposta...")
      
      // Processamento LLM
      const llmResponse = await processWithLLM(userText)
      if (!llmResponse.success) {
        throw new Error(llmResponse.error || "Erro no processamento")
      }
      
      const assistantText = llmResponse.text
      
      setProcessingStage("Gerando áudio...")
      
      // Síntese de voz
      const ttsResponse = await generateSpeech(assistantText)
      if (!ttsResponse.success) {
        throw new Error(ttsResponse.error || "Erro na síntese de voz")
      }
      
      // Reproduzir áudio
      if (ttsResponse.audioUrl) {
        setProcessingStage("")
        playAudio(ttsResponse.audioUrl)
      }
      
    } catch (err: any) {
      setError("Erro no processamento: " + (err?.message || err))
      setProcessingStage("")
    } finally {
      setIsProcessing(false)
      setProcessingStage("")
    }
  }

  // Transcrever áudio
  const transcribeAudio = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.mp3')
    
    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData
    })
    
    return await response.json()
  }

  // Processar com LLM
  const processWithLLM = async (userText: string) => {
    const response = await fetch('/api/voice/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: userText,
        companyData: companyData,
        companyName: companyName
      })
    })
    
    return await response.json()
  }

  // Gerar síntese de voz
  const generateSpeech = async (text: string) => {
    const startTime = Date.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 segundos timeout
      
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: text,
          voice: 'nova',
          model: 'gpt-4o-mini-tts', // Usar modelo mais rápido
          speed: 1.1 // Ligeiramente mais rápido para melhor UX
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      const processingTime = Date.now() - startTime
      console.log(`Frontend TTS: ${processingTime}ms`)
      
      const result = await response.json()
      
      // Log de performance
      if (result.processingTime) {
        console.log(`TTS Performance - Backend: ${result.processingTime}ms, Total: ${processingTime}ms, Cached: ${result.cached}`)
      }
      
      return result
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Timeout na síntese de voz. Tente novamente.' }
      }
      throw error
    }
  }

  // Reproduzir áudio
  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    
    const audio = new Audio(audioUrl)
    audio.onplay = () => {
      setIsPlaying(true)
    }
    
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    
    audio.onerror = () => {
      setError("Erro ao reproduzir áudio")
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    
    setCurrentAudio(audio)
    audio.play()
  }

  // Pausar áudio atual
  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      setIsPlaying(false)
    }
  }

  // Reiniciar
  const reset = () => {
    setError("")
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }
    setIsPlaying(false)
    
    if (isRecording) {
      stopRecording()
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop())
      }
      if (currentAudio) {
        currentAudio.pause()
      }
    }
  }, [])

  // Estado do botão
  const getButtonState = () => {
    if (isRecording) return { 
      bg: 'bg-red-500 hover:bg-red-600 active:bg-red-700', 
      ring: 'focus:ring-red-400/40', 
      pulse: 'animate-pulse',
      icon: MicOff 
    }
    if (isProcessing) return { 
      bg: 'bg-yellow-500', 
      ring: 'focus:ring-yellow-400/40', 
      pulse: 'animate-spin',
      icon: Loader2
    }
    if (isPlaying) return { 
      bg: 'bg-green-500 hover:bg-green-600', 
      ring: 'focus:ring-green-400/40', 
      pulse: '',
      icon: Volume2
    }
    return { 
      bg: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700', 
      ring: 'focus:ring-orange-400/40', 
      pulse: '',
      icon: Mic 
    }
  }

  const buttonState = getButtonState()
  const IconComponent = buttonState.icon

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1814]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-700/[0.05] blur-3xl" />
      
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-700/[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Sound waves durante gravação */}
      {isRecording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex space-x-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-400/60 rounded-full animate-pulse"
                style={{
                  height: `${50 + Math.sin(Date.now() * 0.015 + i) * 40}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10">
        <SharedHeader companyName={companyName} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-white p-8">
        
        {/* Título */}
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Assistente de Voz BrandPlot
          </h1>
          <p className="text-xl text-white/80 mb-4">
            Especialista em branding e estratégia de marca
          </p>
          <p className="text-sm text-orange-300 font-medium">
            Focado em insights personalizados para <span className="text-orange-400 font-bold">{companyName}</span>
          </p>
        </div>

        {/* Botão principal */}
        <div className="flex flex-col items-center space-y-8">
          
          <div className="relative">
            {/* Círculos de onda */}
            {(isRecording || isPlaying) && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-orange-400/30 animate-ping scale-110"></div>
                <div className="absolute inset-0 rounded-full border-2 border-orange-400/20 animate-ping scale-125" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full border-2 border-orange-400/10 animate-ping scale-150" style={{ animationDelay: '1s' }}></div>
              </>
            )}
            
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // Para casos onde o mouse sai do botão
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              disabled={isProcessing}
              className={`w-36 h-36 rounded-full flex items-center justify-center transition-all text-white text-3xl shadow-2xl focus:ring-8 outline-none duration-200 transform hover:scale-105 active:scale-95 ${buttonState.bg} ${buttonState.ring} ${buttonState.pulse} ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'} select-none`}
            >
              <IconComponent className="w-18 h-18" />
            </button>
          </div>

          {/* Status */}
          <div className="text-center h-12">
            <p className="text-lg font-medium text-white/90">
              {!isRecording && !isProcessing && !isPlaying && "Pressione e mantenha para falar"}
              {isRecording && "Falando... (solte para processar)"}
              {isProcessing && (processingStage || "Processando...")}
              {isPlaying && "Reproduzindo resposta"}
            </p>
            {isProcessing && processingStage && (
              <p className="text-sm text-white/60 mt-1">
                {processingStage.includes("Gerando áudio") && "Isso pode levar alguns segundos..."}
              </p>
            )}
          </div>

          {/* Controles */}
          {(error || isPlaying) && (
            <div className="flex flex-col items-center space-y-4">
              {isPlaying && (
                <button
                  onClick={pauseAudio}
                  className="px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl transition-colors text-sm text-orange-300"
                >
                  Pausar
                </button>
              )}
              
              {error && (
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-sm text-white/80 hover:text-white"
                >
                  Tentar Novamente
                </button>
              )}
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="max-w-md">
              <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm text-center border border-red-500/20">
                {error}
              </div>
            </div>
          )}

        </div>

        {/* Instruções */}
        <div className="mt-16 text-center text-white/60 text-sm max-w-xl">
          <p>
            Pressione e mantenha o botão pressionado enquanto fala sua pergunta sobre branding, 
            estratégia de marca ou qualquer dúvida sobre <span className="text-orange-300">{companyName}</span>.
          </p>
        </div>

      </div>
    </div>
  )
}