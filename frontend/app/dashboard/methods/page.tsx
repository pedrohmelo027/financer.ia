'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, WalletCards, Landmark, CreditCard, Building2, Trash2 } from 'lucide-react'
import { getPaymentMethods, createPaymentMethodAction } from './actions'

export default function MethodsPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function fetchMethods() {
    const res = await getPaymentMethods()
    if (res.methods) {
      setMethods(res.methods)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMethods()
  }, [])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    const result = await createPaymentMethodAction(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      // Recarrega a lista
      fetchMethods()
      // Limpa o form manipulando o evento via HTMLFormElement
      const form = document.getElementById('method-form') as HTMLFormElement
      if (form) form.reset()
    }
    setIsSubmitting(false)
  }

  function getIconForType(type: string) {
    switch (type) {
      case 'CREDIT_CARD': return <CreditCard className="w-5 h-5 text-purple-600" />
      case 'DEBIT_CARD': return <WalletCards className="w-5 h-5 text-blue-600" />
      case 'PIX': return <Landmark className="w-5 h-5 text-teal-600" />
      default: return <Building2 className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Formas de Pagamento</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Formulário */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Novo Método
            </h2>
            
            <form id="method-form" action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome (Apelido)</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ex: Nubank Principal"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                <select
                  name="type"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors text-gray-900 bg-white"
                >
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="PIX">Pix</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="BANK_TRANSFER">Transferência</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Banco / Instituição (Opcional)</label>
                <input
                  type="text"
                  name="bank"
                  placeholder="Ex: Nubank, Itaú, Inter"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-colors text-gray-900 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all hover:shadow-md disabled:opacity-70 mt-2"
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Métodos */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Meus Cartões e Contas</h2>
            
            {loading ? (
              <p className="text-gray-500 text-center py-8">Carregando seus métodos...</p>
            ) : methods.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <WalletCards className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Você ainda não cadastrou nenhuma forma de pagamento. Use o formulário ao lado para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {methods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                        {getIconForType(method.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-500">
                          {method.type.replace('_', ' ')} {method.bank ? `• ${method.bank}` : ''}
                        </p>
                      </div>
                    </div>
                    {/* Futuro: Botão de deletar */}
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
