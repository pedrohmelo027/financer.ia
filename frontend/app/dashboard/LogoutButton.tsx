'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { logoutAction } from './actions'

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logoutAction()
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="flex items-center justify-start gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium w-full text-left"
      >
        <LogOut className="w-5 h-5" />
        Sair
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sair da conta?</h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja sair do Financer.ia? Você precisará fazer login novamente para acessar seus dados.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isLoggingOut ? 'Saindo...' : 'Sair Agora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
