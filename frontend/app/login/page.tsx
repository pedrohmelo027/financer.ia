'use client'

import { useState, useEffect } from 'react'
import { loginAction } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('expired') === 'true') {
        setError('Sua sessão expirou. Por favor, faça login novamente.')
        window.history.replaceState({}, '', '/login')
      }
    }
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await loginAction(formData)
    
    // Se a Server Action retornar um erro (o redirect lançaria uma exceção que o Next.js gerencia)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bem-vindo de volta</h1>
          <p className="text-sm text-gray-500 mt-2">Acesse sua conta para continuar</p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:opacity-50 disabled:bg-gray-50 outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors disabled:opacity-50 disabled:bg-gray-50 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between pb-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-black shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-50 focus:ring-offset-0" />
              <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
            </label>
            <Link href="#" className="text-sm font-medium text-black hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-medium text-black hover:underline">
            Crie agora
          </Link>
        </p>
      </div>
    </div>
  )
}

