"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Store,
  Users,
} from "lucide-react";
import { SellerWorkspaceShell } from "@/components/SellerWorkspaceShell";
import { Button } from "@/components/ui/button";
import { useCurrentAccountQuery } from "@/hooks/useAccount";
import { useSellerCustomersQuery } from "@/hooks/useSellerWorkspace";
import { cn, formatDate } from "@/lib/utils";

const statusLabels: Record<"active" | "blocked", string> = {
  active: "Actif",
  blocked: "Bloque",
};

const statusClasses: Record<"active" | "blocked", string> = {
  active: "bg-emerald-100 text-emerald-800",
  blocked: "bg-rose-100 text-rose-800",
};

export default function SellerCustomersPage() {
  const { data: account } = useCurrentAccountQuery();
  const { data: customers = [], isLoading } = useSellerCustomersQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "blocked">(
    "",
  );

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const haystack = [
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        customer.lastOrderNumber,
        customer.defaultAddressSummary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      const matchesStatus = statusFilter
        ? customer.status === statusFilter
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const activeCustomers = customers.filter(
    (customer) => customer.status === "active",
  ).length;
  const blockedCustomers = customers.filter(
    (customer) => customer.status === "blocked",
  ).length;
  const withOrders = customers.filter(
    (customer) => customer.orderCount > 0,
  ).length;
  const recentCustomers = customers.filter((customer) => {
    const createdAt = new Date(customer.createdAt);
    const daysSinceCreated =
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 30;
  }).length;
  const seller = account?.seller;

  return (
    <SellerWorkspaceShell
      title="Clients boutique"
      description="Toutes les personnes inscrites dans votre boutique, avec leurs statuts, adresses et historique utile."
      actions={
        <>
          <Link href="/vendeur/commandes">
            <Button variant="outline">Voir les commandes</Button>
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clients inscrits"
          value={customers.length}
          icon={Users}
          tone="bg-neutral-900 text-white"
        />
        <StatCard
          label="Clients actifs"
          value={activeCustomers}
          icon={Store}
          tone="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Clients commandes"
          value={withOrders}
          icon={Package}
          tone="bg-sky-100 text-sky-700"
        />
        <StatCard
          label="Nouveaux 30j"
          value={recentCustomers}
          icon={Clock3}
          tone="bg-amber-100 text-amber-700"
        />
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom, email, telephone ou adresse"
              className="w-full rounded-xl border border-neutral-200 py-3 pl-11 pr-4 outline-none transition-colors focus:border-neutral-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | "active" | "blocked")
            }
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition-colors focus:border-neutral-900"
          >
            <option value="">Tous les clients</option>
            <option value="active">Actifs</option>
            <option value="blocked">Bloques</option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-neutral-900">
              Annuaire boutique
            </h2>
            <p className="text-sm text-neutral-500">
              Le seller voit ici uniquement les comptes clients lies a sa
              boutique.
            </p>
          </div>
          <p className="text-sm text-neutral-500">
            {filteredCustomers.length} resultat(s)
          </p>
        </div>

        {isLoading ? (
          <div className="px-6 py-10 text-sm text-neutral-500">
            Chargement des clients...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-neutral-500">
              Aucun client boutique ne correspond a votre recherche.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredCustomers.map((customer) => (
              <article key={customer.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <p className="text-lg font-semibold text-neutral-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {customer.email}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          statusClasses[customer.status],
                        )}
                      >
                        {statusLabels[customer.status]}
                      </span>
                    </div>

                    <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-2 xl:grid-cols-4">
                      <InfoItem
                        icon={Mail}
                        label="Email"
                        value={customer.email}
                      />
                      <InfoItem
                        icon={Phone}
                        label="Telephone"
                        value={customer.phone || "Non renseigne"}
                      />
                      <InfoItem
                        icon={Package}
                        label="Commandes"
                        value={`${customer.orderCount} commande(s)`}
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Adresses"
                        value={`${customer.addressCount} adresse(s)`}
                      />
                    </div>

                    <div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
                      <InfoItem
                        icon={Clock3}
                        label="Derniere connexion"
                        value={
                          customer.lastLoginAt
                            ? formatDate(customer.lastLoginAt)
                            : "Aucune"
                        }
                      />
                      <InfoItem
                        icon={Package}
                        label="Derniere commande"
                        value={
                          customer.lastOrderNumber
                            ? `${customer.lastOrderNumber} • ${customer.lastOrderAt ? formatDate(customer.lastOrderAt) : ""}`
                            : "Aucune commande"
                        }
                      />
                      <InfoItem
                        icon={MapPin}
                        label="Adresse principale"
                        value={
                          customer.defaultAddressSummary ||
                          "Aucune adresse principale"
                        }
                      />
                      <InfoItem
                        icon={Store}
                        label="Client depuis"
                        value={formatDate(customer.createdAt)}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 xl:w-72">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                      Resume boutique
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-neutral-600">
                      <p>
                        Statut:{" "}
                        <span className="font-medium text-neutral-900">
                          {statusLabels[customer.status]}
                        </span>
                      </p>
                      <p>
                        Commandes:{" "}
                        <span className="font-medium text-neutral-900">
                          {customer.orderCount}
                        </span>
                      </p>
                      <p>
                        Adresses:{" "}
                        <span className="font-medium text-neutral-900">
                          {customer.addressCount}
                        </span>
                      </p>
                      <p>
                        Derniere activite:{" "}
                        <span className="font-medium text-neutral-900">
                          {customer.lastLoginAt
                            ? formatDate(customer.lastLoginAt)
                            : "Aucune"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SellerWorkspaceShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className={cn("rounded-xl p-3", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          {label}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-neutral-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}
