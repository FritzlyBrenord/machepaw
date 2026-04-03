"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  Eye,
  Mail,
  Phone,
  Search,
  Shield,
  Store,
  Unlock,
  User,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  useAdminUsersQuery,
  useToggleUserBlockMutation,
  useUpdateUserRoleMutation,
} from "@/hooks/useAdminDirectory";
import type { AdminUser } from "@/data/types";
import { cn, formatPrice } from "@/lib/utils";

const roleConfig = {
  admin: {
    label: "Admin",
    icon: Shield,
    className: "bg-rose-100 text-rose-700",
  },
  seller: {
    label: "Vendeur",
    icon: Store,
    className: "bg-violet-100 text-violet-700",
  },
  customer: {
    label: "Client",
    icon: User,
    className: "bg-blue-100 text-blue-700",
  },
} as const;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const { data: users = [], isLoading } = useAdminUsersQuery();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const toggleBlockMutation = useToggleUserBlockMutation();

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        return matchesSearch && matchesRole;
      }),
    [roleFilter, search, users],
  );

  const changeRole = async (user: AdminUser, role: AdminUser["role"]) => {
    if (user.role === role) {
      return;
    }

    await updateRoleMutation.mutateAsync({
      userId: user.id,
      role,
    });
  };

  const toggleBlock = async (user: AdminUser) => {
    await toggleBlockMutation.mutateAsync({
      userId: user.id,
      isBlocked: !user.isBlocked,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Annuaire utilisateurs
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Donnees reelles du repertoire clients, vendeurs et administrateurs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {users.length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Clients</p>
            <p className="mt-2 text-2xl font-semibold text-blue-700">
              {users.filter((user) => user.role === "customer").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Vendeurs</p>
            <p className="mt-2 text-2xl font-semibold text-violet-700">
              {users.filter((user) => user.role === "seller").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">Bloques</p>
            <p className="mt-2 text-2xl font-semibold text-rose-700">
              {users.filter((user) => user.isBlocked).length}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un utilisateur"
                className="w-full rounded-xl border border-neutral-200 px-10 py-3 text-sm outline-none transition-colors focus:border-neutral-900"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition-colors focus:border-neutral-900"
            >
              <option value="">Tous les roles</option>
              <option value="customer">Clients</option>
              <option value="seller">Vendeurs</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-[0.18em] text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Commandes</th>
                  <th className="px-6 py-4">Depenses</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-sm text-neutral-500"
                    >
                      Chargement des utilisateurs...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-sm text-neutral-500"
                    >
                      Aucun utilisateur ne correspond aux filtres.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const RoleIcon = roleConfig[user.role].icon;

                    return (
                      <tr
                        key={user.id}
                        className={cn(
                          "hover:bg-neutral-50/80",
                          user.isBlocked && "opacity-70",
                        )}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-700">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {user.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-neutral-400" />
                              {user.email}
                            </div>
                            {user.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-neutral-400" />
                                {user.phone}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                              roleConfig[user.role].className,
                            )}
                          >
                            <RoleIcon className="w-3.5 h-3.5" />
                            {roleConfig[user.role].label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-neutral-900">
                          {user.ordersCount}
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-neutral-900">
                          {formatPrice(user.totalSpent, "HTG")}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                              user.isBlocked
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700",
                            )}
                          >
                            {user.isBlocked ? "Bloque" : "Actif"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => void toggleBlock(user)}
                              className={cn(
                                "rounded-xl border p-2 transition-colors",
                                user.isBlocked
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  : "border-rose-200 text-rose-700 hover:bg-rose-50",
                              )}
                            >
                              {user.isBlocked ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Detail utilisateur
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-neutral-50 p-5">
                  <p className="text-sm text-neutral-500">Commandes</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900">
                    {selectedUser.ordersCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-5">
                  <p className="text-sm text-neutral-500">Depenses</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900">
                    {formatPrice(selectedUser.totalSpent, "HTG")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Changer le role
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(["customer", "seller", "admin"] as const).map((role) => (
                    <Button
                      key={role}
                      variant={
                        selectedUser.role === role ? "primary" : "outline"
                      }
                      onClick={() => void changeRole(selectedUser, role)}
                      disabled={updateRoleMutation.isPending}
                    >
                      {roleConfig[role].label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Fermer
                </Button>
                <Button
                  onClick={() => void toggleBlock(selectedUser)}
                  className={
                    selectedUser.isBlocked
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }
                  disabled={toggleBlockMutation.isPending}
                >
                  {selectedUser.isBlocked ? "Debloquer" : "Bloquer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
