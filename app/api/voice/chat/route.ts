import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, companyData, companyName } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não fornecida' },
        { status: 400 }
      )
    }

    // Prompt especializado e otimizado para branding da BrandPlot
    const systemPrompt = `Você é um consultor especialista em branding e estratégia de marca da BrandPlot, uma das principais consultorias de branding do Brasil. Você está conversando por voz com um empresário em tempo real.

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

Você é o consultor que o empresário deseja ter ao lado para fortalecer sua marca e escalar o negócio. `

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 400, // Limitado para manter respostas concisas para voz
      temperature: 0.7,
    })

    const assistantResponse = completion.choices[0]?.message?.content

    if (!assistantResponse) {
      return NextResponse.json(
        { success: false, error: 'Erro ao gerar resposta' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      text: assistantResponse
    })

  } catch (error) {
    console.error('Erro no endpoint de chat:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 