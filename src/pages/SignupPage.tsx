import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/lib/api'

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await authApi.signup({ name, email, password })
      navigate('/login')
    } catch (e) {
      setError('No se pudo registrar')
    }
  }

  return (
    <form onSubmit={onSubmit} aria-label="registrarse">
      <h2>Registro</h2>
      <label>
        Nombre
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Contraseña
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Crear cuenta</button>
    </form>
  )
}


