import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}
