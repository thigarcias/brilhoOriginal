import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, companyData, companyName, mode = 'voice', webSearchEnabled = false } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não fornecida' },
        { status: 400 }
      )
    }

    // Prompt especializado e otimizado para branding da BrandPlot
    const modeInstructions = mode === 'voice' 
      ? 'Você está conversando por voz com um empresário em tempo real. Seja conciso, direto e conversacional.'
      : 'Você está conversando por texto com um empresário. Pode ser mais detalhado e usar formatação se necessário.'

    const webSearchInstructions = webSearchEnabled 
      ? 'Você tem acesso à busca na web para informações atualizadas. Use quando necessário para fornecer dados recentes, tendências de mercado, exemplos de campanhas ou qualquer informação que possa estar desatualizada.'
      : ''

    const systemPrompt = `Você é um consultor especialista em branding e estratégia de marca da BrandPlot, uma das principais consultorias de branding do Brasil. ${modeInstructions} ${webSearchInstructions}

${companyData ? `
INFORMAÇÕES DA EMPRESA:
Nome: ${companyName}
Dados disponíveis: ${JSON.stringify(companyData, null, 2)}
` : `
EMPRESA EM ANÁLISE: ${companyName}
`}

PERFIL PROFISSIONAL:
• Mais de 15 anos de experiência em branding, identidade visual, posicionamento e estratégia  
• Especialista em psicologia do consumidor e comportamento de marca  
• Atuação com startups, PMEs e grandes corporações  
• Foco em resultados de negócio e crescimento sustentável  

ÁREAS DE ATUAÇÃO:
1. Identidade Visual: logo, paleta de cores, tipografia e elementos gráficos  
2. Posicionamento: diferenciação, proposta de valor e território de marca  
3. Estratégia: arquitetura de marca, portfólio e extensões  
4. Comunicação: tom de voz, messaging e personalidade  
5. Experiência: jornada do cliente e pontos de contato  
6. Análise: pesquisa de mercado, concorrência e personas  

METODOLOGIA DE RESPOSTA:
1. Reconhecer a pergunta com empatia  
2. Fornecer insights práticos e acionáveis  
3. Citar exemplos brasileiros ou casos de sucesso relevantes  
4. Sugerir próximos passos claros e realizáveis  
5. Finalizar com uma pergunta para aprofundar, quando pertinente  

DIRETRIZES IMPORTANTES:
• Sempre responda em português brasileiro  
• Mantenha o foco em impacto e resultados de negócio  
• Se houver falta de dados da empresa, solicite informações adicionais  
• Utilize frameworks e ferramentas reconhecidas no mercado  
• Seja consultivo e personalizado conforme o perfil do empresário  
${mode === 'voice' ? '• Mantenha respostas entre 2-4 frases para conversação fluida' : '• Pode fornecer respostas mais detalhadas quando necessário'}
${webSearchEnabled ? '• Quando usar busca na web, cite as fontes e indique que as informações são atualizadas' : ''}

Você é o consultor que o empresário deseja ter ao lado para fortalecer sua marca e escalar o negócio. `

    // Usar Responses API para melhor flexibilidade com web search
    const tools = webSearchEnabled ? [
      {
        type: "web_search_preview" as const,
        user_location: {
          type: "approximate" as const,
          country: "BR"
        },
        search_context_size: "medium" as const
      }
    ] : undefined

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      tools: tools,
      text: {
        format: {
          type: "text"
        }
      },
      max_output_tokens: mode === 'voice' ? 400 : 800,
      temperature: 0.7,
    })

    const assistantResponse = completion.output_text

    if (!assistantResponse) {
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar resposta' },
        { status: 500 }
      )
    }

    // Debug: Log da resposta completa para verificar estrutura
    console.log('WebSearch Debug (Responses API):', {
      webSearchEnabled,
      hasOutput: !!completion.output,
      outputLength: completion.output?.length,
      responsePreview: assistantResponse.substring(0, 200)
    })

    // Na Responses API, verificar se houve web search pelos output items
    const hasWebSearchCall = completion.output?.some((item: any) => 
      item.type === "web_search_call"
    )

    // Verificar se há anotações de URL nos output items de mensagem
    const hasUrlCitations = completion.output?.some((item: any) => 
      item.type === "message" && 
      item.content?.[0]?.annotations?.some((annotation: any) => 
        annotation.type === "url_citation"
      )
    )

    const webSearchUsed = webSearchEnabled && (hasWebSearchCall || hasUrlCitations)

    console.log('WebSearch Result (Responses API):', {
      webSearchEnabled,
      hasWebSearchCall,
      hasUrlCitations,
      webSearchUsed,
      outputItems: completion.output?.map((item: any) => item.type)
    })

    return NextResponse.json({
      success: true,
      text: assistantResponse,
      webSearchUsed: webSearchUsed
    })

  } catch (error) {
    console.error('Erro no endpoint de chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 