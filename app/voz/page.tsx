"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"

export default function VozRealtime() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [checkingVoice, setCheckingVoice] = useState(true)
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const dataChannel = useRef<RTCDataChannel | null>(null)
  const audioElement = useRef<HTMLAudioElement | null>(null)
  const localStream = useRef<MediaStream | null>(null)

  async function startSession() {
    setIsLoading(true)
    setError("")
    try {
      // 1. Pega o token de sessão
      const tokenResponse = await fetch("/api/realtime-token")
      const data = await tokenResponse.json()
      if (!data.client_secret?.value) throw new Error("Token inválido")
      const EPHEMERAL_KEY = data.client_secret.value

      // 2. Cria conexão WebRTC
      const pc = new RTCPeerConnection()

      // 3. Prepara elemento de áudio para tocar resposta do modelo
      if (!audioElement.current) {
        audioElement.current = document.createElement("audio")
        audioElement.current.autoplay = true
      }
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
          audioElement.current.muted = false;
          audioElement.current.volume = 1;
          audioElement.current.play().catch(() => {});
        }
      }

      // 4. Captura microfone e adiciona track
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      pc.addTrack(localStream.current.getTracks()[0])

      // 5. Cria data channel para eventos
      const dc = pc.createDataChannel("oai-events")
      dataChannel.current = dc

      // 6. SDP Offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 7. Envia offer para o endpoint da OpenAI
      const baseUrl = "https://api.openai.com/v1/realtime"
      const model = "gpt-4o-mini-realtime-preview"
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      })
      const answerSdp = await sdpResponse.text()
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSdp,
      }
      await pc.setRemoteDescription(answer)

      // 8. Eventos do data channel
      dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data)
      })
      dc.addEventListener("open", () => {
        setIsSessionActive(true)
      })
      dc.addEventListener("close", () => {
        setIsSessionActive(false)
      })

      peerConnection.current = pc
    } catch (err: any) {
      setError("Erro ao iniciar sessão: " + (err?.message || err))
      stopSession()
    } finally {
      setIsLoading(false)
    }
  }

  function stopSession() {
    try {
      if (dataChannel.current) {
        dataChannel.current.close()
      }
      if (peerConnection.current) {
        peerConnection.current.getSenders().forEach((sender) => {
          if (sender.track) sender.track.stop()
        })
        peerConnection.current.close()
      }
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop())
      }
      setIsSessionActive(false)
      dataChannel.current = null
      peerConnection.current = null
      localStream.current = null
    } catch {}
  }

  useEffect(() => {
    // Checa status do modo de voz ao carregar a página
    fetch("/api/voice-mode/status")
      .then(res => res.json())
      .then(data => {
        setVoiceEnabled(data.enabled)
        setCheckingVoice(false)
      })
      .catch(() => {
        setVoiceEnabled(false)
        setCheckingVoice(false)
      })
  }, [])

  useEffect(() => {
    return () => {
      stopSession()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1814] text-white p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-center drop-shadow-lg tracking-tight">
        Assistente de Voz da BrandPlot
      </h1>
      <div className="mb-4 sm:mb-6 md:mb-8 max-w-xs sm:max-w-md md:max-w-xl w-full flex flex-col items-center">
        <div className="w-full bg-gradient-to-r from-[#23201a]/60 to-[#2c261b]/60 rounded-xl p-3 sm:p-4 md:p-6 mb-2 shadow-lg border border-[#c8b79e]/10">
          <p className="text-sm sm:text-base md:text-lg text-[#fde68a] font-semibold text-center">
            Impulsione sua marca e crie insights utilizando a potência da inteligência artificial e a expertise do Vicgario Brandstudio.
          </p>
        </div>
        <p className="text-white/80 text-xs sm:text-sm md:text-base text-center italic">
          Converse em tempo real com nosso agente de branding usando a sua voz.<br />
          <span className="not-italic font-medium text-white/90">Para começar, clique no botão de microfone e fale "Olá!"</span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        {checkingVoice ? (
          <div className="text-white/60 text-sm mb-2">Verificando disponibilidade do modo de voz...</div>
        ) : !voiceEnabled ? (
          <div className="bg-yellow-700/20 text-yellow-300 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 text-sm sm:text-base text-center max-w-xs">
            O modo de voz está desativado no momento. Tente novamente mais tarde.
          </div>
        ) : !isSessionActive ? (
          <button
            onClick={startSession}
            disabled={isLoading}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-[#c8b79e] hover:bg-[#d0c0a8] transition-all text-white text-lg sm:text-xl md:text-2xl shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-[#c8b79e]/40 outline-none duration-200"
          >
            {isLoading ? <Loader2 className="animate-spin w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" /> : <Mic className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />}
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all text-white text-lg sm:text-xl md:text-2xl shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-red-400/40 outline-none duration-200"
          >
            <MicOff className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
          </button>
        )}
        <audio ref={audioElement} hidden />
      </div>
      {error && <div className="bg-red-500/10 text-red-400 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 text-sm sm:text-base">{error}</div>}
      <a href="/" className="text-white/60 hover:text-white underline text-sm sm:text-base">Voltar para o início</a>
    </div>
  )
}