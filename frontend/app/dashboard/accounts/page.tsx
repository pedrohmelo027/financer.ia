'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, WalletCards, Landmark, CreditCard, Building2, ChevronRight, Layers } from 'lucide-react'
import { getAccounts, getPaymentMethods, createAccountAction, createPaymentMethodAction } from './actions'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [accountError, setAccountError] = useState<string | null>(null)
  const [methodError, setMethodError] = useState<string | null>(null)
  
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false)
  const [isSubmittingMethod, setIsSubmittingMethod] = useState(false)

  async function fetchData() {
    setLoading(true)
    const [accRes, methRes] = await Promise.all([getAccounts(), getPaymentMethods()])
    if (accRes.accounts) setAccounts(accRes.accounts)
    if (methRes.methods) setMethods(methRes.methods)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleAccountSubmit(formData: FormData) {
    setIsSubmittingAccount(true)
    setAccountError(null)
    const res = await createAccountAction(formData)
    if (res?.error) {
      setAccountError(res.error)
    } else {
      fetchData()
      const form = document.getElementById('account-form') as HTMLFormElement
      if (form) form.reset()
    }
    setIsSubmittingAccount(false)
  }

  async function handleMethodSubmit(formData: FormData) {
    setIsSubmittingMethod(true)
    setMethodError(null)
    const res = await createPaymentMethodAction(formData)
    if (res?.error) {
      setMethodError(res.error)
    } else {
      fetchData()
      const form = document.getElementById('method-form') as HTMLFormElement
      if (form) form.reset()
    }
    setIsSubmittingMethod(false)
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Contas e Cartões</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Formulários (Esquerda) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Adicionar Conta */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Nova Instituição / Conta
            </h2>
            <form id="account-form" action={handleAccountSubmit} className="space-y-4">
              {accountError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{accountError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Conta (Ex: Nubank, Itaú)</label>
                <input type="text" name="name" required placeholder="Digite o nome..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white text-gray-900" />
              </div>
              <button type="submit" disabled={isSubmittingAccount} className="w-full py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-all disabled:opacity-70">
                {isSubmittingAccount ? 'Criando...' : 'Criar Conta'}
              </button>
            </form>
          </div>

          {/* Adicionar Método de Pagamento */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              Vincular Cartão / Método
            </h2>
            <form id="method-form" action={handleMethodSubmit} className="space-y-4">
              {methodError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{methodError}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Conta Vinculada</label>
                <select name="account_id" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white text-gray-900">
                  <option value="">Selecione uma conta...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Método (Apelido)</label>
                <input type="text" name="name" required placeholder="Ex: Cartão de Crédito Black" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white text-gray-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                <select name="type" required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black outline-none bg-white text-gray-900">
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="PIX">Pix</option>
                  <option value="BANK_TRANSFER">Transferência</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmittingMethod || accounts.length === 0} className="w-full py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all disabled:opacity-70">
                {isSubmittingMethod ? 'Adicionando...' : 'Adicionar Método'}
              </button>
              {accounts.length === 0 && (
                <p className="text-xs text-center text-gray-500 mt-2">Crie uma conta primeiro.</p>
              )}
            </form>
          </div>

        </div>

        {/* Listagem (Direita) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-400" />
              Minhas Contas e Cartões
            </h2>
            
            {loading ? (
              <p className="text-gray-500 text-center py-8">Carregando...</p>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Você ainda não cadastrou nenhuma conta. Crie a sua primeira instituição bancária ao lado!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {accounts.map((account) => {
                  const accountMethods = methods.filter(m => m.account_id === account.id)
                  
                  return (
                    <div key={account.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                      <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
                          <p className="text-xs text-gray-500">
                            Adicionada em {new Date(account.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {accountMethods.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">Nenhum cartão ou método vinculado a esta conta.</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {accountMethods.map(method => (
                              <div key={method.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-3 border border-gray-100">
                                  {getIconForType(method.type)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                                  <p className="text-xs text-gray-500">{method.type.replace('_', ' ')}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
