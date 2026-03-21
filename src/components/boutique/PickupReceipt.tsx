"use client";

import { useState } from "react";
import {
  Download,
  MapPin,
  Package,
  Printer,
  Store,
  CreditCard,
  BadgeInfo,
} from "lucide-react";
import type { Order } from "@/data/types";
import type { BoutiqueStoreRecord } from "@/lib/boutiqueStorefront";
import { Button } from "@/components/ui/Button";
import { getSellerPaymentMethodLabel } from "@/data/paymentMethods";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReceiptData(store: BoutiqueStoreRecord, order: Order) {
  const orderNumber = order.orderNumber || order.id;
  const clientName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim();
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
    storeName: store.businessName,
    storeAddressLines,
    items,
    note:
      "NB: Presentez ce recu directement au magasin lors du retrait. Sans ce document, le retrait peut etre retarde.",
  };
}

type ReceiptData = ReturnType<typeof buildReceiptData>;

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

function estimatePdfTextWidth(text: string, fontSize: number) {
  return toAscii(text).length * fontSize * 0.52;
}

function buildPickupReceiptPdfBlob(store: BoutiqueStoreRecord, order: Order) {
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
  const tableTotalWidth = contentWidth - tableNameWidth - tableQtyWidth - tableUnitWidth;
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
    ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg ${drawX.toFixed(2)} ${baseline.toFixed(2)} Td (${text}) Tj ET`);
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
  drawText(RECEIPT_PDF_MARGIN + 18, cursorY + 38, data.storeName, 22, true, "left", [0.06, 0.09, 0.15]);
  drawText(RECEIPT_PDF_MARGIN + 18, cursorY + 62, `Fiche de retrait - ${data.orderNumber}`, 11, false, "left", [0.30, 0.36, 0.44]);

  const badgeWidth = 154;
  drawRect(
    pageWidth - RECEIPT_PDF_MARGIN - badgeWidth,
    cursorY + 18,
    badgeWidth,
    30,
    [1, 1, 1],
    [0.90, 0.74, 0.32],
  );
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

  drawLines(
    RECEIPT_PDF_MARGIN + 14,
    cursorY + 36,
    data.storeAddressLines,
    11,
    false,
    [0.18, 0.24, 0.31],
    15,
  );
  drawText(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + 36,
    data.clientName,
    12,
    true,
    "left",
  );
  drawLines(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + 56,
    [
      data.clientPhone,
      `Commande passee le ${data.orderDate}`,
      `Mise a jour le ${data.updatedDate}`,
    ],
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
    drawText(
      RECEIPT_PDF_MARGIN + 12,
      itemTop + 10,
      row.lines[0],
      10,
      true,
      "left",
    );
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
    "left",
    [0.08, 0.11, 0.15],
  );

  cursorY += layout.summaryHeight + 16;

  drawRect(RECEIPT_PDF_MARGIN, cursorY, contentWidth, layout.noteHeight, [1, 0.98, 0.91], [0.85, 0.52, 0.09]);
  drawText(RECEIPT_PDF_MARGIN + 14, cursorY + 14, "NB", 9, true, "left", [0.70, 0.39, 0.06]);
  drawLines(
    RECEIPT_PDF_MARGIN + 14,
    cursorY + 30,
    wrapReceiptText(data.note, 78),
    10,
    false,
    [0.56, 0.29, 0.05],
    13,
  );

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

  const content = [
    "1 0 0 1 0 0 cm",
    ...ops,
  ].join("\n");

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

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 16,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font = "10px Arial",
) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [""];
  }

  ctx.save();
  ctx.font = font;
  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
      continue;
    }

    let chunk = "";
    for (const character of word) {
      const testChunk = `${chunk}${character}`;
      if (ctx.measureText(testChunk).width <= maxWidth) {
        chunk = testChunk;
      } else {
        if (chunk) {
          lines.push(chunk);
        }
        chunk = character;
      }
    }
    current = chunk;
  }

  if (current) {
    lines.push(current);
  }
  ctx.restore();

  return lines;
}

function buildPickupReceiptPngBlob(store: BoutiqueStoreRecord, order: Order) {
  const data = buildReceiptData(store, order);
  const layout = measureReceiptLayout(data);
  const scale = 2;
  const canvasWidth = RECEIPT_PDF_WIDTH * scale;
  const canvasHeight = Math.ceil(layout.pageHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponible.");
  }

  ctx.scale(scale, scale);
  const width = RECEIPT_PDF_WIDTH;
  const height = layout.pageHeight;
  const contentWidth = width - RECEIPT_PDF_MARGIN * 2;
  const columnGap = 14;
  const infoColumnWidth = (contentWidth - columnGap) / 2;
  const tableNameWidth = 228;
  const tableQtyWidth = 44;
  const tableUnitWidth = 86;
  const white = "#ffffff";
  const textDark = "#0f172a";
  const textMuted = "#64748b";
  const accent = "#d97706";
  const accentSoft = "#fffbeb";
  const line = "#dbe2ea";
  const background = "#fbf8f3";

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const rect = (x: number, y: number, w: number, h: number, fill = white, stroke = line) => {
    drawRoundedRect(ctx, x, y, w, h, 16);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  };

  const text = (
    x: number,
    y: number,
    value: string,
    size: number,
    bold = false,
    color = textDark,
    align: CanvasTextAlign = "left",
  ) => {
    ctx.font = `${bold ? 700 : 400} ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    ctx.fillText(value, x, y);
    ctx.textAlign = "left";
  };

  const linesText = (
    x: number,
    y: number,
    lines: string[],
    size: number,
    bold = false,
    color = textDark,
    lineHeight = size + 4,
  ) => {
    lines.forEach((lineValue, index) => {
      text(x, y + index * lineHeight, lineValue, size, bold, color);
    });
  };

  let cursorY = RECEIPT_PDF_MARGIN;
  rect(RECEIPT_PDF_MARGIN, cursorY, contentWidth, 88, "#fff7e6", "#e3b866");
  text(RECEIPT_PDF_MARGIN + 18, cursorY + 16, `Boutique ${data.storeReference}`, 9, true, "#c06d12");
  text(RECEIPT_PDF_MARGIN + 18, cursorY + 38, data.storeName, 22, true);
  text(RECEIPT_PDF_MARGIN + 18, cursorY + 62, `Fiche de retrait - ${data.orderNumber}`, 11, false, textMuted);

  const badgeWidth = 154;
  rect(width - RECEIPT_PDF_MARGIN - badgeWidth, cursorY + 18, badgeWidth, 30, white, "#e3b866");
  text(width - RECEIPT_PDF_MARGIN - badgeWidth / 2, cursorY + 27, "Retrait en boutique", 10, true, "#c06d12", "center");

  cursorY += 104;

  rect(RECEIPT_PDF_MARGIN, cursorY, infoColumnWidth, layout.infoHeight);
  rect(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap, cursorY, infoColumnWidth, layout.infoHeight);
  text(RECEIPT_PDF_MARGIN + 14, cursorY + 14, "Adresse de la boutique", 9, true, textMuted);
  text(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14, cursorY + 14, "Client", 9, true, textMuted);
  linesText(RECEIPT_PDF_MARGIN + 14, cursorY + 34, data.storeAddressLines, 11, false, textDark, 15);
  text(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14, cursorY + 34, data.clientName, 12, true);
  linesText(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + 56,
    [data.clientPhone, `Commande passee le ${data.orderDate}`, `Mise a jour le ${data.updatedDate}`],
    10,
    false,
    textMuted,
    14,
  );

  cursorY += layout.infoHeight + 16;

  rect(RECEIPT_PDF_MARGIN, cursorY, contentWidth, 30, "#fafafa", "#e3e8ee");
  text(RECEIPT_PDF_MARGIN + 14, cursorY + 10, "Articles commandes", 9, true, textMuted);
  rect(RECEIPT_PDF_MARGIN, cursorY + 30, contentWidth, 28, "#f7f7f7", "#e3e8ee");
  text(RECEIPT_PDF_MARGIN + 12, cursorY + 39, "Produit", 9, true, textMuted);
  text(RECEIPT_PDF_MARGIN + tableNameWidth + 6, cursorY + 39, "Qt", 9, true, textMuted, "center");
  text(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + 8, cursorY + 39, "PU", 9, true, textMuted, "center");
  text(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + tableUnitWidth + 8, cursorY + 39, "Total", 9, true, textMuted, "center");

  let itemTop = cursorY + 58;
  data.items.forEach((item, index) => {
    const row = layout.itemRows[index];
    const rowHeight = row.height;
    ctx.strokeStyle = "#e7edf3";
    ctx.beginPath();
    ctx.moveTo(RECEIPT_PDF_MARGIN, itemTop + rowHeight);
    ctx.lineTo(RECEIPT_PDF_MARGIN + contentWidth, itemTop + rowHeight);
    ctx.stroke();

    linesText(RECEIPT_PDF_MARGIN + 12, itemTop + 10, row.lines, 10, true, textDark, 12);
    if (item.sku) {
      text(RECEIPT_PDF_MARGIN + 12, itemTop + rowHeight - 12, `SKU: ${item.sku}`, 8, false, textMuted);
    }
    text(RECEIPT_PDF_MARGIN + tableNameWidth + 6, itemTop + 16, String(item.quantity), 10, false, textDark, "center");
    text(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + 6, itemTop + 16, formatPrice(item.unitPrice, order.currency || "HTG"), 10, false, textDark, "center");
    text(RECEIPT_PDF_MARGIN + tableNameWidth + tableQtyWidth + tableUnitWidth + 6, itemTop + 16, formatPrice(item.total, order.currency || "HTG"), 10, true, textDark, "center");
    itemTop += rowHeight;
  });

  cursorY = itemTop + 12;

  rect(RECEIPT_PDF_MARGIN, cursorY, infoColumnWidth, layout.summaryHeight);
  rect(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap, cursorY, infoColumnWidth, layout.summaryHeight);
  text(RECEIPT_PDF_MARGIN + 14, cursorY + 14, "Informations de suivi", 9, true, textMuted);
  linesText(
    RECEIPT_PDF_MARGIN + 14,
    cursorY + 34,
    [
      `Statut commande: ${data.orderStatus}`,
      `Statut paiement: ${data.paymentStatus}`,
      `Methode paiement: ${data.paymentMethod}`,
      `Type: ${data.fulfillmentLabel}`,
    ],
    10,
    false,
    textDark,
    14,
  );
  text(RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14, cursorY + 14, "Montants", 9, true, textMuted);
  linesText(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + 36,
    [
      `Sous-total: ${formatPrice(data.orderSubtotal, order.currency || "HTG")}`,
      `Livraison: ${formatPrice(data.shipping, order.currency || "HTG")}`,
      `Taxes: ${formatPrice(data.tax, order.currency || "HTG")}`,
    ],
    10,
    false,
    textDark,
    14,
  );
  text(
    RECEIPT_PDF_MARGIN + infoColumnWidth + columnGap + 14,
    cursorY + layout.summaryHeight - 26,
    `Total: ${formatPrice(data.total, order.currency || "HTG")}`,
    13,
    true,
    textDark,
  );

  cursorY += layout.summaryHeight + 16;

  rect(RECEIPT_PDF_MARGIN, cursorY, contentWidth, layout.noteHeight, accentSoft, accent);
  text(RECEIPT_PDF_MARGIN + 14, cursorY + 14, "NB", 9, true, "#9a4f05");
  linesText(
    RECEIPT_PDF_MARGIN + 14,
    cursorY + 30,
    wrapReceiptText(data.note, 78),
    10,
    false,
    "#9a4f05",
    13,
  );

  cursorY += layout.noteHeight + 16;
  text(
    RECEIPT_PDF_MARGIN,
    cursorY + 6,
    `Client: ${data.clientName} | Boutique: ${data.storeName} | Recu genere le ${formatDate(new Date().toISOString())}`,
    8,
    false,
    textMuted,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Impossible de generer l'image."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function buildReceiptBodyHtml(store: BoutiqueStoreRecord, order: Order) {
  const data = buildReceiptData(store, order);
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td>
            <div class="item-name">${escapeHtml(item.name)}</div>
            ${item.sku ? `<div class="item-sku">SKU: ${escapeHtml(item.sku)}</div>` : ""}
          </td>
          <td class="cell-center">${item.quantity}</td>
          <td class="cell-right">${escapeHtml(formatPrice(item.unitPrice, order.currency || "HTG"))}</td>
          <td class="cell-right">${escapeHtml(formatPrice(item.total, order.currency || "HTG"))}</td>
        </tr>`,
    )
    .join("");

  const addressHtml = data.storeAddressLines
    .map((line) => `<p class="receipt-line">${escapeHtml(line)}</p>`)
    .join("");

  return `
    <style>
      * { box-sizing: border-box; }
      .receipt-root {
        width: 100%;
        min-height: 100%;
        background: #fbf8f3;
        color: #0f172a;
        font-family: Arial, Helvetica, sans-serif;
        padding: 24px;
      }
      .receipt-card {
        width: 100%;
        max-width: 1080px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 28px;
        padding: 32px;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
      }
      .receipt-header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding-bottom: 24px;
        border-bottom: 2px solid #0f172a;
      }
      .receipt-kicker {
        margin: 0 0 8px;
        font-size: 12px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: #94a3b8;
        font-weight: 700;
      }
      .receipt-title {
        margin: 0;
        font-size: 34px;
        line-height: 1.1;
        font-weight: 700;
        color: #0f172a;
      }
      .receipt-subtitle {
        margin: 10px 0 0;
        font-size: 16px;
        color: #475569;
      }
      .receipt-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 9999px;
        padding: 10px 16px;
        border: 1px solid #cbd5e1;
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        background: #f8fafc;
        white-space: nowrap;
      }
      .receipt-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 16px;
        margin-top: 24px;
      }
      .receipt-panel {
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 18px;
        background: #fff;
      }
      .receipt-panel-title {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: #94a3b8;
        font-weight: 700;
      }
      .receipt-line {
        margin: 4px 0;
        font-size: 15px;
        color: #334155;
        line-height: 1.55;
      }
      .receipt-line strong {
        color: #0f172a;
      }
      .receipt-table {
        width: 100%;
        border-collapse: collapse;
      }
      .receipt-table th,
      .receipt-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #e2e8f0;
        text-align: left;
        vertical-align: top;
      }
      .receipt-table th {
        background: #f8fafc;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #94a3b8;
      }
      .receipt-table td {
        font-size: 14px;
        color: #334155;
      }
      .item-name {
        font-weight: 700;
        color: #0f172a;
      }
      .item-sku {
        margin-top: 4px;
        font-size: 12px;
        color: #64748b;
      }
      .cell-center {
        text-align: center;
        white-space: nowrap;
      }
      .cell-right {
        text-align: right;
        white-space: nowrap;
        font-weight: 600;
        color: #0f172a;
      }
      .receipt-summary {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 16px;
        margin-top: 16px;
      }
      .receipt-total-box {
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 18px;
        background: #fff;
      }
      .receipt-totals {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .receipt-totals li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 7px 0;
        font-size: 14px;
        color: #334155;
      }
      .receipt-totals li strong {
        color: #0f172a;
      }
      .receipt-totals li.total {
        border-top: 1px solid #e2e8f0;
        padding-top: 12px;
        margin-top: 8px;
        font-size: 18px;
        font-weight: 700;
        color: #0f172a;
      }
      .receipt-note {
        margin-top: 16px;
        border-left: 4px solid #d97706;
        background: #fffbeb;
        border-radius: 16px;
        padding: 16px 18px;
      }
      .receipt-note strong {
        display: block;
        font-size: 13px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #b45309;
        margin-bottom: 8px;
      }
      .receipt-note p {
        margin: 0;
        color: #92400e;
        font-size: 14px;
        line-height: 1.65;
      }
      .receipt-footer {
        margin-top: 18px;
        font-size: 12px;
        color: #64748b;
        line-height: 1.5;
      }
      @media print {
        @page {
          size: A4 portrait;
          margin: 16mm;
        }
        .receipt-root {
          padding: 0;
          background: #fff;
        }
        .receipt-card {
          box-shadow: none;
          border: none;
          padding: 0;
          border-radius: 0;
        }
      }
    </style>
    <div class="receipt-root">
      <div class="receipt-card">
        <div class="receipt-header">
          <div>
            <p class="receipt-kicker">Boutique ${escapeHtml(data.storeReference)}</p>
            <h1 class="receipt-title">${escapeHtml(data.storeName)}</h1>
            <p class="receipt-subtitle">Fiche de retrait - ${escapeHtml(data.orderNumber)}</p>
          </div>
          <div class="receipt-badge">
            Boutique - ${escapeHtml(data.fulfillmentLabel)}
          </div>
        </div>

        <div class="receipt-grid">
          <div class="receipt-panel">
            <p class="receipt-panel-title">Adresse de la boutique</p>
            ${addressHtml}
          </div>

          <div class="receipt-panel">
            <p class="receipt-panel-title">Client</p>
            <p class="receipt-line"><strong>${escapeHtml(data.clientName)}</strong></p>
            <p class="receipt-line">${escapeHtml(data.clientPhone)}</p>
            <p class="receipt-line">Commande passee le ${escapeHtml(data.orderDate)}</p>
            <p class="receipt-line">Mise a jour le ${escapeHtml(data.updatedDate)}</p>
          </div>
        </div>

        <div class="receipt-panel receipt-section" style="margin-top:16px;">
          <p class="receipt-panel-title">Articles commandes</p>
          <table class="receipt-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th class="cell-center">Qt&eacute;</th>
                <th class="cell-right">Prix unit.</th>
                <th class="cell-right">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>

        <div class="receipt-summary">
          <div class="receipt-panel">
            <p class="receipt-panel-title">Informations de suivi</p>
            <p class="receipt-line"><strong>Statut commande:</strong> ${escapeHtml(data.orderStatus)}</p>
            <p class="receipt-line"><strong>Statut paiement:</strong> ${escapeHtml(data.paymentStatus)}</p>
            <p class="receipt-line"><strong>Methode paiement:</strong> ${escapeHtml(data.paymentMethod)}</p>
            <p class="receipt-line"><strong>Numero commande:</strong> ${escapeHtml(data.orderNumber)}</p>
          </div>

          <div class="receipt-total-box">
            <p class="receipt-panel-title">Montants</p>
            <ul class="receipt-totals">
              <li><span>Sous-total</span><strong>${escapeHtml(formatPrice(data.orderSubtotal, order.currency || "HTG"))}</strong></li>
              <li><span>Livraison</span><strong>${escapeHtml(formatPrice(data.shipping, order.currency || "HTG"))}</strong></li>
              <li><span>Taxes</span><strong>${escapeHtml(formatPrice(data.tax, order.currency || "HTG"))}</strong></li>
              <li class="total"><span>Total</span><span>${escapeHtml(formatPrice(data.total, order.currency || "HTG"))}</span></li>
            </ul>
          </div>
        </div>

        <div class="receipt-note">
          <strong>NB</strong>
          <p>${escapeHtml(data.note)}</p>
        </div>

        <div class="receipt-footer">
          <p>Client: ${escapeHtml(data.clientName)} | Boutique: ${escapeHtml(data.storeName)} | Recu genere le ${escapeHtml(formatDate(new Date().toISOString()))}</p>
        </div>
      </div>
    </div>
  `;
}

function buildReceiptDocumentHtml(store: BoutiqueStoreRecord, order: Order) {
  const body = buildReceiptBodyHtml(store, order);

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fiche de retrait ${escapeHtml(order.orderNumber || order.id)}</title>
  </head>
  <body style="margin:0; background:#fbf8f3;">${body}</body>
</html>`;
}

function buildReceiptSvg(store: BoutiqueStoreRecord, order: Order) {
  const body = buildReceiptBodyHtml(store, order);
  const itemCount = Math.max(order.items.length, 1);
  const height = 1300 + itemCount * 120;
  const width = 1200;

  return {
    width,
    height,
    svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#fbf8f3" />
  <foreignObject x="0" y="0" width="${width}" height="${height}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px; height:${height}px;">${body}</div>
  </foreignObject>
</svg>`,
  };
}

async function svgToPng(svgMarkup: string, width: number, height: number) {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = new window.Image();

    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Impossible de generer l'image."));
      image.src = url;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas indisponible.");
    }

    context.scale(scale, scale);
    context.fillStyle = "#fbf8f3";
    context.fillRect(0, 0, width, height);
    context.drawImage(loaded, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((output) => {
        if (!output) {
          reject(new Error("Impossible d'exporter le fichier image."));
          return;
        }

        resolve(output);
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
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
  store: BoutiqueStoreRecord;
  order: Order;
}) {
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "image" | null>(null);

  const receiptReady = canShowPickupReceipt(order);
  const orderNumber = order.orderNumber || order.id;

  const handlePdfDownload = async () => {
    setExportError(null);
    setExporting("pdf");

    try {
      const pdfBlob = buildPickupReceiptPdfBlob(store, order);
      downloadBlob(pdfBlob, `fiche-retrait-${orderNumber}.pdf`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setExporting(null);
    }
  };

  const handleImageDownload = async () => {
    setExportError(null);
    setExporting("image");

    try {
      const pngBlob = await buildPickupReceiptPngBlob(store, order);
      downloadBlob(pngBlob, `fiche-retrait-${orderNumber}.png`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export image impossible.");
    } finally {
      setExporting(null);
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
              Cette fiche regroupe l'adresse de la boutique, les informations de la commande et le statut de paiement.
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
              key={`${item.name}-${item.sku}`}
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
            isLoading={exporting === "pdf"}
            className="min-w-[180px]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Telecharger en PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleImageDownload}
            isLoading={exporting === "image"}
            className="min-w-[180px]"
          >
            <Download className="mr-2 h-4 w-4" />
            Telecharger en image
          </Button>
        </div>
      </div>
    </section>
  );
}
