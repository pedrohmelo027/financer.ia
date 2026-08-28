import Link from 'next/link'
import { ArrowRight, Wallet, PieChart, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar simplificada */}
      <nav className="border-b border-gray-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
          <div className="bg-black text-white p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          Financer.ia
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-black px-4 py-2 transition-colors"
          >
            Entrar
          </Link>
          <Link 
            href="/register"
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Cadastrar
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mt-16 mb-24">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Inteligência artificial para sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">liberdade financeira</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
            O Financer.ia ajuda você a entender seus gastos, planejar o futuro e tomar as melhores decisões com o poder da Inteligência Artificial trabalhando ao seu lado.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black border border-gray-200 font-medium rounded-full hover:bg-gray-50 transition-colors text-lg"
            >
              Acessar minha conta
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-gray-900">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Controle Total</h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize suas despesas de forma clara e intuitiva. Saiba exatamente para onde seu dinheiro está indo todos os meses.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-gray-900">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Insights com IA</h3>
            <p className="text-gray-600 leading-relaxed">
              Nossa Inteligência Artificial analisa seu padrão de consumo e cria recomendações personalizadas para você economizar.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-gray-900">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Planejamento</h3>
            <p className="text-gray-600 leading-relaxed">
              Defina metas financeiras e acompanhe seu progresso. Construa sua reserva de emergência e realize seus sonhos.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
