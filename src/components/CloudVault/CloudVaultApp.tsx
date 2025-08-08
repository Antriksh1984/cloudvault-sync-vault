import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import FileManager from './FileManager';
import cloudHero from '@/assets/cloud-hero.jpg';

// Declare global AWS types
declare global {
  interface Window {
    AWS: any;
  }
}

// AWS configuration exactly like your original
const configureAWS = () => {
  if (typeof window !== 'undefined' && window.AWS) {
    const { Amplify } = window.AWS;
    
    Amplify.configure({
      Auth: {
        region: 'ap-south-1', 
        userPoolId: 'ap-south-1_y4GGRCtdR',
        userPoolWebClientId: '3thf1uf9n8bc7u0sogqv0bjrts',
        authenticationFlowType: 'USER_PASSWORD_AUTH'
      },
      Storage: {
        region: 'ap-south-1',
        bucket: 'adler-personal-storage',
        identityPoolId: 'ap-south-1:ce4fa149-520e-44b6-a006-128b8ef30c1b'
      },
      API: {
        endpoints: [
          {
            name: 'CV_v1',
            endpoint: 'https://necll2p9x2.execute-api.ap-south-1.amazonaws.com/Production',
            region: 'ap-south-1'
          }
        ]
      }
    });
  }
};

const CloudVaultApp = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load AWS SDK and configure
    const script = document.createElement('script');
    script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1286.0.min.js';
    script.onload = () => {
      configureAWS();
      checkUser();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const checkUser = async () => {
    try {
      if (window.AWS) {
        const { Auth } = window.AWS;
        const currentUser = await Auth.currentAuthenticatedUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.log('No authenticated user');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: `linear-gradient(135deg, rgba(54, 159, 245, 0.95), rgba(57, 177, 144, 0.95)), url(${cloudHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading CloudVault...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <FileManager />;
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

export default CloudVaultApp;