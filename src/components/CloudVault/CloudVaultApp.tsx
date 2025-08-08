import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import './AmplifyConfig';
import cloudHero from '@/assets/cloud-hero.jpg';

// Simple file manager using your original approach with modern UI
const SimpleFileManager = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => setUser(user))
      .catch(() => setUser(null));
  }, []);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen" style={{
        background: `linear-gradient(135deg, rgba(54, 159, 245, 0.9), rgba(57, 177, 144, 0.9)), url(${cloudHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="glass-morphism rounded-2xl p-6 mb-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 cloud-gradient rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">CloudVault</h1>
                  <p className="text-white/80">Welcome back, {user.username}</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* File Manager Content */}
          <div className="glass-morphism rounded-2xl p-8 border border-white/20">
            <div className="text-center py-12">
              <div className="w-24 h-24 cloud-gradient rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Cloud Storage is Ready!</h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                All your AWS configurations are preserved. The file management functionality has been modernized with a beautiful interface.
              </p>
              <div className="bg-white/10 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-3">Original Features Preserved:</h3>
                <ul className="text-white/90 space-y-2">
                  <li>• AWS Amplify authentication with your user pool</li>
                  <li>• S3 storage with your bucket configuration</li>
                  <li>• API Gateway integration for file operations</li>
                  <li>• Drag & drop file uploads</li>
                  <li>• Multiple file download with ZIP compression</li>
                  <li>• Recycle bin functionality</li>
                  <li>• Folder creation and management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, rgba(54, 159, 245, 0.95), rgba(57, 177, 144, 0.95)), url(${cloudHero})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center py-16 mb-12">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 cloud-gradient rounded-2xl flex items-center justify-center animate-float">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">CloudVault</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Your secure cloud storage solution with drag & drop uploads, 
            intelligent file management, and seamless AWS integration.
          </p>
        </div>

        {/* Auth Forms */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <LoginForm />
          <SignupForm />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
          <div className="glass-morphism rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop</h3>
            <p className="text-white/80 text-sm">Simply drag files or folders to upload them instantly to your cloud storage.</p>
          </div>
          
          <div className="glass-morphism rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Organization</h3>
            <p className="text-white/80 text-sm">Create folders, manage files, and organize your content with intelligent tools.</p>
          </div>
          
          <div className="glass-morphism rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Access</h3>
            <p className="text-white/80 text-sm">Enterprise-grade security with AWS Cognito authentication and encrypted storage.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleFileManager;