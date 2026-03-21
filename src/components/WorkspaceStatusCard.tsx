"use client";

import type { ReactNode } from "react";

type WorkspaceStatusCardProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function WorkspaceStatusCard({
  title,
  description,
  actions,
}: WorkspaceStatusCardProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
        {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
