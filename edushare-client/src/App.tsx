
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from 'next-themes'
export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
    </ThemeProvider>
  )
}
