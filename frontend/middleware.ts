import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Pega o token dos cookies
  const token = request.cookies.get('access_token')?.value
  
  // Caminhos protegidos
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  // Caminho público exclusivo para não-logados
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // 1. Se tentar acessar dashboard sem token, redireciona para login
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Se já tem token e tenta acessar o login, redireciona pro dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Define em quais rotas o middleware vai rodar
export const config = {
  matcher: ['/dashboard/:path*', '/login']
}
