"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { fetchCurrentAccount, useCurrentAccountQuery } from "@/hooks/useAccount";
import Image from "next/image";
import { useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { data: account, isLoading: isAccountLoading } = useCurrentAccountQuery();

  useEffect(() => {
    if (!isAccountLoading && account) {
      if (account.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace(redirectTo);
      }
    }
  }, [account, isAccountLoading, router, redirectTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await signIn(email, password);
      const acc = await fetchCurrentAccount();
      if (acc?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      setAuthError(err.message || "Erreur de connexion");
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

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000"
          alt="Luxe Lifestyle"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-5xl font-light tracking-[0.2em] mb-6">LUXE</h2>
            <p className="text-xl font-light max-w-md mx-auto leading-relaxed opacity-90">
              Rejoignez l'univers de l'exception. Accédez à vos commandes et coups de cœur.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden">
            <h1 className="text-2xl font-light tracking-[0.2em] text-neutral-900">LUXE</h1>
          </div>

          <h2 className="text-3xl font-light text-neutral-900 mb-2">Bon retour</h2>
          <p className="text-neutral-500 mb-8">Connectez-vous pour continuer votre shopping.</p>

          {authError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm mb-6 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {authError}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
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
              <div className="flex justify-between">
                <label className="text-sm font-medium text-neutral-700">Mot de passe</label>
                <Link href="/auth/forgot-password" className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
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

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-4"
            >
              Se connecter
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-neutral-400">Ou continuer avec</span>
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
            Pas encore de compte ?{" "}
            <Link href={`/auth/signup?redirect=${redirectTo}`} className="text-neutral-900 font-medium hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
