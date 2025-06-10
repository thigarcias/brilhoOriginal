import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'nova', model = 'tts-1', speed = 1.0 } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Texto não fornecido' },
        { status: 400 }
      )
    }

    // Validar voz (OpenAI suporta: alloy, echo, fable, onyx, nova, shimmer)
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
    const selectedVoice = validVoices.includes(voice) ? voice : 'nova'

    // Validar velocidade (0.25 a 4.0)
    const validSpeed = Math.max(0.25, Math.min(4.0, speed))

    // Usar modelo mais rápido para conversação
    const ttsModel = model === 'gpt-4o-mini-tts' ? 'tts-1' : model

    // Gerar áudio usando OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: ttsModel,
      voice: selectedVoice as any,
      input: text,
      response_format: 'mp3',
      speed: validSpeed,
    })

    // Converter para buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())
    
    // Criar URL de dados (data URL) para o áudio
    const base64Audio = buffer.toString('base64')
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`

    return NextResponse.json({
      success: true,
      audioUrl: audioUrl,
      voice: selectedVoice,
      speed: validSpeed
    })

  } catch (error) {
    console.error('Erro no endpoint de TTS:', error)
    return NextResponse.json(
      { success: false, error: 'Erro na síntese de voz' },
      { status: 500 }
    )
  }
} 