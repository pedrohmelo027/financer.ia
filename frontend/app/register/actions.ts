'use server'

import { redirect } from 'next/navigation'

export async function registerAction(formData: FormData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')
  
  // Novos campos do step 2
  // Converte a lista de hobbies em uma única string separada por vírgula para o backend
  const hobbies = formData.getAll('hobbies').join(', ')
  const goals = formData.get('goals')
  const bio = formData.get('bio')

  if (!name || !email || !password) {
    return { error: 'Nome, e-mail e senha são obrigatórios.' }
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        hobbies,
        goals,
        bio
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      let errorMessage = 'Erro ao criar conta. Tente novamente.'
      
      if (errorData?.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail[0]?.msg || errorMessage
        }
      }
      
      return { error: errorMessage }
    }
    
    // Se a API retornar sucesso mas não fizer auto-login, apenas continuamos
    // const data = await response.json()
    
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }

  // Redireciona para o login após cadastro com sucesso
  redirect('/login?registered=true')
}
