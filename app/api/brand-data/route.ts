import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const idUnico = url.searchParams.get('idUnico')

    if (!idUnico) {
      return NextResponse.json(
        { error: "idUnico é obrigatório" },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://znkfwlpgsxxawucacmda.supabase.co"
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseKey) {
      console.error("Supabase key not configured")
      return NextResponse.json(
        { error: "Configuração do servidor indisponível" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey as string)

    // Busca os dados da marca pelo idUnico
    const { data, error } = await supabase
      .from("brandplot")
      .select("*")
      .eq("idUnico", idUnico)
      .single()

    if (error) {
      console.error("Erro ao buscar dados da marca:", error)
      return NextResponse.json(
        { error: "Erro ao buscar dados da marca" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Marca não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data 
    })

  } catch (err: any) {
    console.error("Erro na API brand-data:", err)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
