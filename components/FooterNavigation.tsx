"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const sections = [
  { id: "/", title: "Home" },   
  { id: "/logo", title: "Logo" },
  { id: "/colors", title: "Colors" },
  { id: "/typography", title: "Typography" },
  { id: "/imagery", title: "Imagery" },
  { id: "/tone", title: "Tone of voice" },
  { id: "/download", title: "Download" },
]

export function FooterNavigation() {
  const pathname = usePathname()
  const cleanPath = pathname.replace(/^\/dashboard/, "") || "/"
  const currentIndex = sections.findIndex((s) => s.id === cleanPath)
  const previousSection = currentIndex > 0 ? sections[currentIndex - 1] : null
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null

  return (
    <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#c8b79e]/20">
      {previousSection ? (
        <Link href={`/dashboard${previousSection.id}`} className="flex flex-col items-start text-left group">
          <span className="text-white/60 text-sm">Anterior</span>
          <span className="text-white font-medium group-hover:text-[#c8b79e] transition-colors">
            {previousSection.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextSection ? (
        <Link href={`/dashboard${nextSection.id}`} className="flex flex-col items-end text-right group">
          <span className="text-white/60 text-sm">Próximo</span>
          <span className="text-white font-medium group-hover:text-[#c8b79e] transition-colors">
            {nextSection.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
