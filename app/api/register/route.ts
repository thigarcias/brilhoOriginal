import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formData, cachedData } = body

    const supabaseUrl = process.env.SUPABASE_URL ||
      "https://znkfwlpgsxxawucacmda.supabase.co"
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseKey) {
      console.error("Supabase key not configured")
      return NextResponse.json(
        { error: "Supabase key não configurada" },
        { status: 500 }
      )
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

    if ((!updateData.email || !updateData.telefone) && cachedData?.answers) {
      try {
        const contact = JSON.parse(cachedData.answers[9] || "{}")
        if (!updateData.email) updateData.email = contact.email || null
        if (!updateData.telefone) updateData.telefone = contact.phone || null
      } catch {
        /* ignore parse errors */
      }
    }

    if (cachedData?.analysis) {
      updateData.diagnostico = cachedData.analysis
    }
    if (cachedData?.answers) {
      cachedData.answers.forEach((ans: string, idx: number) => {
        updateData[`resposta_${idx + 1}`] = ans || null
      })
    }

    const { data: existing, error: selectError } = await supabase
      .from("brandplot")
      .select("id")
      .eq("nome_empresa", companyName)
      .maybeSingle()

    if (selectError) {
      console.error("Erro ao buscar registro:", selectError.message)
      return NextResponse.json(
        { error: "Erro ao verificar registro" },
        { status: 500 }
      )
    }

    let dbError

    if (existing) {
      const { error } = await supabase
        .from("brandplot")
        .update(updateData)
        .eq("id", existing.id)

      dbError = error
    } else {
      const insertData = { nome_empresa: companyName, ...updateData }
      const { error } = await supabase.from("brandplot").insert(insertData)
      dbError = error
    }

    if (dbError) {
      console.error("Erro ao salvar registro:", dbError.message)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Erro no registro" }, { status: 500 })
  }
}
