'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' }
  }

  try {
    // Substitua pela URL base da sua API FastAPI (ex: process.env.NEXT_PUBLIC_API_URL)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // O FastAPI com OAuth2PasswordBearer espera x-www-form-urlencoded
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email as string,
        password: password as string
      }),
    })

    if (!response.ok) {
      // Tentar extrair a mensagem de erro da API, se existir
      const errorData = await response.json().catch(() => null)
      let errorMessage = 'Credenciais inválidas. Tente novamente.'
      
      if (errorData?.detail) {
        // O FastAPI pode retornar detail como string (HTTPException) ou como um array de objetos (ValidationError)
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          // Pega a primeira mensagem de erro de validação
          errorMessage = errorData.detail[0]?.msg || errorMessage
        }
      }
      
      return { error: errorMessage }
    }

    const data = await response.json()
    const token = data.access_token

    if (token) {
      // Salva o token em um cookie HttpOnly
      cookies().set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      })
    } else {
      return { error: 'Token não retornado pela API.' }
    }
  } catch (error) {
    return { error: 'Erro de conexão com o servidor.' }
  }

  // Redireciona para o dashboard após sucesso
  // O redirect deve ser chamado fora do bloco try-catch em Server Actions
  redirect('/dashboard')
}
