'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getPaymentMethods() {
  const token = cookies().get('access_token')?.value
  
  if (!token) {
    return { error: 'Não autenticado' }
  }

  try {
    const res = await fetch(`${API_URL}/payment-methods/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // cache: 'no-store' is useful if we want fresh data always, but server actions invalidate cache anyway
    })
    
    if (!res.ok) {
      return { error: 'Falha ao carregar métodos de pagamento.' }
    }

    const data = await res.json()
    return { methods: data }
  } catch (error) {
    return { error: 'Erro de conexão.' }
  }
}

export async function createPaymentMethodAction(formData: FormData) {
  const name = formData.get('name')
  const type = formData.get('type')
  const bank = formData.get('bank')

  if (!name || !type) {
    return { error: 'Nome e Tipo são obrigatórios.' }
  }

  const token = cookies().get('access_token')?.value
  
  if (!token) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  try {
    const response = await fetch(`${API_URL}/payment-methods/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        type,
        bank: bank || null
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      let errorMessage = 'Erro ao criar método de pagamento.'
      if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : (errorData.detail[0]?.msg || errorMessage)
      }
      return { error: errorMessage }
    }
    
  } catch (error) {
    return { error: 'Erro de conexão com o servidor.' }
  }

  revalidatePath('/dashboard/methods')
  return { success: true }
}
