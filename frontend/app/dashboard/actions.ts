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
    const [txRes, summaryRes] = await Promise.all([
      fetch(`${API_URL}/transactions/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      }),
      fetch(`${API_URL}/reports/summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      })
    ])

    if (txRes.status === 401 || summaryRes.status === 401) {
      cookies().delete('access_token')
      redirect('/login?expired=true')
    }

    if (!txRes.ok || !summaryRes.ok) {
      return { error: 'Erro ao buscar dados do dashboard' }
    }

    const transactions = await txRes.json()
    const summary = await summaryRes.json()
    
    return { transactions, summary }
  } catch {
    return { error: 'Erro de conexão' }
  }
}

export async function logoutAction() {
  cookies().delete('access_token')
  redirect('/login')
}
