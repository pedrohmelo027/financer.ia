'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createTransactionAction(formData: FormData) {
  const type = formData.get('type')
  const amount = formData.get('amount')
  const date = formData.get('date')
  const category = formData.get('category')
  const description = formData.get('description')
  const payment_method_id = formData.get('payment_method_id')

  if (!amount || !date || !category) {
    return { error: 'Preencha os campos obrigatórios (Valor, Data e Categoria).' }
  }

  // Pega o token de autenticação
  const token = cookies().get('access_token')?.value
  
  if (!token) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // Formata o amount para float
    const numericAmount = parseFloat(amount.toString().replace(',', '.'))

    let finalPaymentMethodId = payment_method_id

    // Se não forneceu (ex: string vazia), busca o primeiro método de pagamento do usuário
    if (!finalPaymentMethodId || finalPaymentMethodId === '') {
      const pmResponse = await fetch(`${API_URL}/payment-methods/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (pmResponse.ok) {
        const methods = await pmResponse.json()
        if (methods && methods.length > 0) {
          finalPaymentMethodId = methods[0].id
        } else {
          // Se for usuário antigo e não tiver método de pagamento, cria uma conta e depois o método na hora
          // 1. Tenta criar uma Conta
          let defaultAccountId = null;
          const createAccResponse = await fetch(`${API_URL}/accounts/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Conta Principal' })
          });
          if (createAccResponse.ok) {
            const newAcc = await createAccResponse.json();
            defaultAccountId = newAcc.id;
          }

          if (defaultAccountId) {
            // 2. Cria o Método de Pagamento vinculado a essa conta
            const createPmResponse = await fetch(`${API_URL}/payment-methods/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                name: 'Carteira',
                type: 'OTHER',
                account_id: defaultAccountId
              })
            })
            if (createPmResponse.ok) {
              const newPm = await createPmResponse.json()
              finalPaymentMethodId = newPm.id
            } else {
               finalPaymentMethodId = null
            }
          } else {
            finalPaymentMethodId = null
          }
        }
      } else {
        finalPaymentMethodId = null
      }
    }

    const response = await fetch(`${API_URL}/transactions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Passando o JWT para o FastAPI
      },
      body: JSON.stringify({
        type,
        amount: numericAmount,
        transaction_date: date,
        category,
        description,
        payment_method_id: finalPaymentMethodId
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      let errorMessage = 'Erro ao criar transação.'
      if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : (errorData.detail[0]?.msg || errorMessage)
      }
      return { error: errorMessage }
    }
    
  } catch {
    return { error: 'Erro de conexão com o servidor.' }
  }

  redirect('/dashboard?success=true')
}
