
// components/auth/LoginClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/app/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // Imported from utils/firebase
  sendPasswordResetEmail // Imported from utils/firebase
} from '@/utils/firebase'; 
import { auth } from '@/utils/firebase'; 
import { pathnames } from '@/next-intl.config';

// Simple SVG Icons
const EmailIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const LockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
  </svg>
);

type AuthMode = 'login' | 'signup' | 'forgotPassword';

const LoginClient: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');

  useEffect(() => {
    if (!authLoading && user && authMode !== 'signup') { // Don't redirect immediately after signup
      const redirectParam = searchParams.get('redirect');
      const typedRedirectPath =
      (redirectParam || '/') as keyof typeof pathnames & string;
      router.replace(typedRedirectPath);
    }
  }, [user, authLoading, router, searchParams, authMode]);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
  }

  const handleAuthAction = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        if (!email || !password) {
          setError(t('errorGeneric')); return;
        }
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect is handled by useEffect
      } else if (authMode === 'signup') {
        if (!email || !password) {
          setError(t('errorGeneric')); return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage(t('signUpSuccess'));
        setAuthMode('login'); // Switch to login mode after successful signup
        setEmail(''); // Clear email for login
        setPassword(''); // Clear password for login
      } else if (authMode === 'forgotPassword') {
        if (!email) {
          setError(t('errorInvalidEmail')); return;
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage(t('resetPasswordEmailSent'));
        setEmail(''); // Clear email field
      }
    } catch (err: any) {
      console.error(`Firebase ${authMode} error:`, err);
      handleAuthError(err);
    } finally {
      if (authMode !== 'signup' || error) { // Don't clear submitting state on signup success immediately, as success message is shown
         setIsSubmitting(false);
      }
    }
  };
  
  const handleAuthError = (err: any) => {
    if (authMode === 'login' || authMode === 'signup') {
        switch (err.code) {
            case 'auth/invalid-email':
            case 'auth/invalid-credential': // Often for wrong email format or if user not found with new SDKs for sign-in
                setError(t('errorInvalidEmail'));
                break;
            case 'auth/user-not-found': // More specific to login
            case 'auth/user-disabled':
                 setError(t('errorUserNotFound'));
                 break;
            case 'auth/wrong-password':
                 setError(t('errorWrongPassword'));
                 break;
            case 'auth/too-many-requests':
                 setError(t('errorTooManyRequests'));
                 break;
            case 'auth/email-already-in-use': // Specific to signup
                 setError(t('errorEmailInUse'));
                 break;
            case 'auth/weak-password': // Specific to signup
                 setError(t('errorWeakPassword'));
                 break;
            default:
                 setError(t('errorGeneric'));
        }
    } else if (authMode === 'forgotPassword') {
         if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
            setError(t('errorUserNotFound')); // Or a generic "If an account exists..."
        } else {
            setError(t('errorGeneric'));
        }
    }
  }

  if (authLoading || (!authLoading && user && authMode !== 'signup')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const getPageTitle = () => {
    if (authMode === 'signup') return t('signUpTitle');
    if (authMode === 'forgotPassword') return t('forgotPasswordTitle');
    return t('loginTitle');
  }

  const getButtonText = () => {
    if (isSubmitting) {
      if (authMode === 'login') return t('signingInButton');
      if (authMode === 'signup') return t('signingUpButton');
      if (authMode === 'forgotPassword') return t('sendingResetLinkButton');
    }
    if (authMode === 'login') return t('signInButton');
    if (authMode === 'signup') return t('signUpButton');
    if (authMode === 'forgotPassword') return t('sendResetLinkButton');
    return '';
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-4 py-12"
      style={{ backgroundImage: "url('/images/login-background.jpg')" }}
      role="main"
    >
      <div className="glass-card w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">
            {getPageTitle()}
          </h1>
        </div>

        {successMessage && (
          <div role="status" className="mb-4 p-3 rounded-lg bg-green-600 bg-opacity-70 text-green-100 text-sm text-center">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleAuthAction} className="space-y-6" aria-describedby={error ? "form-error-message" : undefined}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 sr-only">{t('emailLabel')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EmailIcon className="w-5 h-5 text-neutral-400" />
              </div>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 !bg-neutral-800/80 !border-neutral-700 !text-neutral-100 placeholder-neutral-500 focus:!ring-primary focus:!border-primary"
                placeholder={t('emailLabel')} aria-label={t('emailLabel')}
                aria-invalid={!!(error && (error.includes(t('errorInvalidEmail')) || error.includes(t('errorUserNotFound'))))}
                aria-describedby={error && (error.includes(t('errorInvalidEmail')) || error.includes(t('errorUserNotFound'))) ? "form-error-message" : undefined}
              />
            </div>
          </div>

          {authMode !== 'forgotPassword' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 sr-only">{t('passwordLabel')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={authMode === 'signup' ? "new-password" : "current-password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 !bg-neutral-800/80 !border-neutral-700 !text-neutral-100 placeholder-neutral-500 focus:!ring-primary focus:!border-primary"
                  placeholder={t('passwordLabel')} aria-label={t('passwordLabel')}
                  aria-invalid={!!(error && (error.includes(t('errorWrongPassword')) || error.includes(t('errorWeakPassword'))))}
                  aria-describedby={error && (error.includes(t('errorWrongPassword')) || error.includes(t('errorWeakPassword'))) ? "form-error-message" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'forgotPassword' && !successMessage && (
            <p className="text-sm text-neutral-400 text-center">{t('forgotPasswordInstructions')}</p>
          )}

          {error && (
            <p id="form-error-message" role="alert" className="text-sm text-red-300 bg-red-800 bg-opacity-50 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary !py-3 !text-base !font-bold tracking-wide"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {getButtonText()}
                </span>
              ) : getButtonText()}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          {authMode === 'login' && (
            <>
              <button onClick={() => { setAuthMode('forgotPassword'); clearForm(); }} className="font-medium text-primary-light hover:text-primary-dark transition-colors">
                {t('forgotPasswordLink')}
              </button>
              <p className="mt-2 text-neutral-400">
                {t('dontHaveAccountLink')}{' '}
                <button onClick={() => { setAuthMode('signup'); clearForm(); }} className="font-medium text-primary-light hover:text-primary-dark transition-colors">
                  {t('signUpButton')}
                </button>
              </p>
            </>
          )}
          {authMode === 'signup' && (
            <p className="text-neutral-400">
              {t('alreadyHaveAccountLink')}{' '}
              <button onClick={() => { setAuthMode('login'); clearForm(); }} className="font-medium text-primary-light hover:text-primary-dark transition-colors">
                {t('signInButton')}
              </button>
            </p>
          )}
          {authMode === 'forgotPassword' && (
            <p className="text-neutral-400">
              <button onClick={() => { setAuthMode('login'); clearForm(); }} className="font-medium text-primary-light hover:text-primary-dark transition-colors">
                {t('backToLoginLink')}
              </button>
            </p>
          )}
        </div>
      </div>
      <footer className="absolute bottom-6 text-center w-full">
        <p className="text-xs text-neutral-400 bg-neutral-900 bg-opacity-30 px-2 py-1 rounded-md">
          Løpsloggen &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default LoginClient;
