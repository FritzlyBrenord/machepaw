"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { fetchCurrentAccount, useCurrentAccountQuery } from "@/hooks/useAccount";
import {
  isSellerFlowRedirect,
  resolvePostAuthRedirect,
  sanitizeAuthRedirect,
} from "@/lib/authRedirect";

const highlights = [
  {
    title: "Compte unique",
    text: "Un seul identifiant pour votre profil client et votre futur espace vendeur.",
  },
  {
    title: "Parcours fluide",
    text: "Apres inscription, le site verifie votre etat de compte et vous redirige proprement.",
  },
  {
    title: "Support premium",
    text: "Une inscription rassurante, propre et adaptee au mobile comme au desktop.",
  },
];

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => sanitizeAuthRedirect(searchParams.get("redirect"), "/"),
    [searchParams],
  );
  const sellerFlow = isSellerFlowRedirect(redirectTo);
  const { data: account, isLoading: isAccountLoading } = useCurrentAccountQuery();

  useEffect(() => {
    const queryError = searchParams.get("error");
    if (queryError === "oauth") {
      setAuthError("La connexion Google a echoue. Reessayez.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isAccountLoading && account) {
      router.replace(resolvePostAuthRedirect(account, redirectTo));
    }
  }, [account, isAccountLoading, redirectTo, router]);

  useEffect(() => {
    if (!isSuccess) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [isSuccess, redirectTo, router]);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      });

      if (result?.session) {
        const currentAccount = await fetchCurrentAccount().catch(() => null);
        router.push(resolvePostAuthRedirect(currentAccount, redirectTo));
        return;
      }

      setIsSuccess(true);
    } catch (error: any) {
      setAuthError(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle(redirectTo);
    } catch (error: any) {
      setAuthError(error.message || "Connexion Google impossible");
    }
  };

  const busy = isSubmitting || authLoading;

  if (isSuccess) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#050816] text-white flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_34%),linear-gradient(180deg,_#08111f_0%,_#04070d_100%)]" />
        <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-10 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/12 text-emerald-200">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.45em] text-emerald-200/80">Compte cree</p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-playfair)" }}>
              Verifiez votre email
            </h2>
            <p className="mt-4 text-base leading-8 text-white/66">
              Nous avons envoye un lien de confirmation a{" "}
              <span className="font-semibold text-white">{email}</span>. Confirmez
              votre email, puis reconnectez-vous pour continuer.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <Mail className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-sm text-white/60">1. Ouvrez le message de confirmation.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <ShieldCheck className="h-5 w-5 text-sky-300" />
                <p className="mt-3 text-sm text-white/60">2. Validez votre email et securisez votre compte.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <Store className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 text-sm text-white/60">
                  3. Reconnectez-vous pour acceder a votre parcours boutique.
                </p>
              </div>
            </div>

            {sellerFlow ? (
              <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
                Votre parcours vise l&apos;espace vendeur. Si votre compte seller
                n&apos;est pas encore approuve, le systeme vous orientera vers
                <span className="font-semibold"> Devenir vendeur</span> apres connexion.
              </div>
            ) : null}

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-200"
              >
                Aller a la connexion
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Retour a l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_30%),radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,_#08111f_0%,_#04070d_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[0.98fr_1.02fr]">
        <div className="hidden lg:flex flex-col justify-between px-10 xl:px-16 py-10 border-r border-white/8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-sm font-semibold tracking-[0.35em]">
              L
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">LUXE</p>
              <p className="text-sm text-white/60">Creer ma boutique</p>
            </div>
          </Link>

          <div className="max-w-xl pt-10">
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.45em] text-amber-200/80">
              Inscription
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-5 text-5xl xl:text-6xl font-semibold leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Creez un compte, puis ouvrez votre boutique.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-6 max-w-xl text-base xl:text-lg text-white/66 leading-8"
            >
              L&apos;inscription reste simple. Vous creez votre compte, vous
              confirmez votre email, puis vous continuez vers le bon parcours
              vendeur ou client.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {highlights.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-300" />
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/60">{item.text}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <p className="mt-4 text-sm text-white/60">Vos acces sont verifies avant toute entree dans l&apos;espace vendeur.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <Store className="h-5 w-5 text-sky-300" />
              <p className="mt-4 text-sm text-white/60">Si votre seller est approuve, vous serez redirige vers votre boutique.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <p className="mt-4 text-sm text-white/60">Une inscription plus claire pour un lancement plus serin.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl py-4 lg:py-10">
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-sm font-semibold tracking-[0.35em]">
                L
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">LUXE</p>
                <p className="text-sm text-white/55">Inscription premium</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
                    {sellerFlow ? "Parcours vendeur" : "Nouveau compte"}
                  </p>
                  <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-white">
                    {sellerFlow ? "Creez votre acces boutique" : "Creer un compte"}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-white/62 leading-7">
                    {sellerFlow
                      ? "Votre compte utilisateur est le point de depart avant la verification vendeur."
                      : "Rejoignez la plateforme avec un profil simple, clair et securise."}
                  </p>
                </div>
                <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                  <UserCircle className="h-6 w-6 text-white/72" />
                </div>
              </div>

              {sellerFlow ? (
                <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
                  Apres inscription et connexion, le site verifiera si votre compte
                  seller existe deja et est approuve. Sinon, vous passerez par
                  <span className="font-semibold"> Devenir vendeur</span> pour finaliser la demande.
                </div>
              ) : null}

              {authError ? (
                <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                  {authError}
                </div>
              ) : null}

              <form onSubmit={handleSignup} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/82">Prenom</label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Jean"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-white/28 focus:border-amber-300/60 focus:bg-white/10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/82">Nom</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Pierre"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-white/28 focus:border-amber-300/60 focus:bg-white/10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/82">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="votre@email.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-white/28 focus:border-amber-300/60 focus:bg-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/82">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-white/28 focus:border-amber-300/60 focus:bg-white/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-xs leading-6 text-white/52">
                  En creant votre compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialite.
                </div>

                <Button type="submit" variant="white" fullWidth size="lg" isLoading={busy} className="mt-2 gap-2">
                  Creer mon compte
                  {!busy ? <ArrowRight className="h-5 w-5" /> : null}
                </Button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-[0.35em] text-white/32">Ou s'inscrire avec</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 5.04c1.73 0 3.28.6 4.5 1.76l3.33-3.33C17.81 1.53 15.09.5 12 .5 7.42.5 3.5 3.1 1.5 6.94l3.88 3.01C6.27 7.04 8.91 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.88 3c2.26-2.09 3.54-5.17 3.54-8.82z" />
                  <path fill="#FBBC05" d="M5.38 14.95c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.5 7.32c-.81 1.62-1.27 3.44-1.27 5.3s.46 3.68 1.27 5.3l3.88-3.02z" />
                  <path fill="#34A853" d="M12 23.5c3.15 0 5.79-1.04 7.72-2.82l-3.88-3c-1.06.71-2.41 1.13-3.84 1.13-3 0-5.54-2.03-6.44-4.76L1.5 16.96c2 3.84 5.92 6.54 10.5 6.54z" />
                </svg>
                Continuer avec Google
              </button>

              <p className="mt-7 text-center text-sm text-white/55">
                Vous avez deja un compte ?{" "}
                <Link
                  href={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
                  className="font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
