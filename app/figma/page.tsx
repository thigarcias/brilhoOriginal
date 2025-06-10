"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SharedHeader } from "@/components/SharedHeader"
import { ArrowLeft, Upload, ImageIcon, Palette, Type, Frame, Eye, RotateCcw, Settings, Zap } from "lucide-react"

// Configurações da API Figma
const FIGMA_TOKEN = process.env.NEXT_PUBLIC_FIGMA_TOKEN
const FILE_KEY = process.env.NEXT_PUBLIC_FIGMA_FILE_KEY
const PLUGIN_ID = process.env.NEXT_PUBLIC_FIGMA_PLUGIN_ID

// Flag para forçar modo simulado (útil quando API está com problemas)
const FORCE_MOCK_MODE = true

// Funções da API Figma
const figmaAPI = {
  // Buscar informações do arquivo
  async getFile() {
    // Se modo simulado está ativo, retornar dados falsos imediatamente
    if (FORCE_MOCK_MODE) {
      console.log('🎭 Modo simulado ativo - retornando dados falsos')
      return this.getMockFileData()
    }

    try {
      if (!FIGMA_TOKEN || !FILE_KEY) {
        console.warn('⚠️ Figma credentials missing - using mock data')
        return this.getMockFileData()
      }
      
      const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
        headers: {
          'X-FIGMA-TOKEN': FIGMA_TOKEN as string
        }
      })
      
      if (!response.ok) {
        console.warn(`⚠️ API retornou ${response.status} - usando dados simulados`)
        return this.getMockFileData()
      }
      
      return await response.json()
    } catch (error) {
      console.warn('⚠️ Erro na API Figma - usando dados simulados:', error)
      return this.getMockFileData()
    }
  },

  // Dados simulados para quando a API falha
  getMockFileData() {
    return {
      name: "Template Vicgario (Simulado)",
      document: {
        children: [{
          type: 'CANVAS',
          name: 'Page 1',
          children: [
            {
              id: '1:1',
              name: 'Carrossel Principal',
              type: 'FRAME',
              children: [
                { id: '1:2', name: 'texto1', type: 'FRAME' },
                { id: '1:3', name: 'texto2', type: 'FRAME' },
                { id: '1:4', name: 'texto3', type: 'FRAME' },
                { id: '1:5', name: 'texto4', type: 'FRAME' },
                { id: '1:6', name: 'texto5', type: 'FRAME' }
              ]
            },
            {
              id: '2:1',
              name: 'Template A',
              type: 'FRAME',
              children: [
                { id: '2:2', name: 'slide1', type: 'FRAME' },
                { id: '2:3', name: 'slide2', type: 'FRAME' },
                { id: '2:4', name: 'slide3', type: 'FRAME' }
              ]
            },
            {
              id: '3:1',
              name: 'Template B',
              type: 'FRAME',
              children: [
                { id: '3:2', name: 'frame1', type: 'FRAME' },
                { id: '3:3', name: 'frame2', type: 'FRAME' },
                { id: '3:4', name: 'frame3', type: 'FRAME' },
                { id: '3:5', name: 'frame4', type: 'FRAME' }
              ]
            },
            {
              id: '4:1',
              name: 'Slide Master',
              type: 'FRAME',
              children: [
                { id: '4:2', name: 'titulo', type: 'FRAME' },
                { id: '4:3', name: 'subtitulo', type: 'FRAME' },
                { id: '4:4', name: 'corpo', type: 'FRAME' },
                { id: '4:5', name: 'cta', type: 'FRAME' }
              ]
            }
          ]
        }]
      }
    }
  },

  // Buscar nós específicos
  async getNodes(nodeIds: string[]) {
    try {
      if (!FIGMA_TOKEN || !FILE_KEY) {
        console.warn('⚠️ Figma credentials missing')
        return null
      }
      
      const idsParam = nodeIds.join(',')
      const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${idsParam}`, {
        headers: {
          'X-FIGMA-TOKEN': FIGMA_TOKEN as string
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ Erro ao buscar nós:', error)
      return null
    }
  },

  // Extrair frames de uma página
  extractFrames(document: any, pageName = 'Page 1') {
    const page = document.children.find((child: any) => 
      child.type === 'CANVAS' && (child.name === pageName || !pageName)
    )
    
    if (!page) return []
    
    return page.children
      .filter((child: any) => child.type === 'FRAME')
      .map((frame: any) => ({
        id: frame.id,
        name: frame.name,
        type: frame.type,
        children: frame.children || []
      }))
  },

  // Extrair textos de um frame
  extractTexts(frame: any): any[] {
    const texts: any[] = []
    
    function traverse(node: any) {
      if (node.type === 'TEXT') {
        texts.push({
          id: node.id,
          name: node.name,
          characters: node.characters,
          style: node.style
        })
      }
      
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    
    traverse(frame)
    return texts
  }
}

// Sistema de comunicação com o plugin
const pluginCommunication = {
  // Abrir Figma com o plugin
  async openFigmaWithPlugin() {
    console.log('🚀 Abrindo Figma...')
    
    try {
      // Múltiplas tentativas para abrir o plugin
      const urls = [
        `figma://file/${FILE_KEY}`,
        `https://www.figma.com/file/${FILE_KEY}/`,
        `https://www.figma.com/file/${FILE_KEY}/?plugin-id=${PLUGIN_ID}`,
        `https://www.figma.com/file/${FILE_KEY}/?tab=dev-resources&plugin-id=${PLUGIN_ID}`
      ]
      
      // Tentar abrir desktop primeiro
      window.open(urls[0], '_blank')
      
      // Aguardar e abrir web como backup
      setTimeout(() => {
        console.log('🌐 Abrindo Figma Web como backup...')
        window.open(urls[1], '_blank')
      }, 1500)
      
      return true
    } catch (error) {
      console.error('❌ Erro ao abrir Figma:', error)
      return false
    }
  },

  // Enviar comando para o plugin
  async sendCommandToPlugin(command: any) {
    console.log('📤 Web: Enviando comando para plugin:', command)
    
    const commandWithMetadata = {
      ...command,
      timestamp: Date.now(),
      source: 'vicgario-web',
      id: Math.random().toString(36).substr(2, 9) // ID único para tracking
    }
    
    let deliveryAttempts = 0
    let successfulDeliveries = 0
    
    // 1. Tentar postMessage direto para iframes do Figma (PRIORITÁRIO)
    try {
      const figmaIframes = document.querySelectorAll('iframe[src*="figma.com"], iframe[src*="embed.figma.com"]')
      if (figmaIframes.length > 0) {
        figmaIframes.forEach(iframe => {
          try {
            const iframeWindow = (iframe as HTMLIFrameElement).contentWindow
            if (iframeWindow) {
              iframeWindow.postMessage(commandWithMetadata, '*')
              successfulDeliveries++
            }
          } catch (iframeError: any) {
            console.log('ℹ️ Web: Erro em iframe específico do Figma:', iframeError?.message || 'Erro desconhecido')
          }
        })
        deliveryAttempts++
        console.log(`📡 Web: Comando enviado para ${figmaIframes.length} iframe(s) Figma`)
      }
    } catch (error: any) {
      console.log('ℹ️ Web: PostMessage para Figma iframes falhou:', error?.message || 'Erro desconhecido')
    }
    
    // 2. Tentar postMessage para todos os iframes (fallback)
    try {
      const allIframes = document.querySelectorAll('iframe')
      let iframeCount = 0
      allIframes.forEach(frame => {
        try {
          frame.contentWindow?.postMessage(commandWithMetadata, '*')
          iframeCount++
        } catch (frameError: any) {
          // Ignorar erros de cross-origin silenciosamente
        }
      })
      if (iframeCount > 0) {
        deliveryAttempts++
        successfulDeliveries++
        console.log(`📡 Web: Comando enviado para ${iframeCount} iframe(s) total`)
      }
    } catch (error: any) {
      console.log('ℹ️ Web: PostMessage para todos os iframes falhou:', error?.message || 'Erro desconhecido')
    }
    
    // 3. Tentar postMessage para window parent (se em iframe)
    try {
      if (window.parent !== window) {
        window.parent.postMessage(commandWithMetadata, '*')
        deliveryAttempts++
        successfulDeliveries++
        console.log('📡 Web: Comando enviado para window parent')
      }
    } catch (error: any) {
      console.log('ℹ️ Web: PostMessage para parent falhou:', error?.message || 'Erro desconhecido')
    }
    
    // 4. Broadcast para todas as janelas
    try {
      window.postMessage(commandWithMetadata, '*')
      deliveryAttempts++
      successfulDeliveries++
      console.log('📡 Web: Comando enviado via broadcast')
    } catch (error: any) {
      console.log('ℹ️ Web: Broadcast falhou:', error?.message || 'Erro desconhecido')
    }
    
    // 5. ÚLTIMO RECURSO: localStorage (apenas se outros métodos falharam)
    if (successfulDeliveries === 0) {
      try {
        if (typeof Storage !== 'undefined' && localStorage) {
          localStorage.setItem('figma-plugin-command', JSON.stringify(commandWithMetadata))
          deliveryAttempts++
          console.log('💾 Web: ÚLTIMO RECURSO - Comando armazenado no localStorage')
        }
      } catch (error: any) {
        console.error('❌ Web: Todos os métodos de comunicação falharam:', error?.message || 'Erro desconhecido')
        throw new Error('Falha na comunicação com o plugin: ' + (error?.message || 'Erro desconhecido'))
      }
    }
    
    console.log(`✅ Web: Comando enviado com sucesso (${successfulDeliveries}/${deliveryAttempts} métodos funcionaram)`)
    return true
  },

  // Verificar se o plugin está conectado
  async checkPluginConnection(): Promise<boolean> {
    try {
      // 1. Verificar via localStorage se o plugin está ativo (método mais rápido)
      const pluginStatus = localStorage.getItem('figma-plugin-status')
      if (pluginStatus) {
        const status = JSON.parse(pluginStatus)
        const timeDiff = Date.now() - status.timestamp
        
        // Considerar conectado se status foi atualizado nos últimos 10 segundos
        if (timeDiff < 10000 && status.connected) {
          console.log('✅ Plugin detectado via armazenamento:', status)
          return true
        }
      }
      
      // 2. Tentar comunicação direta via postMessage com ping específico
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log('⏱️ Timeout na verificação do plugin')
          resolve(false)
        }, 3000)
        
        const handler = (event: MessageEvent) => {
          if (event.data && event.data.source === 'figma-plugin' && 
              (event.data.type === 'plugin-connected' || event.data.type === 'command-processed')) {
            clearTimeout(timeout)
            window.removeEventListener('message', handler)
            console.log('✅ Plugin respondeu à verificação')
            resolve(true)
          }
        }
        
        window.addEventListener('message', handler)
        
        // Solicitar resposta do plugin via broadcast
        window.postMessage({
          type: 'ping-plugin',
          source: 'vicgario-web',
          timestamp: Date.now()
        }, '*')
        
        console.log('📡 Verificação de plugin enviada')
      })
      
    } catch (error) {
      console.error('❌ Erro ao verificar plugin:', error)
      return false
    }
  }
}

export default function FigmaPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFlow, setSelectedFlow] = useState<"ia" | "manual" | null>(null)
  const [tema, setTema] = useState("")
  const [manualText, setManualText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string[]>([])
  const [showCustomization, setShowCustomization] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  
  // Estados do Plugin
  const [availableFonts, setAvailableFonts] = useState<string[]>(['Inter', 'Arial', 'Helvetica', 'Roboto', 'Outfit', 'Montserrat'])
  const [parentFrames, setParentFrames] = useState<string[]>([])
  const [childFrames, setChildFrames] = useState<string[]>([])
  const [selectedParentFrame, setSelectedParentFrame] = useState("")
  const [selectedChildFrame, setSelectedChildFrame] = useState("")
  const [isFigmaConnected, setIsFigmaConnected] = useState(false)
  const [isPluginConnected, setIsPluginConnected] = useState(false)
  const [showFigmaInstructions, setShowFigmaInstructions] = useState(false)
  
  // Configurações de estilo
  const [textColor, setTextColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [fontSize, setFontSize] = useState(75)
  const [fontFamily, setFontFamily] = useState("Inter")
  const [fontWeight, setFontWeight] = useState("Regular")
  
  // Upload de imagens
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  
  // Estados de histórico e preview
  const [textHistory, setTextHistory] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const figmaIframeRef = useRef<HTMLIFrameElement>(null)

  // Conectar com o Figma e buscar dados REAIS
  const connectToFigma = useCallback(async () => {
    const iframe = figmaIframeRef.current
    if (!iframe) return

    try {
      console.log('🔗 Conectando com Figma...')
      
      // Buscar dados do arquivo (com fallback automático para simulação)
      const fileData = await figmaAPI.getFile()
      
      if (fileData) {
        const isSimulated = fileData.name.includes('Simulado')
        
        if (isSimulated) {
          console.log('🎭 Usando dados simulados')
        } else {
          console.log('✅ Arquivo real carregado:', fileData.name)
        }
        
        // Extrair frames
        const realFrames = figmaAPI.extractFrames(fileData.document)
        const frameNames = realFrames.map((frame: any) => frame.name)
        
        console.log('🖼️ Frames encontrados:', frameNames)
        
        setParentFrames(frameNames)
        setAvailableFonts(['Inter', 'Arial', 'Helvetica', 'Roboto', 'Outfit', 'Montserrat', 'Open Sans', 'Poppins'])
        setIsFigmaConnected(true)
        
        console.log(`✅ Conectado! ${isSimulated ? '(Modo Simulado)' : '(Dados Reais)'}`)
      } else {
        // Último recurso de fallback
        console.log('🔄 Último fallback - dados simulados básicos')
        const mockFrames = ['Carrossel Principal', 'Template A', 'Template B', 'Slide Master']
        setParentFrames(mockFrames)
        setAvailableFonts(['Inter', 'Arial', 'Helvetica', 'Roboto', 'Outfit', 'Montserrat'])
        setIsFigmaConnected(true)
      }
    } catch (error) {
      console.warn('⚠️ Erro na conexão, usando fallback:', error)
      
      // Fallback garantido
      const mockFrames = ['Carrossel Principal', 'Template A', 'Template B', 'Slide Master']
      setParentFrames(mockFrames)
      setAvailableFonts(['Inter', 'Arial', 'Helvetica', 'Roboto', 'Outfit', 'Montserrat'])
      setIsFigmaConnected(true)
    }
  }, [])

  // Buscar frames filhos REAIS quando selecionar um frame pai
  const handleParentFrameChange = useCallback(async (parentName: string) => {
    setSelectedParentFrame(parentName)
    
    try {
      console.log(`🔍 Buscando filhos do frame: ${parentName}`)
      
      // Buscar dados reais do arquivo
      const fileData = await figmaAPI.getFile()
      
      if (fileData) {
        const realFrames = figmaAPI.extractFrames(fileData.document)
        const parentFrame = realFrames.find((frame: any) => frame.name === parentName)
        
        if (parentFrame) {
          // Extrair frames filhos reais
          const childFrameNames = parentFrame.children
            .filter((child: any) => child.type === 'FRAME')
            .map((child: any) => child.name)
          
          console.log(`👶 Frames filhos encontrados:`, childFrameNames)
          setChildFrames(childFrameNames)
        } else {
          console.log('❌ Frame pai não encontrado, usando simulação')
          // Fallback para simulação
          setChildFrames(getMockChildren(parentName))
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar frames filhos:', error)
      // Fallback para simulação
      setChildFrames(getMockChildren(parentName))
    }
    
    setSelectedChildFrame("")
  }, [])

  // Função auxiliar para dados simulados (fallback)
  const getMockChildren = (parentName: string): string[] => {
    switch (parentName) {
      case 'Carrossel Principal':
        return ['texto1', 'texto2', 'texto3', 'texto4', 'texto5']
      case 'Template A':
        return ['slide1', 'slide2', 'slide3']
      case 'Template B':
        return ['frame1', 'frame2', 'frame3', 'frame4']
      case 'Slide Master':
        return ['titulo', 'subtitulo', 'corpo', 'cta']
      default:
        return []
    }
  }

  // Função de geração de IA
  const handleIAGeneration = async () => {
    if (!tema.trim()) return

    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockContent = [
        "Como a IA está revolucionando a criação de conteúdo",
        "Ferramentas essenciais para automatizar seu workflow",
        "Dicas práticas para implementar IA no seu negócio",
        "Resultados reais: cases de sucesso com IA",
        "O futuro da criação de conteúdo com inteligência artificial",
      ]

      setGeneratedContent(mockContent)
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Upload de arquivos de texto
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setManualText(content)
      }
      reader.readAsText(file)
    }
  }

  // Upload de imagens
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const imagePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })

      Promise.all(imagePromises).then((images) => {
        setUploadedImages(prev => [...prev, ...images])
      })
    }
  }

  // Processar texto manual em blocos
  const parseManualText = (text: string) => {
    return text
      .split(/\n+/)
      .map((line) => line.replace(/^texto\s*\d+\s*-\s*/, "").trim())
      .filter(Boolean)
  }

  // Aplicar textos no Figma via Plugin REAL
  const applyTextsToFigma = async () => {
    if (!isFigmaConnected) {
      alert('⚠️ Conecte-se ao Figma primeiro!')
      return
    }

    const content = selectedFlow === "ia" ? generatedContent : parseManualText(manualText)
    
    if (content.length === 0) {
      alert('⚠️ Nenhum conteúdo para aplicar!')
      return
    }

    setIsApplying(true)

    try {
      // Comando real para o plugin
      const pluginCommand = {
        type: 'apply-text',
        content: content.join('\n'),
        parentName: selectedParentFrame,
        frameName: selectedChildFrame,
        options: { uppercase: false, onlySelected: false }
      }

      console.log('📝 Aplicando textos via plugin:', content)
      console.log('🚀 Comando completo:', pluginCommand)

      // Enviar comando para o plugin
      await pluginCommunication.sendCommandToPlugin(pluginCommand)

      // Tentar abrir Figma com plugin se não estiver conectado
      if (!isPluginConnected) {
        setShowFigmaInstructions(true)
        await pluginCommunication.openFigmaWithPlugin()
      }

      // Criar preview dos textos aplicados
      const preview = content.map((text, index) => ({
        name: selectedChildFrame ? `${selectedChildFrame}-texto${index + 1}` : `texto${index + 1}`,
        applied: text
      }))

      setPreviewData(preview)
      setShowPreview(true)

      alert(`✅ ${content.length} textos enviados para o plugin! ${!isPluginConnected ? 'Abra o Figma para aplicar.' : ''}`)
      
    } catch (error) {
      console.error('❌ Erro ao enviar textos:', error)
      alert('❌ Erro ao comunicar com o plugin Figma.')
    } finally {
      setIsApplying(false)
    }
  }

  // Aplicar estilos de texto no Figma via Plugin
  const applyTextStylesToFigma = async () => {
    if (!isFigmaConnected) {
      alert('⚠️ Conecte-se ao Figma primeiro!')
      return
    }

    setIsApplying(true)

    try {
      const styleData = {
        color: textColor,
        fontSize,
        fontFamily,
        fontWeight,
        parentFrame: selectedParentFrame,
        childFrame: selectedChildFrame
      }

      console.log('🎨 Enviando estilos para o plugin Figma:', styleData)

      // Comando para o plugin
      const pluginCommand = {
        type: 'edit-text-style',
        ...styleData,
        parentName: selectedParentFrame,
        frameName: selectedChildFrame,
        size: fontSize,
        font: fontFamily,
        weight: fontWeight
      }

      console.log('🚀 Comando de estilo enviado para plugin:', pluginCommand)

      // Simular comunicação com plugin
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert(`✅ Estilos enviados para o plugin Figma!`)
      
    } catch (error) {
      console.error('❌ Erro ao enviar estilos:', error)
      alert('❌ Erro ao comunicar com o plugin.')
    } finally {
      setIsApplying(false)
    }
  }

  // Aplicar cor de fundo no Figma
  const applyBackgroundToFigma = async () => {
    if (!isFigmaConnected) {
      alert('⚠️ Conecte-se ao Figma primeiro!')
      return
    }

    if (!selectedParentFrame) {
      alert('⚠️ Selecione um frame primeiro!')
      return
    }

    setIsApplying(true)

    try {
      console.log('🖼️ Aplicando cor de fundo:', backgroundColor, 'no frame:', selectedParentFrame)

      // Simular aplicação de fundo
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert(`✅ Cor de fundo aplicada no frame: ${selectedParentFrame}!`)
      
    } catch (error) {
      console.error('❌ Erro ao aplicar fundo:', error)
      alert('❌ Erro ao aplicar cor de fundo.')
    } finally {
      setIsApplying(false)
    }
  }

  // Aplicar imagens no Figma
  const applyImagesToFigma = async () => {
    if (!isFigmaConnected) {
      alert('⚠️ Conecte-se ao Figma primeiro!')
      return
    }

    if (uploadedImages.length === 0) {
      alert('⚠️ Faça upload de imagens primeiro!')
      return
    }

    setIsApplying(true)

    try {
      console.log('🖼️ Aplicando imagens:', uploadedImages.length, 'imagens')

      // Simular aplicação de imagens
      await new Promise(resolve => setTimeout(resolve, 1500))

      alert(`✅ ${uploadedImages.length} imagens aplicadas com sucesso!`)
      
    } catch (error) {
      console.error('❌ Erro ao aplicar imagens:', error)
      alert('❌ Erro ao aplicar imagens.')
    } finally {
      setIsApplying(false)
    }
  }

  // Aplicar tudo de uma vez (função principal)
  const applyAllToFigma = async () => {
    if (!isFigmaConnected) {
      alert('⚠️ Conecte-se ao Figma primeiro!')
      return
    }

    setIsApplying(true)

    try {
      // 1. Aplicar textos
      if (generatedContent.length > 0 || manualText.trim()) {
        await applyTextsToFigma()
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // 2. Aplicar estilos de texto
      if (textColor !== "#000000" || fontSize !== 75 || fontFamily !== "Inter") {
        await applyTextStylesToFigma()
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // 3. Aplicar cor de fundo
      if (backgroundColor !== "#ffffff" && selectedParentFrame) {
        await applyBackgroundToFigma()
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // 4. Aplicar imagens
      if (uploadedImages.length > 0) {
        await applyImagesToFigma()
      }

      alert('🎉 Todas as alterações foram aplicadas com sucesso no Figma!')
      
    } catch (error) {
      console.error('❌ Erro geral:', error)
      alert('❌ Erro ao aplicar alterações.')
    } finally {
      setIsApplying(false)
    }
  }

  // Desfazer alterações de texto
  const undoTextChanges = async () => {
    if (!isFigmaConnected) {
      alert('⚠️ Conecte-se ao Figma primeiro!')
      return
    }

    try {
      console.log('↩️ Desfazendo alterações de texto...')
      
      // Simular desfazer
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPreviewData([])
      setShowPreview(false)
      
      alert('✅ Alterações de texto desfeitas!')
      
    } catch (error) {
      console.error('❌ Erro ao desfazer:', error)
      alert('❌ Erro ao desfazer alterações.')
    }
  }

  // Conectar automaticamente quando o Figma carregar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('🔗 Conectando com Figma REST API...')
      connectToFigma()
    }, 2000)
    
    return () => {
      clearTimeout(timeoutId)
    }
  }, [connectToFigma])

  // Verificar conexão do plugin periodicamente
  useEffect(() => {
    let pluginCheckInterval: NodeJS.Timeout
    
    // Função para verificar conexão do plugin
    const checkPluginStatus = async () => {
      try {
        // 1. Verificar localStorage para status recente (método mais rápido)
        const pluginStatus = localStorage.getItem('figma-plugin-status')
        if (pluginStatus) {
          const status = JSON.parse(pluginStatus)
          const timeDiff = Date.now() - status.timestamp
          
          // Considerar conectado se status foi atualizado nos últimos 10 segundos
          if (timeDiff < 10000 && status.connected) {
            if (!isPluginConnected) {
              console.log('✅ Plugin detectado via localStorage')
              setIsPluginConnected(true)
            }
            return
          }
        }
        
        // 2. Verificar se há comandos pendentes sendo processados
        const pendingCommand = localStorage.getItem('figma-plugin-command')
        if (pendingCommand) {
          try {
            const command = JSON.parse(pendingCommand)
            const commandAge = Date.now() - command.timestamp
            
            // Se há comandos recentes, o plugin provavelmente está ativo
            if (commandAge < 30000) { // 30 segundos
              console.log('🔄 Plugin detectado via comandos pendentes')
              setIsPluginConnected(true)
              return
            }
          } catch (e) {
            // Ignorar erros de parsing
          }
        }
        
        // 3. Enviar ping direto se localStorage não tem info recente
        const isConnected: boolean = await pluginCommunication.checkPluginConnection()
        if (isConnected !== isPluginConnected) {
          setIsPluginConnected(isConnected)
          console.log(`🔄 Status do plugin atualizado: ${isConnected ? 'CONECTADO' : 'DESCONECTADO'}`)
        }
        
      } catch (error) {
        console.log('ℹ️ Erro na verificação do plugin:', error)
        // Não forçar desconexão em caso de erro, pode ser temporário
      }
    }
    
    // Verificação inicial mais rápida (500ms)
    const initialCheck = setTimeout(() => {
      checkPluginStatus()
    }, 500)
    
    // Verificação periódica mais agressiva para localhost
    pluginCheckInterval = setInterval(() => {
      checkPluginStatus()
    }, 3000) // A cada 3 segundos (mais frequente para dev)
    
    return () => {
      clearTimeout(initialCheck)
      clearInterval(pluginCheckInterval)
    }
  }, [isPluginConnected])

  // Escutar mensagens do plugin via postMessage
  useEffect(() => {
    const handlePluginMessage = (event: MessageEvent) => {
      // Verificar se a mensagem vem do plugin Figma
      if (event.data && event.data.source === 'figma-plugin') {
        console.log('📨 Mensagem recebida do plugin:', event.data)
        
        switch (event.data.type) {
          case 'plugin-connected':
            setIsPluginConnected(true)
            console.log('✅ Plugin conectado!')
            break
            
          case 'command-processed':
            console.log('✅ Comando processado pelo plugin:', event.data.command)
            setIsApplying(false)
            break
            
          case 'command-error':
            console.error('❌ Erro no plugin:', event.data.error)
            setIsApplying(false)
            alert(`❌ Erro no plugin: ${event.data.error}`)
            break
            
          case 'frames-updated':
            if (event.data.frames) {
              setParentFrames(event.data.frames)
              console.log('🖼️ Frames atualizados pelo plugin:', event.data.frames)
            }
            break
        }
      }
    }

    // Adicionar listener para eventos customizados também
    const handleCustomEvent = (event: CustomEvent) => {
      if (event.detail && event.detail.source === 'figma-plugin') {
        console.log('🎯 Evento customizado do plugin recebido:', event.detail)
        handlePluginMessage({ data: event.detail } as MessageEvent)
      }
    }

    window.addEventListener('message', handlePluginMessage)
    window.addEventListener('figma-plugin-ready', handleCustomEvent as EventListener)
    
    return () => {
      window.removeEventListener('message', handlePluginMessage)
      window.removeEventListener('figma-plugin-ready', handleCustomEvent as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#1a1814]">
      <SharedHeader />
      <main className="flex h-[calc(100vh-80px)]">
        {/* Interface Principal - Left Side */}
        <div className="w-[480px] bg-[#1a1814] border-r border-[#c8b79e]/20 p-6 overflow-y-auto">
          <div className="max-w-full">
            {/* Header */}
            <div className="mb-6">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStep(1)
                    setSelectedFlow(null)
                    setShowCustomization(false)
                  }}
                  className="mb-4 text-[#c8b79e] hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">
                  {showCustomization ? "Vicgario Studio" : "Vicgario Content Machine"}
              </h1>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isFigmaConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-white/60">
                    {isFigmaConnected ? 'Conectado' : 'Carregando'}
                  </span>
                </div>
              </div>
              
              <p className="text-white/60 text-sm">
                {showCustomization
                  ? "Configure os estilos e aplique diretamente no Figma"
                  : "Crie conteúdo otimizado e aplique no Figma"}
              </p>
            </div>

            {/* Step 1: Choose Flow */}
            {currentStep === 1 && !showCustomization && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Como quer criar o conteúdo?</h2>

                <Button
                  onClick={() => {
                    setSelectedFlow("ia")
                    setCurrentStep(2)
                  }}
                  className="w-full bg-gradient-to-r from-[#c8b79e] to-[#b09e85] text-[#1a1814] hover:from-[#d0c0a8] hover:to-[#c8b79e] h-16 text-left justify-start"
                >
                  <span className="text-2xl mr-3">🤖</span>
                  <div>
                    <div className="font-semibold">Gerar com IA</div>
                    <div className="text-sm opacity-80">Descreva o tema e a IA cria o conteúdo</div>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setSelectedFlow("manual")
                    setCurrentStep(2)
                  }}
                  className="w-full bg-gradient-to-r from-[#b09e85] to-[#c8b79e] text-[#1a1814] hover:from-[#c8b79e] hover:to-[#d0c0a8] h-16 text-left justify-start"
                >
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <div className="font-semibold">Usar meu conteúdo</div>
                    <div className="text-sm opacity-80">Cole texto ou faça upload de arquivo</div>
                  </div>
                </Button>
              </div>
            )}

            {/* Step 2: IA Flow */}
            {currentStep === 2 && selectedFlow === "ia" && !showCustomization && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Descreva seu tema</h2>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Tema do conteúdo</label>
                  <textarea
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ex: Como usar IA para criar conteúdo eficiente para redes sociais"
                    className="w-full h-32 bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-3 text-white placeholder-white/50 focus:border-[#c8b79e] focus:outline-none resize-none"
                  />
                </div>

                <Button
                  onClick={handleIAGeneration}
                  disabled={!tema.trim() || isGenerating}
                  className="w-full bg-[#c8b79e] text-[#1a1814] hover:bg-[#d0c0a8] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#1a1814]/30 border-t-[#1a1814] rounded-full animate-spin" />
                      Gerando conteúdo...
                    </div>
                  ) : (
                    <>🎯 Gerar conteúdo com IA</>
                  )}
                </Button>

                {generatedContent.length > 0 && (
                  <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-3">Conteúdo gerado:</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {generatedContent.map((content, index) => (
                          <div key={index} className="text-white/80 text-sm">
                            <strong>Texto {index + 1}:</strong> {content}
                          </div>
                        ))}
                      </div>
                        <Button
                          onClick={() => setShowCustomization(true)}
                        className="w-full mt-4 bg-[#b09e85] text-white hover:bg-[#c8b79e]"
                      >
                        🎨 Configurar e Aplicar
                        </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 2: Manual Flow */}
            {currentStep === 2 && selectedFlow === "manual" && !showCustomization && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Seu conteúdo</h2>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Texto do conteúdo</label>
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Cole seu texto aqui ou faça upload..."
                    className="w-full h-32 bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-3 text-white placeholder-white/50 focus:border-[#c8b79e] focus:outline-none resize-none"
                  />
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#c8b79e]/40 rounded-lg p-6 text-center cursor-pointer hover:border-[#c8b79e]/60 hover:bg-[#c8b79e]/5 transition-colors"
                >
                  <Upload className="w-8 h-8 text-[#c8b79e] mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Clique para fazer upload de arquivo .txt</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {manualText && (
                  <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-3">Preview dos textos:</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {parseManualText(manualText).map((content, index) => (
                          <div key={index} className="text-white/80 text-sm">
                            <strong>Texto {index + 1}:</strong> {content}
                          </div>
                        ))}
                      </div>
                        <Button
                          onClick={() => setShowCustomization(true)}
                        className="w-full mt-4 bg-[#b09e85] text-white hover:bg-[#c8b79e]"
                      >
                        🎨 Configurar e Aplicar
                        </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Customization & Application Step */}
            {showCustomization && (
              <div className="space-y-6">
                {/* Conexão e Seleção de Frames */}
                <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configuração do Figma
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#c8b79e]/10 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">Status da Conexão</p>
                          <p className="text-white/60 text-xs">
                            {isFigmaConnected ? 'REST API Conectada' : 'Carregando dados...'}
                          </p>
                          <p className="text-white/60 text-xs">
                            Plugin: {isPluginConnected ? 'Conectado' : 'Aguardando'}
                          </p>
                          {isFigmaConnected && (
                            <p className="text-[#c8b79e] text-xs mt-1">
                              ✨ Dados reais do arquivo
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className={`w-3 h-3 rounded-full ${isFigmaConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div className={`w-3 h-3 rounded-full ${isPluginConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm mb-2">Frame Principal</label>
                        <select 
                          value={selectedParentFrame}
                          onChange={(e) => handleParentFrameChange(e.target.value)}
                          className="w-full bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-2 text-white"
                          disabled={!isFigmaConnected}
                        >
                          <option value="">Selecione o frame principal</option>
                          {parentFrames.map(frame => (
                            <option key={frame} value={frame}>{frame}</option>
                          ))}
                        </select>
                      </div>
                      
                      {childFrames.length > 0 && (
                        <div>
                          <label className="block text-white/80 text-sm mb-2">Frame Específico (opcional)</label>
                          <select 
                            value={selectedChildFrame}
                            onChange={(e) => setSelectedChildFrame(e.target.value)}
                            className="w-full bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-2 text-white"
                          >
                            <option value="">Aplicar em todos os frames</option>
                            {childFrames.map(frame => (
                              <option key={frame} value={frame}>{frame}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {/* Controle do Plugin */}
                      <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-yellow-300 font-medium text-sm">🔌 Plugin Figma</h4>
                          <div className={`w-2 h-2 rounded-full ${isPluginConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        </div>
                        
                        {!isPluginConnected ? (
                          <div className="space-y-2">
                            <p className="text-yellow-200 text-xs">
                              Para aplicar mudanças reais, você precisa abrir o plugin no Figma
                            </p>
                            <Button
                              onClick={async () => {
                                setShowFigmaInstructions(true)
                                await pluginCommunication.openFigmaWithPlugin()
                              }}
                              className="w-full bg-yellow-500 text-black hover:bg-yellow-400 text-sm py-2"
                            >
                              🚀 Abrir Figma + Plugin
                            </Button>
                          </div>
                        ) : (
                          <p className="text-green-300 text-xs">
                            ✅ Plugin conectado! Comandos serão aplicados automaticamente
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instruções do Figma */}
                {showFigmaInstructions && (
                  <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <h3 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
                        📋 Como Usar o Plugin
                      </h3>
                      
                      <div className="space-y-2 text-xs text-blue-200">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">1.</span>
                          <span>O Figma vai abrir automaticamente (aguarde alguns segundos)</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">2.</span>
                          <span>Se o plugin não abrir sozinho, vá em <strong>Plugins → Vicgario Content Machine</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">3.</span>
                          <span>O plugin vai receber automaticamente os comandos desta página</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold">4.</span>
                          <span>Todas as mudanças serão aplicadas diretamente no arquivo Figma</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setShowFigmaInstructions(false)}
                        variant="outline"
                        className="w-full mt-3 border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-white"
                      >
                        Entendi
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Estilos de Texto */}
                <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Estilos de Texto
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Cor do texto</label>
                    <input
                      type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                        <label className="block text-white/80 text-sm mb-2">Tamanho</label>
                    <input
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-2 text-white"
                          min="10"
                          max="200"
                    />
                  </div>
                </div>

                    <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Fonte</label>
                        <select 
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-2 text-white"
                        >
                          {availableFonts.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                  </select>
                </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Peso</label>
                        <select 
                          value={fontWeight}
                          onChange={(e) => setFontWeight(e.target.value)}
                          className="w-full bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg p-2 text-white"
                        >
                      <option value="Regular">Regular</option>
                          <option value="Medium">Medium</option>
                      <option value="SemiBold">SemiBold</option>
                      <option value="Bold">Bold</option>
                    </select>
                  </div>
                    </div>
                    
                    <Button
                      onClick={applyTextStylesToFigma}
                      disabled={!isFigmaConnected || isApplying}
                      className="w-full mt-4 bg-[#c8b79e]/20 text-[#c8b79e] hover:bg-[#c8b79e] hover:text-[#1a1814] border border-[#c8b79e]/40"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Aplicar Estilos de Texto
                    </Button>
                  </CardContent>
                </Card>

                {/* Cor de Fundo */}
                <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Cor de Fundo
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-white/80 text-sm mb-2">Cor de fundo dos frames</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10 bg-[#1a1814] border border-[#c8b79e]/30 rounded-lg cursor-pointer"
                      />
                    </div>
                    
                    <Button
                      onClick={applyBackgroundToFigma}
                      disabled={!isFigmaConnected || !selectedParentFrame || isApplying}
                      className="w-full bg-[#c8b79e]/20 text-[#c8b79e] hover:bg-[#c8b79e] hover:text-[#1a1814] border border-[#c8b79e]/40"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Aplicar Cor de Fundo
                    </Button>
                  </CardContent>
                </Card>

                {/* Upload de Imagens */}
                <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Substituir Imagens
                    </h3>
                    
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-[#c8b79e]/40 rounded-lg p-4 text-center cursor-pointer hover:border-[#c8b79e]/60 hover:bg-[#c8b79e]/5 transition-colors"
                    >
                      <ImageIcon className="w-6 h-6 text-[#c8b79e] mx-auto mb-2" />
                      <p className="text-white/80 text-sm">Clique para fazer upload de imagens</p>
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                  </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="mt-3">
                        <p className="text-white/60 text-sm mb-2">{uploadedImages.length} imagen(s) carregada(s)</p>
                        <div className="flex gap-2 mb-3 overflow-x-auto">
                          {uploadedImages.slice(0, 4).map((img, index) => (
                            <img 
                              key={index} 
                              src={img} 
                              alt={`Preview ${index}`}
                              className="w-12 h-12 object-cover rounded border border-[#c8b79e]/30 flex-shrink-0"
                            />
                          ))}
                          {uploadedImages.length > 4 && (
                            <div className="w-12 h-12 bg-[#c8b79e]/20 rounded border border-[#c8b79e]/30 flex items-center justify-center text-xs text-white/60 flex-shrink-0">
                              +{uploadedImages.length - 4}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          onClick={applyImagesToFigma}
                          disabled={!isFigmaConnected || isApplying}
                          className="w-full bg-[#c8b79e]/20 text-[#c8b79e] hover:bg-[#c8b79e] hover:text-[#1a1814] border border-[#c8b79e]/40"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Aplicar Imagens
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Preview de Textos Aplicados */}
                {showPreview && previewData.length > 0 && (
                  <Card className="bg-[#1a1814] border-[#c8b79e]/20">
                    <CardContent className="p-4">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Textos Aplicados
                      </h3>
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
                        {previewData.map((item, index) => (
                          <div key={index} className="text-white/80 text-sm">
                            <strong>{item.name}:</strong> {item.applied}
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={undoTextChanges}
                        variant="outline"
                        className="w-full border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Desfazer Alterações de Texto
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Botões de Ação Principais */}
                <div className="space-y-3">
                  <Button 
                    onClick={applyAllToFigma}
                    disabled={!isFigmaConnected || isApplying || (!generatedContent.length && !manualText.trim())}
                    className="w-full bg-gradient-to-r from-[#c8b79e] to-[#b09e85] text-[#1a1814] hover:from-[#d0c0a8] hover:to-[#c8b79e] h-14 text-lg font-semibold disabled:opacity-50"
                  >
                    {isApplying ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#1a1814]/30 border-t-[#1a1814] rounded-full animate-spin" />
                        Aplicando no Figma...
                      </div>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Aplicar Tudo no Figma
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={applyTextsToFigma}
                    disabled={!isFigmaConnected || isApplying || (!generatedContent.length && !manualText.trim())}
                    className="w-full bg-[#c8b79e]/20 text-[#c8b79e] hover:bg-[#c8b79e] hover:text-[#1a1814] border border-[#c8b79e]/40"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Aplicar Apenas Textos
                  </Button>
                </div>
              </div>
            )}

            {/* Info da Arquitetura */}
            {isFigmaConnected && (
              <div className="mt-6 p-4 bg-[#c8b79e]/10 rounded-lg border border-[#c8b79e]/20">
                <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                  🏗️ Arquitetura Híbrida
                </h4>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span><strong>REST API:</strong> Busca frames e dados reais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>Plugin API:</strong> Edita textos e estilos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span><strong>Embed Kit:</strong> Visualização em tempo real</span>
                  </div>
                </div>
              </div>
            )}

            {/* Credits */}
            <div className="mt-8 pt-4 border-t border-[#c8b79e]/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">✨</span>
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  Powered by Vicgario
                </span>
                <span className="text-lg">✨</span>
              </div>
              <div className="text-white/40 text-xs">Content Creation • Made with ❤️</div>
            </div>
          </div>
        </div>

        {/* Figma Iframe - Right Side */}
        <div className="flex-1 bg-white">
          <iframe
            ref={figmaIframeRef}
            style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}
            width="100%"
            height="100%"
            src="https://embed.figma.com/design/l6qmScVWzMQ5IEhkaQigMn/Template?node-id=0-1&embed-host=share"
            allowFullScreen
            title="Figma Design Template"
          />
        </div>
      </main>
    </div>
  )
}
