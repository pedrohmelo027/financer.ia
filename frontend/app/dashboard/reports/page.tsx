import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description?: string;
  transaction_date: string;
  payment_method_id?: string;
}

interface ReportSummary {
  total_incomes: number;
  total_expenses: number;
  current_balance: number;
  transactions_count: number;
  payment_methods_summary: {
    method_id: string;
    method_name: string;
    method_type: string;
    account_name: string;
    total_incomes: number;
    total_expenses: number;
    incomes_count: number;
    expenses_count: number;
  }[];
}

// Utilizando Server Component para carregar dados direto no servidor
export default async function ReportsPage() {
  const token = cookies().get('access_token')?.value
  
  if (!token) {
    redirect('/login')
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Busca paralela de Resumo (novo endpoint) e Histórico de Transações
  const [summaryRes, txRes] = await Promise.all([
    fetch(`${API_URL}/reports/summary`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    }),
    fetch(`${API_URL}/transactions/`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
  ])

  if (!summaryRes.ok || !txRes.ok) {
    return (
      <div className="p-8 text-center text-red-600">
        Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.
      </div>
    )
  }

  const summary: ReportSummary = await summaryRes.json()
  const transactions: Transaction[] = await txRes.json()

  // Mapa rápido apenas para exibir o nome do método no histórico de transações
  const methodMap = new Map()
  summary.payment_methods_summary.forEach(pm => {
    methodMap.set(pm.method_id, pm.method_name)
  })

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const accountsSummary = summary.payment_methods_summary.reduce((acc, pm) => {
    if (!acc[pm.account_name]) {
      acc[pm.account_name] = {
        account_name: pm.account_name,
        total_incomes: 0,
        total_expenses: 0,
        incomes_count: 0,
        expenses_count: 0,
      }
    }
    acc[pm.account_name].total_incomes += pm.total_incomes
    acc[pm.account_name].total_expenses += pm.total_expenses
    acc[pm.account_name].incomes_count += pm.incomes_count
    acc[pm.account_name].expenses_count += pm.expenses_count
    return acc
  }, {} as Record<string, { account_name: string; total_incomes: number; total_expenses: number; incomes_count: number; expenses_count: number }>)
  
  const accountsList = Object.values(accountsSummary).sort((a, b) => b.total_expenses - a.total_expenses)

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios Detalhados</h1>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Saldo Atual</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.current_balance)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total de Receitas</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_incomes)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Gasto</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expenses)}</p>
          </div>
        </div>
      </div>

      {/* Análise por Conta */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-400" />
          Análise por Conta
        </h2>

        {accountsList.length === 0 ? (
          <p className="text-gray-500">Nenhuma conta com movimentações ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Instituição / Conta</th>
                  <th className="pb-3 font-medium px-4">Entradas (Qtd)</th>
                  <th className="pb-3 font-medium px-4">Saídas (Qtd)</th>
                  <th className="pb-3 font-medium px-4">Total Recebido</th>
                  <th className="pb-3 font-medium px-4">Total Gasto</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-50">
                {accountsList.map((acc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{acc.account_name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700 text-sm font-bold">
                        {acc.incomes_count}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-700 text-sm font-bold">
                        {acc.expenses_count}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-green-600">{formatCurrency(acc.total_incomes)}</td>
                    <td className="py-4 px-4 font-medium text-red-600">{formatCurrency(acc.total_expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Uso por Método de Pagamento */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-400" />
          Análise por Método de Pagamento
        </h2>

        {summary.payment_methods_summary.length === 0 ? (
          <p className="text-gray-500">Nenhum método de pagamento cadastrado ou utilizado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium px-4">Método / Cartão</th>
                  <th className="pb-3 font-medium px-4">Entradas (Qtd)</th>
                  <th className="pb-3 font-medium px-4">Saídas (Qtd)</th>
                  <th className="pb-3 font-medium px-4">Total Recebido</th>
                  <th className="pb-3 font-medium px-4">Total Gasto</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 divide-y divide-gray-50">
                {summary.payment_methods_summary.sort((a, b) => b.total_expenses - a.total_expenses).map((ms, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{ms.method_name}</div>
                      <div className="text-xs text-gray-500">{ms.method_type.replace('_', ' ')} - {ms.account_name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700 text-sm font-bold">
                        {ms.incomes_count}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-700 text-sm font-bold">
                        {ms.expenses_count}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-green-600">{formatCurrency(ms.total_incomes)}</td>
                    <td className="py-4 px-4 font-medium text-red-600">{formatCurrency(ms.total_expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico Completo de Transações */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Todas as Transações</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação registrada no momento.</p>
        ) : (
          <div className="space-y-4">
            {transactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()).map(t => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors gap-4">
                <div>
                  <p className="font-bold text-gray-900">{t.category}</p>
                  <p className="text-sm text-gray-600 mb-1">{t.description || "Sem descrição"}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                      {new Date(t.transaction_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                    {t.payment_method_id && methodMap.has(t.payment_method_id) && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">
                        💳 {methodMap.get(t.payment_method_id).name}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-lg font-bold whitespace-nowrap ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
