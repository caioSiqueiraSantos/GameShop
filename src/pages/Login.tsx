import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state'

export default function Login() {
  const { users, login, loginWithCredentials, registerUser, resetData } = useStore()
  const navigate = useNavigate()

  // Modo: 'login' ou 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // Campos de Login
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Campos de Cadastro
  const [regDisplayName, setRegDisplayName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regShowPassword, setRegShowPassword] = useState(false)

  // Estados de feedback e controle
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!identifier.trim()) {
      setError('Por favor, informe seu usuário ou e-mail.')
      return
    }

    if (!password) {
      setError('Por favor, informe sua senha.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const result = loginWithCredentials(identifier, password)
      if (result.success) {
        navigate('/store')
      } else {
        setError(result.error || 'Credenciais inválidas.')
        setIsLoading(false)
      }
    }, 250)
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!regDisplayName.trim()) {
      setError('Por favor, informe um nome de exibição.')
      return
    }

    if (!regUsername.trim()) {
      setError('Por favor, escolha um nome de usuário.')
      return
    }

    if (regPassword.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const result = registerUser({
        displayName: regDisplayName,
        username: regUsername,
        password: regPassword,
      })

      if (result.success) {
        navigate('/store')
      } else {
        setError(result.error || 'Erro ao criar perfil.')
        setIsLoading(false)
      }
    }, 280)
  }

  const handleFillFromModal = (userUsername: string, userPassword?: string) => {
    setMode('login')
    setIdentifier(userUsername)
    setPassword(userPassword || 'admin123')
    setError(null)
    setShowAccountsModal(false)
    setNotice(`Credenciais do usuário @${userUsername} preenchidas.`)
    setTimeout(() => setNotice(null), 3500)
  }

  const handleQuickDirectLogin = (userId: string) => {
    login(userId)
    navigate('/store')
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Luzes de Fundo (Aura Gamer moderna) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Barra Superior / Header Clean */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg?v=3"
            alt="GameShop"
            className="w-11 h-11 rounded-xl object-cover shadow-lg shadow-indigo-500/25 ring-1 ring-white/10"
          />
          <div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent block">
              GameShop
            </span>
            <span className="text-xs text-indigo-400 block font-medium">Plataforma de Jogos</span>
          </div>
        </div>

        {/* Botão Discreto para Abrir Contas de Teste */}
        <button
          type="button"
          onClick={() => setShowAccountsModal(true)}
          className="text-xs text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800/80 hover:border-indigo-600/50 bg-gray-900/40 hover:bg-gray-900"
          title="Ver perfis salvos no sistema"
        >
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span className="font-medium">Perfis de Teste</span>
        </button>
      </header>

      {/* Conteúdo Central: Card de Autenticação */}
      <main className="w-full max-w-md mx-auto px-6 py-6 flex-1 flex flex-col justify-center z-10">
        <div className="w-full bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-black/70 relative">
          {/* Navegação entre Entrar e Criar Conta */}
          <div className="flex bg-gray-950/70 p-1 rounded-xl mb-6 border border-gray-800/70">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Cabeçalho do Card */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Acessar sua conta' : 'Criar novo perfil'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'login'
                ? 'Insira suas credenciais para continuar.'
                : 'Defina seu usuário e sua senha livre para explorar a loja.'}
            </p>
          </div>

          {/* Notificação Temporária (Ex: Preenchimento automático) */}
          {notice && (
            <div className="mb-4 bg-indigo-950/70 border border-indigo-700/60 rounded-xl p-3 flex items-center gap-2.5 text-xs text-indigo-200 animate-fadeIn">
              <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{notice}</span>
            </div>
          )}

          {/* Mensagem de Erro Limpa */}
          {error && (
            <div className="mb-4 bg-rose-950/70 border border-rose-800/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-200 animate-fadeIn">
              <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Usuário ou E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => {
                      setIdentifier(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Nome de usuário ou e-mail"
                    autoComplete="username"
                    className="w-full bg-gray-950/70 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className="w-full bg-gray-950/70 border border-gray-700/80 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-950 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                  />
                  <span>Lembrar deste dispositivo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar na GameShop</span>
                    <svg
                      className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORMULÁRIO DE CADASTRO (CRIAR PERFIL) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  value={regDisplayName}
                  onChange={e => {
                    setRegDisplayName(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Seu nome completo ou apelido"
                  className="w-full bg-gray-950/70 border border-gray-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Nome de Usuário (Login)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-gray-500">
                    @
                  </span>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={e => {
                      setRegUsername(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="usuario (letras e numeros)"
                    autoComplete="username"
                    className="w-full bg-gray-950/70 border border-gray-700/80 rounded-xl pl-8 pr-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Senha Livre</label>
                <div className="relative">
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => {
                      setRegPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Crie sua senha de acesso"
                    autoComplete="new-password"
                    className="w-full bg-gray-950/70 border border-gray-700/80 rounded-xl px-3.5 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  >
                    {regShowPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type={regShowPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={e => {
                    setRegConfirmPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  className="w-full bg-gray-950/70 border border-gray-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Criando Perfil...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Perfil e Entrar</span>
                    <svg className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Rodapé Interno do Card */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            {mode === 'login' ? (
              <span>Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError(null)
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline"
                >
                  Cadastre-se
                </button>
              </span>
            ) : (
              <span>Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError(null)
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline-offset-2 hover:underline"
                >
                  Faça login
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowAccountsModal(true)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Acessar perfis pré-configurados"
            >
              Ver contas
            </button>
          </div>
        </div>
      </main>

      {/* MODAL COM OS LOGINS GERADOS (ABRE APENAS PELO BOTÃO) */}
      {showAccountsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Perfis Cadastrados no Sistema</h2>
                  <p className="text-xs text-gray-400">
                    Selecione um perfil para preencher ou entrar diretamente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountsModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lista dos Usuários em Grid */}
            <div className="overflow-y-auto py-4 flex-1 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map(user => {
                const userPass = user.password || 'admin123'
                return (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-xl border border-gray-800 bg-gray-950/70 hover:bg-gray-800/40 hover:border-gray-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                        {user.displayName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-200 truncate group-hover:text-white">
                          {user.displayName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono truncate">@{user.username}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
                          <span>{user.library.length} jogos</span>
                          <span>•</span>
                          <span>{user.friends.length} amigos</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleFillFromModal(user.username, userPass)}
                        className="px-2.5 py-1 rounded-md text-[11px] bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white transition-colors border border-gray-700/60 font-medium"
                      >
                        Preencher
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDirectLogin(user.id)}
                        className="px-2.5 py-1 rounded-md text-[10px] bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors border border-gray-800 font-medium"
                      >
                        Entrar ⚡
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rodapé do Modal */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>Perfis salvos localmente ({users.length} no total)</span>
              <button
                type="button"
                onClick={() => setShowAccountsModal(false)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Principal Discreto */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 border-t border-gray-900 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div>
          <span>GameShop • Plataforma de Jogos</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={resetData}
            title="Redefine o dataset para os valores iniciais"
            className="text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restaurar dados originais
          </button>
          <span>•</span>
          <span>v1.0</span>
        </div>
      </footer>
    </div>
  )
}
