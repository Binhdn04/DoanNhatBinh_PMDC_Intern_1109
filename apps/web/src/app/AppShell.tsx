import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ApiApp from './ApiApp'
import { SessionProvider } from './session'

const client = new QueryClient({ defaultOptions: { queries: { retry: (count, error) => !(error instanceof Error && 'status' in error && [401, 403, 404].includes(Number((error as { status: number }).status))) && count < 1 }, mutations: { retry: false } } })

export default function AppShell() {
  return <QueryClientProvider client={client}><BrowserRouter><SessionProvider client={client}><ApiApp /></SessionProvider></BrowserRouter></QueryClientProvider>
}
