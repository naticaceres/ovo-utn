import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'

export function LoginPage() {
  const [email, setEmail] = useState('demo@ovo.app')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const user = await authApi.login({ email, password })
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user))
      navigate('/questionnaire')
    } else {
      setError('Credenciales inválidas')
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="iniciar sesión">
      <h2>Ingresar</h2>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Contraseña
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Entrar</button>
    </form>
  )
}


