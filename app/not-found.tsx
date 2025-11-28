'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a0f] to-[#0d1f12] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* 404 Number */}
        <h1 className="text-[150px] md:text-[200px] font-bold text-brand-green/20 leading-none select-none">
          404
        </h1>

        {/* Message */}
        <div className="-mt-8 md:-mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Страницата не е намерена
          </h2>
          <p className="text-gray-400 mb-8">
            Съжаляваме, но страницата, която търсите, не съществува или е била преместена.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Начална страница
          </Link>

          <Link
            href="/learn"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/20"
          >
            <Search className="w-5 h-5" />
            Научи повече
          </Link>
        </div>

        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="mt-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Върни се назад
        </button>
      </div>
    </div>
  )
}
