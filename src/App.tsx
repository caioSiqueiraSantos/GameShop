import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './state'
import Login from './pages/Login'
import Store from './pages/Store'
import GameDetail from './pages/GameDetail'
import Library from './pages/Library'
import Friends from './pages/Friends'
import Admin from './pages/Admin'

function Guard({ children }: { children: React.ReactNode }) {
  const currentUserId = useStore(s => s.currentUserId)
  return currentUserId ? <>{children}</> : <Navigate to="/" />
}

export default function App() {
  const currentUserId = useStore(s => s.currentUserId)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={currentUserId ? <Navigate to="/store" /> : <Login />} />
        <Route path="/store" element={<Guard><Store /></Guard>} />
        <Route path="/game/:id" element={<Guard><GameDetail /></Guard>} />
        <Route path="/library" element={<Guard><Library /></Guard>} />
        <Route path="/friends" element={<Guard><Friends /></Guard>} />
        <Route path="/profile" element={<Navigate to="/library" replace />} />
        <Route path="/admin" element={<Guard><Admin /></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
