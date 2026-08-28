'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getDashboardData() {
  const token = cookies().get('access_token')?.value
  
  if (!token) {
    redirect('/login')
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${API_URL}/transactions/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return { error: 'Erro ao buscar transações' }
    }

    const transactions = await response.json()
    return { transactions }
  } catch {
    return { error: 'Erro de conexão' }
  }
}
