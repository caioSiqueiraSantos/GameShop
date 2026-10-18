import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../src/state'

describe('Authentication - loginWithCredentials & registerUser', () => {
  beforeEach(() => {
    useStore.setState({ currentUserId: null })
  })

  it('sucesso: autentica com username e senha padrao admin123', () => {
    const result = useStore.getState().loginWithCredentials('caio', 'admin123')
    expect(result.success).toBe(true)
    expect(useStore.getState().currentUserId).toBe('u1')
  })

  it('sucesso: autentica com case-insensitive e espacos extras', () => {
    const result = useStore.getState().loginWithCredentials('  FiLLiPy  ', 'admin123')
    expect(result.success).toBe(true)
    expect(useStore.getState().currentUserId).toBe('u2')
  })

  it('sucesso: autentica utilizando displayName', () => {
    const result = useStore.getState().loginWithCredentials('Leonardo Masanao', 'admin123')
    expect(result.success).toBe(true)
    expect(useStore.getState().currentUserId).toBe('u3')
  })

  it('falha: senha incorreta retorna erro', () => {
    const result = useStore.getState().loginWithCredentials('caio', 'senha_errada')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Senha incorreta.')
    expect(useStore.getState().currentUserId).toBeNull()
  })

  it('falha: usuario inexistente retorna erro', () => {
    const result = useStore.getState().loginWithCredentials('usuario_que_nao_existe', 'admin123')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Usuário não encontrado.')
    expect(useStore.getState().currentUserId).toBeNull()
  })

  it('falha: campos vazios retornam validacao', () => {
    const res1 = useStore.getState().loginWithCredentials('', 'admin123')
    expect(res1.success).toBe(false)
    expect(res1.error).toContain('informe seu usuário')

    const res2 = useStore.getState().loginWithCredentials('caio', '')
    expect(res2.success).toBe(false)
    expect(res2.error).toContain('informe sua senha')
  })

  it('sucesso: todos os 8 perfis padroes autenticam com admin123', () => {
    const users = useStore.getState().users
    expect(users.length).toBeGreaterThanOrEqual(8)

    for (const user of users) {
      const res = useStore.getState().loginWithCredentials(user.username, 'admin123')
      expect(res.success).toBe(true)
      expect(useStore.getState().currentUserId).toBe(user.id)
    }
  })

  it('sucesso: cadastra novo usuario com senha livre e permite login', () => {
    const testUsername = `player_${Date.now()}`
    const testPassword = 'minhasenha_customizada_123'

    const reg = useStore.getState().registerUser({
      username: testUsername,
      displayName: 'Jogador Personalizado',
      password: testPassword,
    })

    expect(reg.success).toBe(true)
    const currentId = useStore.getState().currentUserId
    expect(currentId).toBeTruthy()

    // Realizar logout e testar novo login com as credenciais criadas
    useStore.setState({ currentUserId: null })
    const loginRes = useStore.getState().loginWithCredentials(testUsername, testPassword)
    expect(loginRes.success).toBe(true)
    expect(useStore.getState().currentUserId).toBe(currentId)

    // Testar que senha errada para o novo usuario falha
    useStore.setState({ currentUserId: null })
    const wrongLogin = useStore.getState().loginWithCredentials(testUsername, 'outrasenha')
    expect(wrongLogin.success).toBe(false)
  })

  it('falha: rejeita cadastro com username existente', () => {
    const reg = useStore.getState().registerUser({
      username: 'caio',
      displayName: 'Caio Clone',
      password: 'qualquersenha',
    })
    expect(reg.success).toBe(false)
    expect(reg.error).toContain('já está em uso')
  })

  it('gerenciamento de amigos: adiciona e remove amizade no estado', () => {
    useStore.setState({ currentUserId: 'u1' }) // Caio
    const { addFriend, removeFriend } = useStore.getState()

    // u8 (Sofia) não é amiga inicial de u1
    addFriend('u8')
    const u1AfterAdd = useStore.getState().users.find(u => u.id === 'u1')!
    const u8AfterAdd = useStore.getState().users.find(u => u.id === 'u8')!
    expect(u1AfterAdd.friends).toContain('u8')
    expect(u8AfterAdd.friends).toContain('u1')

    // Remover amizade
    removeFriend('u8')
    const u1AfterRemove = useStore.getState().users.find(u => u.id === 'u1')!
    const u8AfterRemove = useStore.getState().users.find(u => u.id === 'u8')!
    expect(u1AfterRemove.friends).not.toContain('u8')
    expect(u8AfterRemove.friends).not.toContain('u1')
  })
})

