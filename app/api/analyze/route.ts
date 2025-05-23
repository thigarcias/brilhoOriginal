import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    console.log("API route called")

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Request body parsed:", { answersCount: body.answers?.length })
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
      console.log("OpenAI client initialized")
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

    // Monta o objeto para o banco
    let contact = { phone: null, email: null }
    let contatoString = ''
    try {
      if (answers[9]) {
        contact = JSON.parse(answers[9])
        if (contact.phone && contact.email) {
          contatoString = `${contact.phone} ${contact.email}`
        } else if (contact.phone) {
          contatoString = contact.phone
        } else if (contact.email) {
          contatoString = contact.email
        }
      }
    } catch {}
    const dbData = {
      nome_empresa: answers[0] || null,
      resposta_1: answers[1] || null,
      resposta_2: answers[2] || null,
      resposta_3: answers[3] || null,
      resposta_4: answers[4] || null,
      resposta_5: answers[5] || null,
      resposta_6: answers[6] || null,
      resposta_7: answers[7] || null,
      resposta_8: answers[8] || null,
      contato: contatoString || null,
      botao_recomecar: null,
      botao_wpp: null,
    }
    const supabasePromise = supabase.from("company_responses").insert([dbData])

    try {
      console.log("Making OpenAI API call...")

      // Use Promise.all para rodar Supabase e OpenAI juntos
      const [supabaseResult, completion] = await Promise.all([
        supabasePromise,
        openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "Você é um especialista em branding e análise de marca com mais de 15 anos de experiência. Sua especialidade é criar diagnósticos profundos e actionables para marcas de todos os tamanhos.",
            },
            {
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
10. Contato informado: Celular: ${contact.phone || "Não informado"}, E-mail: ${contact.email || "Não informado"}

Por favor, forneça uma análise detalhada da marca em português com as seguintes seções:

🧭 Diagnóstico Profundo da Marca — ${answers[0] || "Sua Marca"}
🏁 Nota de Clareza & Emoção da Marca: [X]/100
[Explicação da nota]

🔍 Diagnóstico da Marca Atual

🎯 Essência da Marca
[Análise da essência]

🧬 Promessa Central
[Análise da promessa central]

👥 Público Ideal vs. Atual
[Comparação entre público ideal e atual]

📍 Percepção Atual
[Como a marca é percebida atualmente]

🧠 Insight-chave para Reposicionamento
[Principais insights e recomendações]

Use emojis e formatação clara. Seja específico e actionable nas recomendações.`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      ])

      console.log("OpenAI API call successful")

      const analysis = completion.choices[0]?.message?.content

      if (!analysis) {
        console.error("No analysis content received from OpenAI")
        return NextResponse.json({ error: "No analysis generated" }, { status: 500 })
      }

      console.log("Analysis generated successfully")
      return NextResponse.json({ analysis })
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
