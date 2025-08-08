'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/LoginForm'
import { SignupForm } from '@/components/SignupForm'
import { FileManager } from '@/components/FileManager'
import { MessageBox } from '@/components/MessageBox'

export default function Home() {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState({ show: false, text: '' })
  const [isLoading, setIsLoading] = useState(false)

  const showMessage = (text: string) => {
    setMessage({ show: true, text })
  }

  const hideMessage = () => {
    setMessage({ show: false, text: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {message.show && (
        <MessageBox text={message.text} onClose={hideMessage} />
      )}
      
      {user ? (
        <FileManager user={user} showMessage={showMessage} setUser={setUser} />
      ) : (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <LoginForm showMessage={showMessage} setUser={setUser} />
          <SignupForm showMessage={showMessage} />
        </div>
      )}
    </div>
  )
}
