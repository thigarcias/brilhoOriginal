import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formData, cachedData } = body
    const supabaseUrl = "https://znkfwlpgsxxawucacmda.supabase.co"
    const supabaseKey = process.env.SUPABASE_KEY
    if (!supabaseKey) {
      return NextResponse.json({ error: "Supabase key não configurada" }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey as string)

    const companyName = formData.companyName || cachedData?.companyName

    if (!companyName) {
      return NextResponse.json({ error: "Nome da empresa é obrigatório" }, { status: 400 })
    }

    // Atualiza o registro existente da empresa
    const updateData: any = {
      nome_cliente: formData.name || null,
      email: formData.email || null,
      telefone: formData.phone || null,
      senha: formData.password || null,
    }

    if (cachedData?.analysis) {
      updateData.diagnostico = cachedData.analysis
    }
    if (cachedData?.answers) {
      cachedData.answers.forEach((ans: string, idx: number) => {
        updateData[`resposta_${idx + 1}`] = ans || null
      })
    }

    const { error } = await supabase
      .from("brandplot")
      .update(updateData)
      .eq("nome_empresa", companyName)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Erro no registro" }, { status: 500 })
  }
}
