'use client'

import { useState } from 'react'
import { registerAction } from './actions'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'

const SUGGESTED_HOBBIES = ['Futebol', 'Video-game', 'Leitura', 'Viagens', 'Tecnologia', 'Investimentos', 'Música', 'Academia']

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Step 1 states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 states
  const [hobbies, setHobbies] = useState<string[]>([])
  const [customHobbie, setCustomHobbie] = useState('')
  const [goals, setGoals] = useState('')
  const [bio, setBio] = useState('')

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Preencha os campos obrigatórios para continuar.')
      return
    }
    setError(null)
    setStep(2)
  }

  function toggleHobbie(hobbie: string) {
    if (hobbies.includes(hobbie)) {
      setHobbies(hobbies.filter(h => h !== hobbie))
    } else {
      setHobbies([...hobbies, hobbie])
    }
  }

  function addCustomHobbie() {
    if (customHobbie.trim() && !hobbies.includes(customHobbie.trim())) {
      setHobbies([...hobbies, customHobbie.trim()])
      setCustomHobbie('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Construimos um FormData falso para passar para a Server Action,
    // já que agora controlamos os inputs pelo state do React.
    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('goals', goals)
    formData.append('bio', bio)
    hobbies.forEach(h => formData.append('hobbies', h))
    
    const result = await registerAction(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all">
        
        {/* Indicador de progresso */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full -z-10 transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Crie sua conta</h1>
              <p className="text-sm text-gray-500 mt-2">Dados básicos de acesso</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">Nome Completo</label>
              <input
                type="text" id="name" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none"
                placeholder="João da Silva"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">E-mail</label>
              <input
                type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Senha</label>
              <input
                type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-gray-200 mt-2"
            >
              Continuar
            </button>
            <p className="mt-8 text-center text-sm text-gray-500">
              Já tem uma conta? <Link href="/login" className="font-medium text-black hover:underline">Faça login</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Seu Perfil</h1>
              <p className="text-sm text-gray-500 mt-2">Queremos te conhecer melhor para personalizar sua experiência.</p>
            </div>

            {/* Hobbies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seus Hobbies</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_HOBBIES.map(hobbie => (
                  <button
                    key={hobbie}
                    type="button"
                    onClick={() => toggleHobbie(hobbie)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      hobbies.includes(hobbie) 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    #{hobbie.toLowerCase()}
                  </button>
                ))}
                
                {/* Hobbies customizados (adicionados que não estão na lista sugerida) */}
                {hobbies.filter(h => !SUGGESTED_HOBBIES.includes(h)).map(hobbie => (
                  <button
                    key={hobbie}
                    type="button"
                    onClick={() => toggleHobbie(hobbie)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors border bg-black text-white border-black flex items-center gap-1"
                  >
                    #{hobbie.toLowerCase()} <X className="w-3 h-3 ml-1" />
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHobbie}
                  onChange={e => setCustomHobbie(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomHobbie())}
                  placeholder="Adicionar outro hobbie..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={addCustomHobbie}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="goals">
                Quais são suas principais metas com o Financer.ia?
              </label>
              <textarea
                id="goals" value={goals} onChange={e => setGoals(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none resize-none"
                placeholder="Ex: Quero organizar minhas dívidas e começar a investir..."
              ></textarea>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="bio">
                Bio (Fale um pouco sobre você)
              </label>
              <textarea
                id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none resize-none"
                placeholder="Ex: Sou desenvolvedor, moro em São Paulo e gosto de jogar videogame nos finais de semana..."
              ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors flex-1"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-gray-200 disabled:opacity-70 flex-2 flex items-center justify-center w-2/3"
              >
                {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
