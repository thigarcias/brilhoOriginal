import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

// Função assíncrona para buscar contexto da empresa usando Responses API
async function fetchCompanyContext(companyName: string, idUnico: string, supabase: any) {
  try {
    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log(`Buscando contexto para empresa: ${companyName}`);

    // Usar a SDK oficial do OpenAI para Responses API
    const response = await openai.responses.create({
      model: "gpt-4.1", // Modelo correto
      tools: [{
        type: "web_search_preview",
        search_context_size: "medium" 
      }],
      input: `Você é um especialista em análise de marcas e empresas. Pesquise informações atualizadas sobre a empresa "${companyName}" e crie um relatório de contexto abrangente incluindo:

1. **Visão geral da empresa e setor**: O que a empresa faz, em que setor atua, quando foi fundada
2. **Posicionamento de marca**: Como ela se posiciona no mercado, missão e valores  
3. **Público-alvo**: Quem são seus clientes típicos
4. **Principais concorrentes**: Empresas similares no mercado
5. **Características do setor**: Tendências e desafios do mercado
6. **Presença digital**: Website, redes sociais, estratégia digital
7. **Notícias recentes**: Novidades, lançamentos, parcerias

**Importante**: Busque informações reais e atualizadas sobre esta empresa. Se não encontrar informações específicas, forneça uma análise baseada no nome e setor provável.`
    });

    // Extrair o contexto da resposta usando a estrutura correta
    let contexto = null;
    
    // Verificar se existe output_text diretamente na resposta
    if ((response as any).output_text) {
      contexto = (response as any).output_text;
    } else if (response.output && Array.isArray(response.output)) {
      // Procurar por mensagem do assistente no array de output
      const messageOutput = response.output.find((output: any) => 
        output.type === 'message' && output.role === 'assistant'
      );
      
      if (messageOutput && (messageOutput as any).content && Array.isArray((messageOutput as any).content)) {
        // Encontrar o conteúdo de texto na mensagem
        const textContent = (messageOutput as any).content.find((content: any) => 
          content.type === 'output_text' && content.text
        );
        
        if (textContent && textContent.text) {
          contexto = textContent.text;
        }
      }
    }
    
    if (contexto) {
      console.log("Contexto extraído com sucesso, atualizando no Supabase...");
      
      // Atualizar o registro no Supabase com o contexto obtido
      const { error: updateError } = await supabase
        .from("brandplot")
        .update({ contexto: contexto })
        .eq("idUnico", idUnico);

      if (updateError) {
        console.error("Erro ao atualizar contexto no Supabase:", updateError);
      } else {
        console.log("Contexto salvo com sucesso no Supabase");
      }
    } else {
      console.error("Não foi possível extrair o contexto da resposta");
      console.log("Estrutura da resposta:", JSON.stringify(response, null, 2));
    }

  } catch (error) {
    console.error("Erro na busca de contexto da empresa:", error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error("Mensagem do erro:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { answers } = body

    // Validate answers
    if (!answers || !Array.isArray(answers)) {
      console.error("Invalid answers format:", answers)
      return NextResponse.json({ error: "Answers must be an array" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Initialize the OpenAI client
    let openai
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } catch (initError) {
      console.error("Error initializing OpenAI client:", initError)
      return NextResponse.json({ error: "Failed to initialize OpenAI client" }, { status: 500 })
    }

    const supabaseUrl = "https://znkfwlpgsxxawucacmda.supabase.co"
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseKey) {
      console.error("Supabase key não configurada")
      return NextResponse.json({ error: "Supabase key não configurada" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey as string)

    // Gera o idUnico baseado no nome da empresa
    const generateIdUnico = (nomeEmpresa: string): string => {
      if (!nomeEmpresa) {
        return `empresa-${Date.now()}-brandplot`
      }

      const cleanName = nomeEmpresa
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '') // Remove todos os espaços
        .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais, mantém só letras e números

      return `${cleanName}-brandplot`
    }

    // Monta o objeto para o banco
    let contact = { phone: null, email: null }
    try {
      if (answers[9]) {
        contact = JSON.parse(answers[9])
      }
    } catch { }

    const idUnico = generateIdUnico(answers[0])

    const dbData = {
      nome_empresa: answers[0] || null,
      idUnico: idUnico,
      resposta_1: answers[1] || null,
      resposta_2: answers[2] || null,
      resposta_3: answers[3] || null,
      resposta_4: answers[4] || null,
      resposta_5: answers[5] || null,
      resposta_6: answers[6] || null,
      resposta_7: answers[7] || null,
      resposta_8: answers[8] || null,
      telefone: contact.phone || null,
      email: contact.email || null,
      scoreDiagnostico: null as string | null,
      contexto: null as string | null
    }
    try {
      // Preparar conteúdo da mensagem para Chat Completions (suporta visão)
      let messageContent: any[] = [{
        type: "text",
        text: `Analise esta marca com base nas seguintes respostas:

1. Nome da empresa: ${answers[0] || "Não informado"}
2. O que te motivou a criar essa marca? ${answers[1] || "Não informado"}
3. Se sua marca fosse uma pessoa, como ela falaria? ${answers[2] || "Não informado"}
4. O que sua marca entrega que outras não conseguem? ${answers[3] || "Não informado"}
5. Quem é o cliente ideal para você? ${answers[4] || "Não informado"}
6. Hoje, quem mais compra de você? (é o público ideal?) ${answers[5] || "Não informado"}
7. Como você gostaria que sua marca fosse percebida? ${answers[6] || "Não informado"}
8. Em uma frase: "Minha marca existe para que as pessoas possam finalmente __________." ${answers[7] || "Não informado"}
10. Contato informado: Celular: ${contact.phone || "Não informado"}, E-mail: ${contact.email || "Não informado"}`
      }]

      // Adicionar imagem se fornecida
      if (answers[8]) {
        try {
          const imageData = JSON.parse(answers[8])
          if (imageData.base64 && imageData.type) {
            messageContent.push({
              type: "image_url",
              image_url: {
                url: imageData.base64,
                detail: "high"
              }
            })
            
            // Adicionar contexto sobre a imagem no texto
            messageContent[0].text += `\n\n9. ANÁLISE DO INSTAGRAM: Analise detalhadamente a imagem do perfil do Instagram fornecida. Examine a bio, feed visual, destaques e qualquer elemento visível para entender melhor o posicionamento atual da marca e como ela se apresenta nas redes sociais.`
          }
        } catch (error) {
          console.log("Erro ao processar imagem, continuando sem ela:", error)
          messageContent[0].text += `\n\n9. Instagram screenshot: Fornecido mas não pôde ser processado`
        }
      } else {
        messageContent[0].text += `\n\n9. Instagram screenshot: Não fornecido`
      }

      // Usar Chat Completions com GPT-4 Vision para suportar análise de imagens
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Modelo que suporta visão
        messages: [
          {
            role: "system",
            content: `Você é um consultor especialista em branding, posicionamento e construção de comunidade. Seu papel é diagnosticar marcas com base na sua essência emocional e ajudar os fundadores a reposicionar sua mensagem, promessa e presença de forma clara, humana e envolvente — fazendo com que os consumidores enxerguem a marca com o mesmo brilho que o criador enxergou ao fundá-la.

**SEU OBJETIVO PRINCIPAL**: Realizar uma análise de marca profunda e personalizada que revele insights valiosos sobre a marca do cliente, oferecendo direcionamentos claros e práticos.

**ESTRUTURA DO DIAGNÓSTICO**: 

🔥 **SUMÁRIO EXECUTIVO (2-3 linhas)**
- Síntese da situação atual da marca em uma linguagem direta e empática

🎯 **ANÁLISE DE POSICIONAMENTO**
- **Propósito Central**: O que realmente move esta marca
- **Diferencial Único**: O que a torna especial no mercado
- **Personalidade da Marca**: Como ela se manifesta no mundo

👥 **ANÁLISE DE PÚBLICO**
- **Perfil do Cliente Ideal vs. Atual**: Gaps identificados
- **Conexão Emocional**: Como a marca se conecta com as pessoas
- **Oportunidades de Engajamento**: Onde pode melhorar

📊 **DIAGNÓSTICO ESTRATÉGICO**
- **Pontos Fortes**: O que já funciona bem
- **Desafios Identificados**: O que precisa ser trabalhado
- **Lacunas de Comunicação**: Onde a mensagem pode ser mais clara

🚀 **RECOMENDAÇÕES ESTRATÉGICAS**
- 3-4 ações práticas e específicas para fortalecer a marca
- Sugestões de melhorias na comunicação e posicionamento
- Dicas para melhor conexão com o público-alvo

🏁 **Nota de Clareza & Emoção da Marca: X/100**
- Justificativa da nota baseada na clareza do posicionamento e força emocional

**INSTRUÇÕES ESPECÍFICAS**:
- Use uma linguagem acessível, mas profissional
- Seja específico e prático nas recomendações
- Demonstre empatia e compreensão pela jornada do empreendedor
- Quando uma imagem do Instagram for fornecida, analise detalhadamente os elementos visuais, bio, feed e qualquer informação visível para enriquecer o diagnóstico
- Base sua análise tanto nas respostas quanto nos elementos visuais da imagem (se disponível)
- Ofereça insights que só um especialista conseguiria identificar
- Termine sempre com a nota de 0 a 100`
          },
          {
            role: "user",
            content: messageContent
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })

      const analysis = completion.choices[0]?.message?.content

      if (!analysis) {
        console.error("No analysis content received from OpenAI Assistant")
        return NextResponse.json({ error: "No analysis generated" }, { status: 500 })
      }

      // Extrair o score do texto da análise
      let scoreDiagnostico = null;
      if (analysis) {
        
        // Múltiplos padrões para capturar diferentes formatos de score
        const scorePatterns = [
          /🏁\s*Nota de Clareza & Emoção da Marca:\s*(\d+)/i,
          /Nota de Clareza & Emoção da Marca:\s*(\d+)\/100/i,
          /Nota de Clareza & Emoção da Marca:\s*(\d+)/i,
          /Nota de Clareza.*?:\s*(\d+)\/100/i,
          /Nota de Clareza.*?:\s*(\d+)/i,
          /Score.*?:\s*(\d+)\/100/i,
          /Score.*?:\s*(\d+)/i,
          /Pontuação.*?:\s*(\d+)\/100/i,
          /Pontuação.*?:\s*(\d+)/i,
          /🏁.*?Nota.*?:\s*(\d+)\/100/i,
          /🏁.*?Nota.*?:\s*(\d+)/i,
          /🏁.*?(\d+)\/100/i,
          /🏁.*?(\d+)/i,
          /Diagnóstico.*?(\d+)\/100/i,
          /Diagnóstico.*?(\d+)/i,
          /Marca:\s*(\d+)\/100/i,
          /Marca:\s*(\d+)/i,
          /(\d+)\/100/g, // Padrão mais genérico como fallback
        ];
        
        for (const pattern of scorePatterns) {
          const scoreMatch = analysis.match(pattern);
          
          if (scoreMatch && scoreMatch[1]) {
            const extractedScore = parseInt(scoreMatch[1]);
            
            // Validar se o score está dentro do range esperado (0-100)
            if (extractedScore >= 0 && extractedScore <= 100) {
              scoreDiagnostico = extractedScore.toString();
              break;
            }
          }
        }
        
        if (!scoreDiagnostico) {
          // Tentativa final: procurar por qualquer número/100 no texto
          const allScores = analysis.match(/(\d+)\/100/g);
          
          if (allScores && allScores.length > 0) {
            // Tentar cada score encontrado
            for (const scoreText of allScores) {
              const scoreMatch = scoreText.match(/(\d+)/);
              if (scoreMatch) {
                const scoreNumber = parseInt(scoreMatch[1]);
                
                if (scoreNumber >= 0 && scoreNumber <= 100) {
                  scoreDiagnostico = scoreNumber.toString();
                  break;
                }
              }
            }
          }
          
          // Se ainda não encontrou, tentar buscar números isolados que podem ser scores
          if (!scoreDiagnostico) {
            // Buscar números que aparecem sozinhos e podem ser scores
            const numbersOnly = analysis.match(/\b(\d{1,2})\b/g);
            
            if (numbersOnly) {
              for (const num of numbersOnly) {
                const number = parseInt(num);
                if (number >= 30 && number <= 100) { // Range mais realista para scores
                  scoreDiagnostico = number.toString();
                  break;
                }
              }
            }
          }
          
          // Se ainda não encontrou, definir um score padrão
          if (!scoreDiagnostico) {
            scoreDiagnostico = "0"; // Score padrão quando não conseguir extrair
          }
        }
      }

      // Atualizar o objeto dbData com o score extraído
      dbData.scoreDiagnostico = scoreDiagnostico;

      // Salvar no Supabase
      try {
        await supabase.from("brandplot").insert([dbData]);
      } catch (supabaseError) {
        console.error("Erro ao salvar no Supabase:", supabaseError);
        // Continua o fluxo mesmo com erro no Supabase
      }

      // Buscar contexto da empresa de forma assíncrona (não bloqueia a resposta)
      if (answers[0]) {
        fetchCompanyContext(answers[0], idUnico, supabase).catch(error => {
          console.error("Erro ao buscar contexto da empresa:", error);
        });
      }

      return NextResponse.json({
        analysis,
        idUnico: idUnico, // Inclui o idUnico na resposta para cache no frontend
        scoreDiagnostico: scoreDiagnostico // Inclui o score extraído na resposta
      })
    } catch (openaiError: any) {
      console.error("OpenAI API error:", {
        message: openaiError.message,
        type: openaiError.type,
        code: openaiError.code,
        status: openaiError.status,
      })

      // Return a more specific error based on the OpenAI error
      if (openaiError.status === 401) {
        return NextResponse.json({ error: "Invalid OpenAI API key" }, { status: 500 })
      } else if (openaiError.status === 429) {
        return NextResponse.json({ error: "OpenAI API rate limit exceeded" }, { status: 429 })
      } else {
        return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
      }
    }
  } catch (error: any) {
    console.error("General error in API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
