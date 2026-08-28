import Link from 'next/link'
import { Wallet, PieChart, Sparkles, Plus, LogOut, LayoutDashboard } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <Link href="/dashboard" className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            Financer.ia
          </Link>
        </div>
        
        <nav className="px-4 pb-6 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Visão Geral
          </Link>
          <Link href="/dashboard/transactions/new" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            <Plus className="w-5 h-5" />
            Nova Transação
          </Link>
          <Link href="/dashboard/analysis" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            <PieChart className="w-5 h-5" />
            Análise com IA
          </Link>
          <Link href="/dashboard/methods" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            <Wallet className="w-5 h-5" />
            Formas de Pagamento
          </Link>
        </nav>
        
        <div className="p-4 mt-auto">
          {/* O logout deve limpar o cookie, em um sistema real chamaríamos uma Server Action */}
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium w-full">
            <LogOut className="w-5 h-5" />
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
