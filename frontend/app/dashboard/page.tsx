/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, BrainCircuit, X, PlusCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getDashboardData } from './actions'

export default function DashboardPage() {
  const [tutorialStep, setTutorialStep] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        setSuccessMsg(true)
        window.history.replaceState({}, '', '/dashboard')
        setTimeout(() => setSuccessMsg(false), 5000)
      }

      const tutorialSeen = localStorage.getItem('tutorial_completed')
      if (!tutorialSeen) {
        setTutorialStep(1)
      }
    }
    
    // Fetch data
    getDashboardData().then((res) => {
      if (res?.transactions) {
        setTransactions(res.transactions)
      }
      setLoading(false)
    })
  }, [])

  function skipTutorial() {
    setTutorialStep(0)
    localStorage.setItem('tutorial_completed', 'true')
  }

  function nextStep() {
    if (tutorialStep === 4) {
      skipTutorial()
    } else {
      setTutorialStep(s => s + 1)
    }
  }

  // Cálculos básicos
  const saldo = transactions.reduce((acc, t) => acc + (t.type === 'INCOME' ? t.amount : -t.amount), 0)
  const receitas = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
  const despesas = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)

  // Gráficos - Dados
  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
  const pieData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a,b) => b.value - a.value);
    
  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

  const transactionsByDate = [...transactions]
    .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
    .reduce((acc, t) => {
      // Pega apenas o dia e mês para ficar curto no gráfico (ex: "24/05")
      const dateObj = new Date(t.transaction_date)
      const date = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
      
      if (!acc[date]) {
        acc[date] = { name: date, Receitas: 0, Despesas: 0 };
      }
      if (t.type === 'INCOME') acc[date].Receitas += t.amount;
      if (t.type === 'EXPENSE') acc[date].Despesas += t.amount;
      return acc;
    }, {} as Record<string, { name: string, Receitas: number, Despesas: number }>);
    
  const barData = Object.values(transactionsByDate);

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

      {tutorialStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={skipTutorial}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              {tutorialStep === 1 && (
                <div className="text-center animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo ao Financer.ia!</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Mais que um aplicativo de finanças, um conselheiro IA. O Gemini analisa seus hábitos, 
                    hobbies e metas para dar dicas reais de onde economizar sem cortar o que você ama.
                  </p>
                </div>
              )}

              {tutorialStep === 2 && (
                <div className="text-center animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Contas e Cartões</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Comece acessando o menu &quot;Contas e Cartões&quot;. Cadastre seus bancos e vincule seus cartões 
                    de crédito ou débito a eles para saber exatamente de onde seu dinheiro está saindo.
                  </p>
                </div>
              )}

              {tutorialStep === 3 && (
                <div className="text-center animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlusCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Transações e Privacidade</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Sempre que gastar ou receber, adicione uma transação! Pode detalhar o motivo à vontade, 
                    pois nós <strong>criptografamos</strong> todas as descrições no banco de dados para a sua privacidade.
                  </p>
                </div>
              )}

              {tutorialStep === 4 && (
                <div className="text-center animate-in slide-in-from-right-4 duration-300">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Relatórios e Dicas</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Depois de usar por um tempo, confira a aba de Relatórios! Nela você acompanha seus gastos por conta 
                    e por categoria, e recebe as dicas valiosas da IA de onde otimizar seus custos.
                  </p>
                </div>
              )}

              <div className="mt-10 flex items-center justify-between">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(step => (
                    <div 
                      key={step} 
                      className={`h-2 rounded-full transition-all duration-300 ${tutorialStep === step ? 'w-8 bg-black' : 'w-2 bg-gray-200'}`}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <button onClick={skipTutorial} className="text-sm font-medium text-gray-500 hover:text-gray-900">
                    Pular
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    {tutorialStep === 4 ? 'Começar' : 'Próximo'}
                    {tutorialStep !== 4 && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos / Resumo */}
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
          ) : !loading ? (
            <>
              {/* Gráficos */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Despesas por Categoria */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Despesas por Categoria</h3>
                  {pieData.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">Sem despesas registradas</div>
                  )}
                </div>

                {/* Fluxo de Caixa (Barras) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Fluxo de Caixa Mensal</h3>
                  {barData.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value}`}
                          />
                          <RechartsTooltip 
                            formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                            cursor={{ fill: '#f9fafb' }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">Sem dados para exibir</div>
                  )}
                </div>
              </div>

              {/* Lista de Transações Recentes */}
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
            </>
          ) : null}
    </div>
  )
}
