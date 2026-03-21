"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  UserRoundPlus,
} from "lucide-react";
import type { Address } from "@/data/types";
import { Button } from "@/components/ui/Button";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useBoutiqueStore } from "@/components/boutique/BoutiqueStoreProvider";
import { useStorefront } from "@/components/StorefrontProvider";
import {
  useAddBoutiqueClientAddressMutation,
  useBoutiqueClientAddressesQuery,
  useBoutiqueClientAvatarUploadMutation,
  useBoutiqueClientLoginMutation,
  useBoutiqueClientLogoutMutation,
  useBoutiqueClientOrdersQuery,
  useBoutiqueClientProfileMutation,
  useBoutiqueClientRegisterMutation,
  useBoutiqueClientSessionQuery,
  useDeleteBoutiqueClientAddressMutation,
  useUpdateBoutiqueClientAddressMutation,
} from "@/hooks/useBoutiqueClient";
import { getBoutiqueBasePath } from "@/lib/boutique";
import { cn, formatDate } from "@/lib/utils";

const tabs = [
  { id: "orders", label: "Mes commandes", icon: ShoppingBag },
  { id: "addresses", label: "Adresses", icon: MapPin },
  { id: "profile", label: "Profil", icon: User },
] as const;

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  processing: "En preparation",
  ready_for_pickup: "Prete a retirer",
  shipped: "Expediee",
  delivered: "Livree",
  cancelled: "Annulee",
  refunded: "Remboursee",
};

type TabId = (typeof tabs)[number]["id"];

export default function BoutiqueCustomerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const store = useBoutiqueStore();
  const { formatPrice } = useStorefront();
  const basePath = getBoutiqueBasePath(store.storeSlug);
  const redirectTarget =
    searchParams.get("redirect")?.startsWith("/")
      ? (searchParams.get("redirect") as string)
      : `${basePath}/client`;

  const { data: session, isLoading: sessionLoading } = useBoutiqueClientSessionQuery(store.storeSlug);
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useBoutiqueClientOrdersQuery(store.storeSlug, Boolean(session));
  const { data: addresses = [], isLoading: addressesLoading } = useBoutiqueClientAddressesQuery(
    store.storeSlug,
    Boolean(session),
  );

  const registerMutation = useBoutiqueClientRegisterMutation(store.storeSlug);
  const loginMutation = useBoutiqueClientLoginMutation(store.storeSlug);
  const logoutMutation = useBoutiqueClientLogoutMutation(store.storeSlug);
  const updateProfileMutation = useBoutiqueClientProfileMutation(store.storeSlug);
  const uploadAvatarMutation = useBoutiqueClientAvatarUploadMutation(store.storeSlug);
  const addAddressMutation = useAddBoutiqueClientAddressMutation(store.storeSlug);
  const updateAddressMutation = useUpdateBoutiqueClientAddressMutation(store.storeSlug);
  const deleteAddressMutation = useDeleteBoutiqueClientAddressMutation(store.storeSlug);

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState<TabId>("orders");
  const [message, setMessage] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!session) return;
    setProfileForm({
      firstName: session.customer.firstName,
      lastName: session.customer.lastName,
      email: session.customer.email,
      phone: session.customer.phone || "",
    });
    if (redirectTarget !== `${basePath}/client`) {
      router.replace(redirectTarget);
    } else if (pathname === `${basePath}/client`) {
      router.replace(`${basePath}/profil`);
    }
  }, [basePath, pathname, redirectTarget, router, session]);

  const editingAddress = addresses.find((address) => address.id === editingAddressId);

  const runWithMessage = async (callback: () => Promise<unknown>, success: string) => {
    setMessage(null);
    try {
      await callback();
      setMessage(success);
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation impossible.");
      return false;
    }
  };

  const saveAddress = async (address: Address) => {
    await runWithMessage(async () => {
      if (editingAddressId) {
        await updateAddressMutation.mutateAsync({ id: editingAddressId, address });
      } else {
        await addAddressMutation.mutateAsync(address);
      }
      setEditingAddressId(null);
      setShowAddressForm(false);
    }, "Adresse boutique enregistree.");
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-4xl animate-pulse rounded-[2rem] border border-neutral-200 bg-white p-10">
          <div className="h-8 w-56 rounded bg-neutral-200" />
          <div className="mt-5 h-4 w-full rounded bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#fbf8f3] px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-neutral-200 bg-white p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Client boutique</p>
              <h1 className="mt-4 text-4xl font-semibold text-neutral-900">
                Connexion et inscription pour {store.businessName}
              </h1>
              <p className="mt-4 text-neutral-500">
                Cette boutique a sa propre session client. Une fois connecte, vous pouvez gerer votre profil, vos adresses et vos commandes de cette boutique uniquement.
              </p>
              <div className="mt-8 flex gap-3">
                <Button variant={authMode === "login" ? "primary" : "outline"} onClick={() => setAuthMode("login")}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
                <Button variant={authMode === "register" ? "primary" : "outline"} onClick={() => setAuthMode("register")}>
                  <UserRoundPlus className="mr-2 h-4 w-4" />
                  Inscription
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-neutral-200 bg-neutral-50 p-6">
              {message ? <div className="mb-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">{message}</div> : null}
              {authMode === "login" ? (
                <form
                  className="space-y-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const success = await runWithMessage(
                      () => loginMutation.mutateAsync(loginForm),
                      "Connexion boutique reussie.",
                    );

                    if (success) {
                      router.replace(
                        redirectTarget !== `${basePath}/client`
                          ? redirectTarget
                          : `${basePath}/profil`,
                      );
                    }
                  }}
                >
                  <h2 className="text-2xl font-semibold text-neutral-900">Se connecter</h2>
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Email" type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} required />
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Mot de passe" type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} required />
                  <Button fullWidth isLoading={loginMutation.isPending}>Se connecter</Button>
                </form>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (registerForm.password !== registerForm.confirmPassword) {
                      setMessage("Les mots de passe ne correspondent pas.");
                      return;
                    }
                    const success = await runWithMessage(
                      () =>
                        registerMutation.mutateAsync({
                          firstName: registerForm.firstName,
                          lastName: registerForm.lastName,
                          email: registerForm.email,
                          phone: registerForm.phone,
                          password: registerForm.password,
                        }),
                      "Compte client boutique cree avec succes.",
                    );

                    if (success) {
                      router.replace(
                        redirectTarget !== `${basePath}/client`
                          ? redirectTarget
                          : `${basePath}/profil`,
                      );
                    }
                  }}
                >
                  <h2 className="text-2xl font-semibold text-neutral-900">Creer mon compte</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Prenom" value={registerForm.firstName} onChange={(event) => setRegisterForm((current) => ({ ...current, firstName: event.target.value }))} required />
                    <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Nom" value={registerForm.lastName} onChange={(event) => setRegisterForm((current) => ({ ...current, lastName: event.target.value }))} required />
                  </div>
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Email" type="email" value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} required />
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Telephone" value={registerForm.phone} onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Mot de passe" type="password" value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} required />
                    <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-900" placeholder="Confirmation" type="password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))} required />
                  </div>
                  <Button fullWidth isLoading={registerMutation.isPending}>Creer mon compte boutique</Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        {message ? <div className="mb-6 rounded-[1.5rem] border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-700">{message}</div> : null}
        {session.customer.status === "blocked" ? <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Votre compte client est bloque dans cette boutique. Le suivi reste visible, mais les nouvelles commandes sont suspendues.</div> : null}

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-[2rem] border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                    {session.customer.avatar ? <Image src={session.customer.avatar} alt={session.customer.firstName} fill className="object-cover" /> : <User className="h-8 w-8 text-neutral-400" />}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100"><Camera className="h-5 w-5 text-white" /></span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void runWithMessage(() => uploadAvatarMutation.mutateAsync(file), "Photo de profil mise a jour.");
                  }} />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{session.customer.firstName} {session.customer.lastName}</p>
                  <p className="text-sm text-neutral-500">{session.customer.email}</p>
                  <p className="mt-1 text-xs text-neutral-400">{store.businessName}</p>
                </div>
              </div>

              <nav className="mt-8 space-y-2">
                {tabs.map((tab) => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors", activeTab === tab.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900")}>
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 space-y-3 border-t border-neutral-100 pt-6">
                <Link href={`${basePath}/panier`} className="block">
                  <Button fullWidth variant="outline">Commander dans cette boutique</Button>
                </Link>
                <Button
                  fullWidth
                  variant="ghost"
                  isLoading={logoutMutation.isPending}
                  onClick={async () => {
                    const success = await runWithMessage(
                      () => logoutMutation.mutateAsync(),
                      "Deconnexion effectuee.",
                    );

                    if (success) {
                      router.replace(`${basePath}/client`);
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Deconnexion
                </Button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            {activeTab === "orders" ? (
              <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
                <h1 className="text-2xl font-semibold text-neutral-900">Mes commandes boutique</h1>
                <div className="mt-6 space-y-4">
                  {ordersError ? (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      {ordersError instanceof Error
                        ? ordersError.message
                        : "Impossible de charger vos commandes boutique."}
                    </div>
                  ) : null}
                  {ordersLoading ? (
                    <div className="rounded-[1.5rem] bg-neutral-50 p-6 text-sm text-neutral-500">Chargement des commandes...</div>
                  ) : orders.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
                      <Package className="mx-auto h-10 w-10 text-neutral-300" />
                      <p className="mt-4 text-neutral-500">Aucune commande pour cette boutique.</p>
                      <Link href={`${basePath}/collection`} className="mt-6 inline-flex"><Button>Voir les produits</Button></Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <article key={order.id} className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-neutral-900">{order.orderNumber || order.id}</p>
                            <p className="mt-1 text-sm text-neutral-500">{formatDate(order.createdAt)}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-400">
                              {order.fulfillmentMethod === "pickup" ? "Retrait en boutique" : "Livraison"}
                            </p>
                            <p className="mt-1 text-sm font-medium text-neutral-700">
                              {statusLabels[order.status] || order.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-neutral-900">{formatPrice(order.total)}</p>
                            <Link href={`${basePath}/commande/${order.orderNumber || order.id}`} className="mt-2 inline-flex text-sm font-medium text-neutral-700 underline underline-offset-4">Suivre cette commande</Link>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            ) : null}

            {activeTab === "addresses" ? (
              <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-2xl font-semibold text-neutral-900">Mes adresses boutique</h1>
                  <Button variant={showAddressForm ? "outline" : "primary"} onClick={() => { setEditingAddressId(null); setShowAddressForm((current) => !current); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showAddressForm ? "Annuler" : "Ajouter une adresse"}
                  </Button>
                </div>

                {showAddressForm ? (
                  <div className="mt-6">
                    <AddressForm
                      initialData={editingAddress || {}}
                      onSubmit={saveAddress}
                      onCancel={() => { setEditingAddressId(null); setShowAddressForm(false); }}
                      isSubmitting={addAddressMutation.isPending || updateAddressMutation.isPending}
                      title={editingAddressId ? "Modifier l'adresse" : "Nouvelle adresse"}
                    />
                  </div>
                ) : null}

                <div className="mt-6 space-y-4">
                  {addressesLoading ? <div className="rounded-[1.5rem] bg-neutral-50 p-6 text-sm text-neutral-500">Chargement des adresses...</div> : null}
                  {!addressesLoading && addresses.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center"><MapPin className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-4 text-neutral-500">Aucune adresse pour cette boutique.</p></div> : null}
                  {!addressesLoading ? addresses.map((address) => (
                    <article key={address.id} className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-neutral-900">{address.label || "Adresse boutique"}</p>
                            {address.isDefault ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">Par defaut</span> : null}
                          </div>
                          <p className="mt-2 text-sm text-neutral-600">{address.firstName} {address.lastName}</p>
                          <p className="text-sm text-neutral-600">{address.address}</p>
                          <p className="text-sm text-neutral-600">{[address.commune || address.city, address.department, address.country].filter(Boolean).join(", ")}</p>
                          {address.phone ? <p className="mt-1 text-sm text-neutral-600">{address.phone}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setEditingAddressId(address.id || null); setShowAddressForm(true); }} className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-900"><User className="h-4 w-4" /></button>
                          <button type="button" onClick={() => { const addressId = address.id; if (!addressId) return; void runWithMessage(() => deleteAddressMutation.mutateAsync(addressId), "Adresse supprimee."); }} className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:border-red-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </article>
                  )) : null}
                </div>
              </section>
            ) : null}

            {activeTab === "profile" ? (
              <section className="rounded-[2rem] border border-neutral-200 bg-white p-6">
                <h1 className="text-2xl font-semibold text-neutral-900">Mon profil boutique</h1>
                <form className="mt-6 max-w-2xl space-y-5" onSubmit={(event) => { event.preventDefault(); void runWithMessage(() => updateProfileMutation.mutateAsync({ firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone }), "Profil client boutique mis a jour."); }}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-900" placeholder="Prenom" value={profileForm.firstName} onChange={(event) => setProfileForm((current) => ({ ...current, firstName: event.target.value }))} required />
                    <input className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-900" placeholder="Nom" value={profileForm.lastName} onChange={(event) => setProfileForm((current) => ({ ...current, lastName: event.target.value }))} required />
                  </div>
                  <input className="w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-400 outline-none" value={profileForm.email} disabled />
                  <input className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-900" placeholder="Telephone" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
                  <Button type="submit" isLoading={updateProfileMutation.isPending}>Sauvegarder les modifications</Button>
                </form>
              </section>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
