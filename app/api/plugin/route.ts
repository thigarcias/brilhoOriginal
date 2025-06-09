import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_FIGMA_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { tipo, conteudo, configuracao } = await req.json();

    let prompt = '';
    
    // Definindo diferentes tipos de conteúdo que o plugin pode gerar
    switch (tipo) {
      case 'carrossel':
        prompt = `
Crie um conteúdo de carrossel no Instagram com 17 blocos sobre o tema: "${conteudo}".
Retorne os blocos no formato:
texto 1 - ...
texto 2 - ...
...
texto 17 - ...
Apenas os blocos. Sem hashtags ou observações extras.
`;
        break;
        
      case 'post':
        prompt = `
Crie um post completo para Instagram sobre: "${conteudo}".
Inclua:
- Texto principal engajante
- Call-to-action
- 5 hashtags relevantes
Formato: um post conciso e atrativo.
`;
        break;
        
      case 'stories':
        prompt = `
Crie 5 ideias de stories para Instagram sobre: "${conteudo}".
Retorne no formato:
Story 1: ...
Story 2: ...
Story 3: ...
Story 4: ...
Story 5: ...
Cada story deve ter um texto curto e engajante.
`;
        break;
        
      case 'legenda':
        prompt = `
Crie uma legenda criativa e engajante para Instagram sobre: "${conteudo}".
A legenda deve:
- Ser interessante e chamar atenção
- Incluir emojis relevantes
- Ter um call-to-action
- Incluir 3-5 hashtags
`;
        break;
        
      default:
        prompt = `
Crie conteúdo para redes sociais sobre: "${conteudo}".
Tipo de conteúdo: ${tipo || 'geral'}
Seja criativo e engajante.
`;
    }

    const completion = await openai.chat.completions.create({
      model: configuracao?.modelo || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: configuracao?.temperatura || 0.7,
      max_tokens: configuracao?.maxTokens || 1000
    });

    const textoGerado = completion.choices[0].message.content;
    
    // Verificação de segurança
    if (!textoGerado) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Nenhum conteúdo foi gerado',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    // Processamento específico baseado no tipo
    let resultado;
    
    if (tipo === 'carrossel') {
      const blocos = textoGerado
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.toLowerCase().startsWith('texto'));
      resultado = { blocos, textoCompleto: textoGerado };
    } else if (tipo === 'stories') {
      const stories = textoGerado
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.toLowerCase().startsWith('story'));
      resultado = { stories, textoCompleto: textoGerado };
    } else {
      resultado = { conteudo: textoGerado };
    }

    return NextResponse.json({
      sucesso: true,
      tipo,
      resultado,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ ERRO DETALHADO:', error?.response?.data || error.message || error);
    
    return NextResponse.json(
      {
        sucesso: false,
        erro: 'Erro ao gerar conteúdo',
        detalhe: error?.response?.data || error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 