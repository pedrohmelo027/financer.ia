'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// --- ACCOUNTS ---
export async function getAccounts() {
  const token = cookies().get('access_token')?.value
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/accounts/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return { error: 'Falha ao carregar contas.' }
    const data = await res.json()
    return { accounts: data }
  } catch {
    return { error: 'Erro de conexão.' }
  }
}

export async function createAccountAction(formData: FormData) {
  const name = formData.get('name')
  if (!name) return { error: 'O nome da conta é obrigatório.' }

  const token = cookies().get('access_token')?.value
  if (!token) return { error: 'Sessão expirada.' }

  try {
    const response = await fetch(`${API_URL}/accounts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) return { error: 'Erro ao criar conta.' }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }

  revalidatePath('/dashboard/accounts')
  return { success: true }
}

// --- PAYMENT METHODS ---
export async function getPaymentMethods() {
  const token = cookies().get('access_token')?.value
  if (!token) return { error: 'Não autenticado' }

  try {
    const res = await fetch(`${API_URL}/payment-methods/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) return { error: 'Falha ao carregar métodos de pagamento.' }
    const data = await res.json()
    return { methods: data }
  } catch {
    return { error: 'Erro de conexão.' }
  }
}

export async function createPaymentMethodAction(formData: FormData) {
  const name = formData.get('name')
  const type = formData.get('type')
  const account_id = formData.get('account_id')

  if (!name || !type || !account_id) {
    return { error: 'Nome, Tipo e Conta são obrigatórios.' }
  }

  const token = cookies().get('access_token')?.value
  if (!token) return { error: 'Sessão expirada.' }

  try {
    const response = await fetch(`${API_URL}/payment-methods/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, type, account_id }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      let errorMessage = 'Erro ao criar método de pagamento.'
      if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : (errorData.detail[0]?.msg || errorMessage)
      }
      return { error: errorMessage }
    }
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }

  revalidatePath('/dashboard/accounts')
  return { success: true }
}
