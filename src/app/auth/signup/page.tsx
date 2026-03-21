"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      });
      setIsSuccess(true);
      // Wait a bit then redirect or show message
      setTimeout(() => {
        router.push("/auth/login?redirect=" + redirectTo);
      }, 3000);
    } catch (err: any) {
      setAuthError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || "Erreur Google login");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-light text-neutral-900 mb-4">Vérifiez vos emails</h2>
          <p className="text-neutral-500 mb-8">
            Nous avons envoyé un lien de confirmation à <span className="font-medium text-neutral-900">{email}</span>. 
            Veuillez cliquer sur le lien pour activer votre compte.
          </p>
          <Link href="/auth/login" className="text-neutral-900 font-medium hover:underline">
            Retour à la connexion
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"
          alt="Luxe Fashion"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-light tracking-[0.2em] mb-6">LUXE</h2>
            <p className="text-xl font-light max-w-md mx-auto leading-relaxed opacity-90">
              Créez votre compte et profitez d'une expérience shopping personnalisée.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-12"
        >
          <div className="mb-10 lg:hidden">
            <h1 className="text-2xl font-light tracking-[0.2em] text-neutral-900">LUXE</h1>
          </div>

          <h2 className="text-3xl font-light text-neutral-900 mb-2">Créer un compte</h2>
          <p className="text-neutral-500 mb-8">Rejoignez-nous pour une expérience exclusive.</p>

          {authError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm mb-6 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {authError}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Prénom</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 font-light" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-300"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Nom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 font-light" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-300"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 font-light" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 font-light" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-neutral-200 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-neutral-400 leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <Link href="/terms" className="text-neutral-900 underline">Conditions d'utilisation</Link> et notre{" "}
              <Link href="/privacy" className="text-neutral-900 underline">Politique de confidentialité</Link>.
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-6"
            >
              Créer mon compte
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-400">Ou s'inscrire avec</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-neutral-700 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.73 0 3.28.6 4.5 1.76l3.33-3.33C17.81 1.53 15.09.5 12 .5 7.42.5 3.5 3.1 1.5 6.94l3.88 3.01C6.27 7.04 8.91 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.88 3c2.26-2.09 3.54-5.17 3.54-8.82z"
              />
              <path
                fill="#FBBC05"
                d="M5.38 14.95c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.5 7.32c-.81 1.62-1.27 3.44-1.27 5.3s.46 3.68 1.27 5.3l3.88-3.02z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.15 0 5.79-1.04 7.72-2.82l-3.88-3c-1.06.71-2.41 1.13-3.84 1.13-3 0-5.54-2.03-6.44-4.76L1.5 16.96c2 3.84 5.92 6.54 10.5 6.54z"
              />
            </svg>
            Google
          </button>

          <p className="mt-10 text-center text-neutral-500">
            Vous avez déjà un compte ?{" "}
            <Link href={`/auth/login?redirect=${redirectTo}`} className="text-neutral-900 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
