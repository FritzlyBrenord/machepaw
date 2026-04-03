"use client";

import { useState } from "react";
import {
  BadgeInfo,
  CreditCard,
  Download,
  MapPin,
  Package,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/data/types";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
import {
  type StorefrontSectionStoreData,
} from "@/lib/storefront-section-data";
import { formatDate, formatPrice } from "@/lib/utils";

const pickupReceiptReadyStatuses = new Set([
  "confirmed",
  "processing",
  "ready_for_pickup",
  "delivered",
]);

const orderStatusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  processing: "En preparation",
  ready_for_pickup: "Prete a retirer",
  shipped: "Expediee",
  delivered: "Livree",
  cancelled: "Annulee",
  refunded: "Remboursee",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirme",
  paid: "Paye",
  failed: "Echoue",
  refunded: "Rembourse",
};

type ReceiptData = {
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  orderDate: string;
  updatedDate: string;
  fulfillmentLabel: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderSubtotal: number;
  shipping: number;
  tax: number;
  total: number;
  storeReference: string;
  storeName: string;
  storeAddressLines: string[];
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  note: string;
};

const RECEIPT_WRAP_LIMIT = 42;
const RECEIPT_PDF_WIDTH = 595;
const RECEIPT_PDF_MARGIN = 28;

function toAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

function pdfEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapReceiptText(value: string, maxChars = RECEIPT_WRAP_LIMIT) {
  const normalized = toAscii(value).replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      if (word.length <= maxChars) {
        current = word;
        continue;
      }

      for (let index = 0; index < word.length; index += maxChars) {
        const chunk = word.slice(index, index + maxChars);
        if (chunk.length === maxChars) {
          lines.push(chunk);
        } else {
          current = chunk;
        }
      }
      continue;
    }

    const candidate = `${current} ${word}`;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    lines.push(current);
    if (word.length <= maxChars) {
      current = word;
      continue;
    }

    for (let index = 0; index < word.length; index += maxChars) {
      const chunk = word.slice(index, index + maxChars);
      if (chunk.length === maxChars) {
        lines.push(chunk);
      } else {
        current = chunk;
      }
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function estimatePdfTextWidth(text: string, fontSize: number) {
  return toAscii(text).length * fontSize * 0.52;
}

function buildReceiptData(store: StorefrontSectionStoreData, order: Order): ReceiptData {
  const orderNumber = order.orderNumber || order.id;
  const clientName =
    `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim();
  const clientPhone = order.shippingAddress.phone || "Non renseigne";
  const orderSubtotal = order.subtotal ?? order.total - order.shipping - order.tax;
  const paymentMethod = getSellerPaymentMethodLabel(order.paymentMethod);
  const paymentStatus =
    (order.paymentStatus && paymentStatusLabels[order.paymentStatus]) ||
    order.paymentStatus ||
    "En attente";
  const orderStatus = orderStatusLabels[order.status] || order.status;
  const storeReference = store.storeSlug ? store.storeSlug.toUpperCase() : "SANS-REFERENCE";

  const storeAddressLines = [
    store.locationName,
    store.pickupAddress?.address,
    [store.pickupAddress?.city, store.locationDept].filter(Boolean).join(", ") || undefined,
    store.pickupAddress?.country,
    store.pickupAddress?.phone ? `Tel: ${store.pickupAddress.phone}` : undefined,
  ].filter((line): line is string => Boolean(line));

  const items = order.items.map((item) => ({
    name: item.product.name,
    sku: item.sku || item.product.sku || "",
    quantity: item.quantity,
    unitPrice: item.price,
    total: item.total ?? item.price * item.quantity,
  }));

  return {
    orderNumber,
    clientName,
    clientPhone,
    orderDate: formatDate(order.createdAt),
    updatedDate: formatDate(order.updatedAt),
    fulfillmentLabel: order.fulfillmentMethod === "pickup" ? "Retrait en boutique" : "Livraison",
    orderStatus,
    paymentMethod,
    paymentStatus,
    orderSubtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
    storeReference,
    storeName: store.businessName || "Boutique",
    storeAddressLines,
    items,
    note:
      "NB: Presentez ce recu directement au magasin lors du retrait. Sans ce document, le retrait peut etre retarde.",
  };
}

function measureReceiptLayout(data: ReceiptData) {
  const addressLineCount = Math.max(data.storeAddressLines.length, 4);
  const infoHeight = Math.max(118, 42 + addressLineCount * 15);
  const itemRows = data.items.map((item) => {
    const lines = wrapReceiptText(item.name, RECEIPT_WRAP_LIMIT);
    const height = Math.max(36, 14 + lines.length * 12);
    return { lines, height };
  });
  const itemsHeight = 34 + itemRows.reduce((sum, row) => sum + row.height, 0);
  const summaryHeight = 126;
  const noteHeight = 60;
  const footerHeight = 20;
  const pageHeight = Math.max(
    1000,
    RECEIPT_PDF_MARGIN * 2 +
      92 +
      16 +
      infoHeight +
      16 +
      itemsHeight +
      16 +
      summaryHeight +
      16 +
      noteHeight +
      18 +
      footerHeight,
  );

  return {
    infoHeight,
    itemRows,
    itemsHeight,
    noteHeight,
    pageHeight,
    footerHeight,
    summaryHeight,
  };
}

function buildPickupReceiptPdfBlob(store: StorefrontSectionStoreData, order: Order) {
  const data = buildReceiptData(store, order);
  const layout = measureReceiptLayout(data);
  const pageWidth = RECEIPT_PDF_WIDTH;
  const pageHeight = layout.pageHeight;
  const contentWidth = pageWidth - RECEIPT_PDF_MARGIN * 2;
  const columnGap = 14;
  const infoColumnWidth = (contentWidth - columnGap) / 2;
  const tableNameWidth = 228;
  const tableQtyWidth = 44;
  const tableUnitWidth = 86;
  const ops: string[] = [];

  const drawRect = (
    x: number,
    top: number,
    width: number,
    height: number,
    fill: [number, number, number] = [1, 1, 1],
    stroke: [number, number, number] = [0.86, 0.86, 0.86],
  ) => {
    const y = pageHeight - top - height;
    ops.push(`${fill[0]} ${fill[1]} ${fill[2]} rg`);
    ops.push(`${stroke[0]} ${stroke[1]} ${stroke[2]} RG`);
    ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re B`);
  };

  const drawLine = (
    x1: number,
    top: number,
    x2: number,
    stroke: [number, number, number] = [0.89, 0.89, 0.89],
  ) => {
    const y = pageHeight - top;
    ops.push(`${stroke[0]} ${stroke[1]} ${stroke[2]} RG`);
    ops.push(`1 w ${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`);
  };

  const drawText = (
    x: number,
    top: number,
    value: string,
    size: number,
    bold = false,
    align: "left" | "center" | "right" = "left",
    color: [number, number, number] = [0.06, 0.09, 0.15],
  ) => {
    const text = pdfEscape(toAscii(value));
    const widthEstimate = estimatePdfTextWidth(value, size);
    let drawX = x;

    if (align === "center") {
      drawX = x - widthEstimate / 2;
    } else if (align === "right") {
      drawX = x - widthEstimate;
    }

    const baseline = pageHeight - top - size;
    ops.push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg ${drawX.toFixed(2)} ${baseline.toFixed(2)} Td (${text}) Tj ET`,
    );
  };

  const drawLines = (
    x: number,
    top: number,
    lines: string[],
    size: number,
    bold = false,
    color: [number, number, number] = [0.06, 0.09, 0.15],
    lineHeight = size + 4,
  ) => {
    lines.forEach((line, index) => {
      drawText(x, top + index * lineHeight, line, size, bold, "left", color);
    });
  };

  let cursorY = RECEIPT_PDF_MARGIN;

  drawRect(
    RECEIPT_PDF_MARGIN,
    cursorY,
    contentWidth,
    88,
    [0.99, 0.97, 0.93],
    [0.90, 0.74, 0.32],
  );
  drawText(RECEIPT_PDF_MARGIN + 18, cursorY + 18, `Boutique ${data.storeReference}`, 9, true, "left", [0.76, 0.45, 0.08]);
  drawText(RECEIPT_PDF_MARGIN + 18, cursorY + 38, data.storeName, 22, true);
  drawText(RECEIPT_PDF_MARGIN + 18, cursorY + 62, `Fiche de retrait - ${data.orderNumber}`, 11, false, "left", [0.30, 0.36, 0.44]);

  const badgeWidth = 154;
  drawRect(pageWidth - RECEIPT_PDF_MARGIN - badgeWidth, cursorY + 18, badgeWidth, 30, [1, 1, 1], [0.90, 0.74, 0.32]);
  drawText(
    pageWidth - RECEIPT_PDF_MARGIN - badgeWidth / 2,
    cursorY + 27,
    "Retrait en boutique",
    10,
    true,
    "center",
    [0.76, 0.45, 0.08],
  );

  cursorY += 88 + 16;

  drawRect(RECEIPT_PDF_MARGIN, cursorY, infoColumnWidth, layout.infoHeight);
  drawRect(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap, cursorY, infoColumnWidth, layout.infoHeight);
  drawText(RECEIPT_PDF_MARGIN + 14, cursorY + 16, "Adresse de la boutique", 9, true, "left", [0.49, 0.55, 0.64]);
  drawText(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14, cursorY + 16, "Client", 9, true, "left", [0.49, 0.55, 0.64]);
  drawLines(RECEIPT_PDF_MARGIN + 14, cursorY + 36, data.storeAddressLines, 11, false, [0.18, 0.24, 0.31], 15);
  drawText(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14, cursorY + 36, data.clientName, 12, true);
  drawLines(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + 56,
    [data.clientPhone, `Commande passee le ${data.orderDate}`, `Mise a jour le ${data.updatedDate}`],
    10,
    false,
    [0.32, 0.39, 0.46],
    14,
  );

  cursorY += layout.infoHeight + 16;

  drawRect(RECEIPT_PDF_MARGIN, cursorY, contentWidth, 30, [0.98, 0.98, 0.98]);
  drawText(RECEIPT_PDF_MARGIN + 14, cursorY + 10, "Articles commandes", 9, true, "left", [0.49, 0.55, 0.64]);
  drawRect(RECEIPT_PDF_MARGIN, cursorY + 30, contentWidth, 28, [0.97, 0.97, 0.97]);
  drawText(RECEIPT_PDF_MARGIN + 12, cursorY + 40, "Produit", 9, true, "left", [0.49, 0.55, 0.64]);
  drawText(RECEIPT_PDF_MARGIN + tableNameWidth + 6, cursorY + 40, "Qt", 9, true, "center", [0.49, 0.55, 0.64]);
  drawText(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + 8, cursorY + 40, "PU", 9, true, "center", [0.49, 0.55, 0.64]);
  drawText(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + tableUnitWidth + 8, cursorY + 40, "Total", 9, true, "center", [0.49, 0.55, 0.64]);

  let itemTop = cursorY + 58;
  data.items.forEach((item, index) => {
    const row = layout.itemRows[index];
    const rowHeight = row.height;
    drawLine(RECEIPT_PDF_MARGIN, itemTop + rowHeight, RECEIPT_PDF_MARGIN + contentWidth);
    drawText(RECEIPT_PDF_MARGIN + 12, itemTop + 10, row.lines[0], 10, true);
    row.lines.slice(1).forEach((line, lineIndex) => {
      drawText(RECEIPT_PDF_MARGIN + 12, itemTop + 22 + lineIndex * 12, line, 9, false, "left", [0.32, 0.39, 0.46]);
    });
    if (item.sku) {
      drawText(RECEIPT_PDF_MARGIN + 12, itemTop + rowHeight - 10, `SKU: ${item.sku}`, 8, false, "left", [0.44, 0.50, 0.58]);
    }
    drawText(RECEIPT_PDF_MARGIN + tableNameWidth + 6, itemTop + 18, String(item.quantity), 10, false, "center");
    drawText(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + 6, itemTop + 18, formatPrice(item.unitPrice, order.currency || "HTG"), 10, false, "center");
    drawText(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + tableUnitWidth + 6, itemTop + 18, formatPrice(item.total, order.currency || "HTG"), 10, true, "center");
    itemTop += rowHeight;
  });

  cursorY = itemTop + 12;

  drawRect(RECEIPT_PDF_MARGIN, cursorY, infoColumnWidth, layout.summaryHeight);
  drawRect(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap, cursorY, infoColumnWidth, layout.summaryHeight);
  drawText(RECEIPT_PDF_MARGIN + 14, cursorY + 16, "Informations de suivi", 9, true, "left", [0.49, 0.55, 0.64]);
  drawLines(
    RECEIPT_PDF_MARGIN + 14,
    cursorY + 36,
    [
      `Statut commande: ${data.orderStatus}`,
      `Statut paiement: ${data.paymentStatus}`,
      `Methode paiement: ${data.paymentMethod}`,
      `Type: ${data.fulfillmentLabel}`,
    ],
    10,
    false,
    [0.18, 0.24, 0.31],
    14,
  );

  drawText(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14, cursorY + 16, "Montants", 9, true, "left", [0.49, 0.55, 0.64]);
  drawLines(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + 38,
    [
      `Sous-total: ${formatPrice(data.orderSubtotal, order.currency || "HTG")}`,
      `Livraison: ${formatPrice(data.shipping, order.currency || "HTG")}`,
      `Taxes: ${formatPrice(data.tax, order.currency || "HTG")}`,
    ],
    10,
    false,
    [0.18, 0.24, 0.31],
    14,
  );
  drawText(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + layout.summaryHeight - 26,
    `Total: ${formatPrice(data.total, order.currency || "HTG")}`,
    13,
    true,
  );

  cursorY += layout.summaryHeight + 16;

  drawRect(RECEIPT_PDF_MARGIN, cursorY, contentWidth, layout.noteHeight, [1, 0.98, 0.91], [0.85, 0.52, 0.09]);
  drawText(RECEIPT_PDF_MARGIN + 14, cursorY + 14, "NB", 9, true, "left", [0.70, 0.39, 0.06]);
  drawLines(RECEIPT_PDF_MARGIN + 14, cursorY + 30, wrapReceiptText(data.note, 78), 10, false, [0.56, 0.29, 0.05], 13);

  cursorY += layout.noteHeight + 16;

  drawText(
    RECEIPT_PDF_MARGIN,
    cursorY + 6,
    `Client: ${data.clientName} | Boutique: ${data.storeName} | Recu genere le ${formatDate(new Date().toISOString())}`,
    8,
    false,
    "left",
    [0.44, 0.50, 0.58],
  );

  const content = ["1 0 0 1 0 0 cm", ...ops].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n%Codex\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function canShowPickupReceipt(order: Order) {
  return order.fulfillmentMethod === "pickup" && pickupReceiptReadyStatuses.has(order.status);
}

export function PickupReceipt({
  store,
  order,
}: {
  store: StorefrontSectionStoreData;
  order: Order;
}) {
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const receiptReady = canShowPickupReceipt(order);
  const orderNumber = order.orderNumber || order.id;

  const handlePdfDownload = async () => {
    setExportError(null);
    setExporting(true);

    try {
      const pdfBlob = buildPickupReceiptPdfBlob(store, order);
      downloadBlob(pdfBlob, `fiche-retrait-${orderNumber}.pdf`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setExporting(false);
    }
  };

  if (!receiptReady) {
    return (
      <section className="rounded-[2rem] border border-amber-200 bg-amber-50/60 p-6">
        <div className="flex items-start gap-3">
          <BadgeInfo className="mt-0.5 h-5 w-5 text-amber-700" />
          <div>
            <h3 className="text-lg font-semibold text-amber-950">Fiche de retrait</h3>
            <p className="mt-1 text-sm text-amber-800">
              La fiche de retrait sera disponible une fois que la commande aura ete confirmee.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const data = buildReceiptData(store, order);

  return (
    <section className="rounded-[2rem] border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Fiche de retrait</p>
            <h3 className="mt-2 text-xl font-semibold text-neutral-950">
              A presenter au magasin
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Cette fiche regroupe l&apos;adresse de la boutique, les informations de la commande et le statut de paiement.
            </p>
          </div>
        </div>

        <div className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900">
          {data.orderNumber}
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Boutique</p>
            <p className="mt-2 text-lg font-semibold text-neutral-950">{data.storeName}</p>
            <p className="mt-1 text-sm text-neutral-600">Ref: {data.storeReference}</p>
            <div className="mt-4 space-y-1 text-sm text-neutral-600">
              {data.storeAddressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="rounded-[1.25rem] bg-neutral-50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">Client</p>
            <p className="mt-2 text-lg font-semibold text-neutral-950">{data.clientName}</p>
            <p className="mt-1 text-sm text-neutral-600">{data.clientPhone}</p>
            <p className="mt-4 text-sm text-neutral-600">Commande passee le {data.orderDate}</p>
            <p className="mt-1 text-sm text-neutral-600">Mise a jour le {data.updatedDate}</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-neutral-200">
          <div className="grid grid-cols-12 bg-neutral-50 px-4 py-3 text-xs uppercase tracking-[0.22em] text-neutral-400">
            <div className="col-span-6">Produit</div>
            <div className="col-span-2 text-center">Qt</div>
            <div className="col-span-2 text-right">PU</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {data.items.map((item) => (
            <div
              key={`${item.name}-${item.sku}-${item.quantity}`}
              className="grid grid-cols-12 border-t border-neutral-100 px-4 py-4 text-sm"
            >
              <div className="col-span-6">
                <p className="font-semibold text-neutral-950">{item.name}</p>
                {item.sku ? <p className="mt-1 text-xs text-neutral-500">SKU: {item.sku}</p> : null}
              </div>
              <div className="col-span-2 text-center text-neutral-700">{item.quantity}</div>
              <div className="col-span-2 text-right text-neutral-700">
                {formatPrice(item.unitPrice, order.currency || "HTG")}
              </div>
              <div className="col-span-2 text-right font-semibold text-neutral-950">
                {formatPrice(item.total, order.currency || "HTG")}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[1.25rem] border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Package className="h-4 w-4" />
              Informations de suivi
            </div>
            <div className="mt-3 space-y-2 text-sm text-neutral-600">
              <p>Statut commande: <span className="font-medium text-neutral-900">{data.orderStatus}</span></p>
              <p>Statut paiement: <span className="font-medium text-neutral-900">{data.paymentStatus}</span></p>
              <p>Mode de paiement: <span className="font-medium text-neutral-900">{data.paymentMethod}</span></p>
              <p>Type: <span className="font-medium text-neutral-900">{data.fulfillmentLabel}</span></p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <CreditCard className="h-4 w-4" />
              Totaux
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total</span>
                <span>{formatPrice(data.orderSubtotal, order.currency || "HTG")}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Livraison</span>
                <span>{formatPrice(data.shipping, order.currency || "HTG")}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Taxes</span>
                <span>{formatPrice(data.tax, order.currency || "HTG")}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-950">
                <span>Total</span>
                <span>{formatPrice(data.total, order.currency || "HTG")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[1.25rem] border-l-4 border-amber-500 bg-amber-50 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <MapPin className="h-4 w-4" />
            NB
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-900">{data.note}</p>
        </div>

        {exportError ? (
          <p className="mt-4 text-sm font-medium text-red-600">{exportError}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handlePdfDownload}
            disabled={exporting}
            className="min-w-[220px]"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Generation du PDF..." : "Telecharger la fiche PDF"}
          </Button>
        </div>
      </div>
    </section>
  );
}
