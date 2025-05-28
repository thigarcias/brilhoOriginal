"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"

export default function VozRealtime() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
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
      const model = "gpt-4o-realtime-preview-2024-12-17"
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
    return () => {
      stopSession()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1814] text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Assistente de Voz da BrandPlot</h1>
      <p className="mb-8 text-white/70 max-w-xl text-center">
        Converse em tempo real com nosso agente de branding usando a sua voz, para começar clique no botão de microfone e fale Olá!
      </p>
      <div className="flex flex-col items-center gap-4 mb-8">
        {!isSessionActive ? (
          <button
            onClick={startSession}
            disabled={isLoading}
            className="w-24 h-24 rounded-full flex items-center justify-center bg-[#c8b79e] hover:bg-[#d0c0a8] transition-all text-white text-2xl"
          >
            {isLoading ? <Loader2 className="animate-spin w-12 h-12" /> : <Mic className="w-12 h-12" />}
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="w-24 h-24 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all text-white text-2xl"
          >
            <MicOff className="w-12 h-12" />
          </button>
        )}
        <audio ref={audioElement} hidden />
      </div>
      {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-4">{error}</div>}
      <a href="/" className="text-white/60 hover:text-white underline">Voltar para o início</a>
    </div>
  )
}