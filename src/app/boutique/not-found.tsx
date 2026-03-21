import Link from "next/link";

export default function SellerStoreNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 pt-28 pb-20">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-neutral-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">Boutique</p>
        <h1 className="mt-4 text-3xl font-semibold text-neutral-900">
          Cette boutique n&apos;est pas disponible
        </h1>
        <p className="mt-4 text-sm leading-7 text-neutral-500">
          Le lien boutique est peut-etre incorrect, ou bien le vendeur n&apos;a pas encore
          de boutique publique approuvee.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/collection"
            className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Voir la collection
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
