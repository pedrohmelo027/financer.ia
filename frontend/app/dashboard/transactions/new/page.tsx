'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import { createTransactionAction } from './actions'
import { getPaymentMethods } from '../../methods/actions'

export default function NewTransactionPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [methods, setMethods] = useState<any[]>([])
  
  const [type, setType] = useState('EXPENSE') // EXPENSE ou INCOME

  useEffect(() => {
    getPaymentMethods().then(res => {
      if (res.methods) setMethods(res.methods)
    })
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.append('type', type) // Adiciona o tipo que está no state (botões)
    
    const result = await createTransactionAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova Transação</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Tipo de Transação (Receita / Despesa) */}
          <div className="flex gap-4 p-1 bg-gray-50 rounded-xl border border-gray-100">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'EXPENSE' 
                  ? 'bg-white text-red-600 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'INCOME' 
                  ? 'bg-white text-green-600 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Receita
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                required
                className="w-full px-4 py-3 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors text-gray-900 bg-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              name="category"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors bg-white text-gray-900"
            >
              <option value="">Selecione uma categoria...</option>
              <option value="Moradia">Moradia (Aluguel, Luz, Água)</option>
              <option value="Alimentação">Alimentação (Mercado, Restaurantes)</option>
              <option value="Transporte">Transporte (Combustível, Uber, Ônibus)</option>
              <option value="Saúde">Saúde (Plano, Farmácia)</option>
              <option value="Lazer">Lazer (Hobbies, Cinema, Viagens)</option>
              <option value="Educação">Educação (Cursos, Livros)</option>
              <option value="Salário">Salário / Renda</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição (Criptografada na base)</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors resize-none text-gray-900 bg-white"
              placeholder="Descreva a compra... Ex: Comprei ingresso pro show de rock, ou Jantar de aniversário..."
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">
              Esta descrição é usada pela IA para entender seus hábitos, mas é salva no banco usando criptografia Fernet para sua privacidade.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
            <select
              name="payment_method_id"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors bg-white text-gray-900"
            >
              <option value="">Selecione... (Opcional)</option>
              {methods.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.bank ? `(${m.bank})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all hover:shadow-md disabled:opacity-70 flex items-center justify-center gap-2 text-lg mt-4"
          >
            {loading ? 'Salvando...' : (
              <>
                <PlusCircle className="w-5 h-5" />
                Cadastrar Transação
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
