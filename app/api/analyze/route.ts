import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

// Função assíncrona para buscar contexto da empresa usando Responses API
async function fetchCompanyContext(companyName: string, idUnico: string, supabase: any) {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
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
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract content from the correct structure
    let contexto = null;
    if (data.output && Array.isArray(data.output)) {
      // Find the assistant message in the array
      const assistantMessage = data.output.find((output: any) => 
        output.role === 'assistant' && output.content && Array.isArray(output.content)
      );
      
      if (assistantMessage && assistantMessage.content) {
        // Get the text content from the assistant message
        const textContent = assistantMessage.content.find((content: any) => 
          content.type === 'output_text' && content.text
        );
        
        if (textContent && textContent.text) {
          contexto = textContent.text;
        }
      }
    }
    
    if (contexto) {
      // Atualizar o registro no Supabase com o contexto obtido
      const { error: updateError } = await supabase
        .from("brandplot")
        .update({ contexto: contexto })
        .eq("idUnico", idUnico);

      if (updateError) {
        console.error("Erro ao atualizar contexto no Supabase:", updateError);
      }
    }

  } catch (error) {
    console.error("Erro na busca de contexto da empresa:", error);
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
      // Criar uma thread
      const thread = await openai.beta.threads.create()

      // Criar mensagem na thread
      const message = await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Analise esta marca com base nas seguintes respostas:

1. Nome da empresa: ${answers[0] || "Não informado"}
2. O que te motivou a criar essa marca? ${answers[1] || "Não informado"}
3. Se sua marca fosse uma pessoa, como ela falaria? ${answers[2] || "Não informado"}
4. O que sua marca entrega que outras não conseguem? ${answers[3] || "Não informado"}
5. Quem é o cliente ideal para você? ${answers[4] || "Não informado"}
6. Hoje, quem mais compra de você? (é o público ideal?) ${answers[5] || "Não informado"}
7. Como você gostaria que sua marca fosse percebida? ${answers[6] || "Não informado"}
8. Em uma frase: \"Minha marca existe para que as pessoas possam finalmente __________.\" ${answers[7] || "Não informado"}
9. Instagram screenshot foi fornecido: ${answers[8] ? "Sim" : "Não"}
10. Contato informado: Celular: ${contact.phone || "Não informado"}, E-mail: ${contact.email || "Não informado"}`
      })

      // Executar o Assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: "asst_m1fio8b1sD3HyVL4KTBwbtzr"
      })

      // Aguardar a conclusão do run
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)

      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Aguarda 1 segundo
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id)
      }

      if (runStatus.status !== "completed") {
        console.error("Run não completou com sucesso:", runStatus.status)
        throw new Error(`Assistant run failed with status: ${runStatus.status}`)
      }

      // Recuperar as mensagens da thread
      const messages = await openai.beta.threads.messages.list(thread.id)
      const assistantMessage = messages.data.find(msg => msg.role === "assistant")

      if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== "text") {
        throw new Error("No valid response from assistant")
      }

      const analysis = assistantMessage.content[0].text.value

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
