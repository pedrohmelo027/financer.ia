'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, BrainCircuit, X, PlusCircle } from 'lucide-react'
import { getDashboardData } from './actions'

export default function DashboardPage() {
  const [showTutorial, setShowTutorial] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    // Check URL for success param (doing it this way avoids Next.js Suspense warnings)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        setSuccessMsg(true)
        window.history.replaceState({}, '', '/dashboard') // Remove o parâmetro da URL
        setTimeout(() => setSuccessMsg(false), 5000) // Some depois de 5s
      }
    }

    const tutorialSeen = sessionStorage.getItem('tutorial_seen')
    if (tutorialSeen) {
      setShowTutorial(false)
    }
    
    // Fetch data
    getDashboardData().then((res) => {
      if (res?.transactions) {
        setTransactions(res.transactions)
      }
      setLoading(false)
    })
  }, [])

  function closeTutorial() {
    setShowTutorial(false)
    sessionStorage.setItem('tutorial_seen', 'true')
  }

  // Cálculos básicos
  const saldo = transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0)
  const receitas = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
  const despesas = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-medium">Transação registrada com sucesso!</span>
          </div>
          <button onClick={() => setSuccessMsg(false)} className="text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Visão Geral</h1>
      </div>

      {showTutorial && (
        <div className="bg-gradient-to-r from-gray-900 to-black text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
          
          <button 
            onClick={closeTutorial}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-2xl relative z-10">
            <div className="flex items-center gap-2 text-blue-400 font-medium mb-3">
              <Sparkles className="w-5 h-5" />
              <span>Bem-vindo ao seu Conselheiro Financeiro IA</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Como o Financer.ia funciona?</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Diferente de outros aplicativos, não vamos apenas mostrar gráficos. Nossa IA (Google Gemini) analisa seus gastos considerando seus <strong>hobbies</strong> e <strong>metas</strong> para sugerir cortes sem tirar o que você ama.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">1. Registre</h3>
                <p className="text-sm text-gray-400">Adicione suas despesas e receitas.</p>
              </div>
              <div>
                <div className="bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg mb-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">2. Privacidade</h3>
                <p className="text-sm text-gray-400">Suas descrições são criptografadas (Fernet) antes de salvar.</p>
              </div>
              <div>
                <div className="bg-white/10 w-10 h-10 flex items-center justify-center rounded-lg mb-3">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">3. Receba Dicas</h3>
                <p className="text-sm text-gray-400">A IA cruza dados e te diz como atingir suas metas.</p>
              </div>
            </div>

            <Link 
              href="/dashboard/transactions/new"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Registrar primeira transação
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Gráficos / Resumo */}
      {!showTutorial && (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Saldo Atual</h3>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Receitas</h3>
              <p className="text-3xl font-bold text-green-600">
                + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitas)}
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Despesas</h3>
              <p className="text-3xl font-bold text-red-600">
                - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesas)}
              </p>
            </div>
          </div>

          {!loading && transactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-8">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Comece registrando suas compras, contas e salários para que a Inteligência Artificial possa começar a trabalhar a seu favor.
              </p>
              <Link 
                href="/dashboard/transactions/new"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Adicionar Transação
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Suas Transações</h3>
                <Link 
                  href="/dashboard/transactions/new"
                  className="inline-flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nova
                </Link>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Carregando...</p>
                ) : (
                  transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{t.category}</p>
                        <p className="text-sm text-gray-500">{t.description || "Sem descrição"} • {t.transaction_date}</p>
                      </div>
                      <div className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}
