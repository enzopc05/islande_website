'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [resetMode, setResetMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const upsertNewsletter = async (userId: string, userEmailValue: string) => {
    try {
      await supabase.from('newsletter_subscribers').upsert({
        user_id: userId,
        email: userEmailValue,
      });
    } catch (error) {
      // If RLS blocks this, user can still authenticate; admin can fix policy.
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage('Connexion impossible. Verifie email/mot de passe.');
      setIsLoading(false);
      return;
    }
    if (newsletterOptIn && data.user?.email) {
      await upsertNewsletter(data.user.id, data.user.email);
    }
    setMessage('Connecte.');
    setIsLoading(false);
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setMessage('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage('Inscription impossible.');
      setIsLoading(false);
      return;
    }
    if (newsletterOptIn && data.user?.email) {
      await upsertNewsletter(data.user.id, data.user.email);
    }
    setMessage('Compte cree. Verifie ton email.');
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage('Deconnecte.');
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage('Entre ton email pour reinitialiser.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      setMessage('Impossible d envoyer le lien.');
    } else {
      setMessage('Email de reinitialisation envoye.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-sans uppercase tracking-[0.6em] text-[#00BCD4] mb-4 block">
              Auth
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-6 tracking-tighter">
              Connexion
            </h1>
            <p className="text-sm font-editorial text-white/40 italic">
              Connecte-toi pour liker et commenter les photos.
            </p>
          </div>

          <div className="border border-white/10 bg-white/5 p-8">
            {userEmail ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans">Connecte</p>
                  <p className="text-white/70 text-sm">{userEmail}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/40 transition-all text-[10px] uppercase tracking-wider"
                >
                  Se deconnecter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] transition-all"
                />
                {!resetMode && (
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] transition-all"
                  />
                )}

                <label className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-wider font-sans">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="accent-[#00BCD4]"
                  />
                  Newsletter
                </label>

                <div className="flex gap-3">
                  {resetMode ? (
                    <button
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-[#00BCD4] text-black text-[10px] uppercase tracking-[0.4em] font-sans font-bold disabled:opacity-50"
                    >
                      Envoyer lien
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSignIn}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-[#00BCD4] text-black text-[10px] uppercase tracking-[0.4em] font-sans font-bold disabled:opacity-50"
                      >
                        Se connecter
                      </button>
                      <button
                        onClick={handleSignUp}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/40 transition-all text-[10px] uppercase tracking-[0.4em] font-sans disabled:opacity-50"
                      >
                        S inscrire
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setResetMode((prev) => !prev)}
                  className="text-[10px] text-white/50 uppercase tracking-wider font-sans hover:text-white transition-colors"
                >
                  {resetMode ? 'Retour connexion' : 'Mot de passe oublie'}
                </button>
              </div>
            )}

            {message && (
              <p className="mt-4 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                {message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
