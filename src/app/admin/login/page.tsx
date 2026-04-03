"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchCurrentAccount,
  useCurrentAccountQuery,
} from "@/hooks/useAccount";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Connexion admin impossible.";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/admin";
  const { data: account, isLoading: isAccountLoading } =
    useCurrentAccountQuery();

  useEffect(() => {
    if (!isAccountLoading && account?.role === "admin") {
      router.replace(redirectTo);
    }
  }, [account, isAccountLoading, router, redirectTo]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn(email, password);
      const account = await fetchCurrentAccount();

      if (account?.role !== "admin" || account.isBlocked) {
        await supabase.auth.signOut();
        throw new Error(
          "Ce compte ne dispose pas d'un acces administrateur valide.",
        );
      }

      router.push(redirectTo);
    } catch (submissionError: unknown) {
      setError(getErrorMessage(submissionError));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg"
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-900">
            Connexion admin
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Authentification reservee aux comptes admin verifies.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Email admin
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-colors focus:border-neutral-900"
                placeholder="admin@votresite.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-12 outline-none transition-colors focus:border-neutral-900"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Acceder au back-office
          </Button>
        </form>

        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs leading-5 text-neutral-500">
          Aucun identifiant de demonstration n&apos;est accepte ici. Le compte
          doit exister dans Supabase avec le role `admin`.
        </div>
      </motion.div>
    </div>
  );
}
