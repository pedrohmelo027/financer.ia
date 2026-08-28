import axios from 'axios'

// Configuração base do Axios para requisições no lado do cliente
// A URL base pode ser ajustada via variáveis de ambiente (.env.local)
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Opcional: Interceptor para adicionar o token caso estivéssemos guardando no localStorage,
// mas como estamos usando HttpOnly Cookies, o navegador envia automaticamente com o credentials: 'include'.
// (Lembre-se de configurar CORS no FastAPI para aceitar credentials)
api.interceptors.request.use((config) => {
  config.withCredentials = true // Necessário para enviar os HttpOnly cookies para a API em outro domínio/porta
  return config
})
