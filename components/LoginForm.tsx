'use client'

import { useState } from 'react'

interface LoginFormProps {
  showMessage: (text: string) => void
  setUser: (user: any) => void
}

export function LoginForm({ showMessage, setUser }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { Auth } = await import('aws-amplify')
      const user = await Auth.signIn(email, password)
      setUser(user)
      showMessage('Logged in successfully!')
    } catch (error: any) {
      showMessage('Login failed: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      showMessage('Please enter your email address first.')
      return
    }
    
    try {
      const { Auth } = await import('aws-amplify')
      await Auth.forgotPassword(email)
      showMessage('Reset code sent to your email.')
    } catch (error: any) {
      showMessage('Error: ' + error.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login to CloudVault</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button 
          type="button" 
          onClick={handleForgotPassword} 
          className="w-full text-blue-600 hover:underline transition-colors text-center mt-2"
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  )
}
