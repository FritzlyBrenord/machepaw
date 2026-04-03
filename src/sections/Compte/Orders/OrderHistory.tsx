"use client";

// ============================================
// ORDER HISTORY — 100% Configurable Architecture
// ============================================

import { useMemo } from "react";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import {
  useBoutiqueClientOrdersQuery,
  useBoutiqueClientSessionQuery,
} from "@/hooks/useBoutiqueClient";
import { orderHistorySchema } from "./OrderHistory.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
}

export interface OrderHistoryContent {
  title?: string;
  orders?: Order[];
  statusLabels?: {
    pending?: string;
    processing?: string;
    shipped?: string;
    delivered?: string;
    cancelled?: string;
  };
}

export interface OrderHistoryConfig {
  showOrderDetails?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
    stagger?: boolean;
  };
}

export interface OrderHistoryStyle {
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
    cardBg?: string;
    border?: string;
  };
  spacing?: {
    paddingY?: string;
    container?: "full" | "contained" | "narrow";
  };
}

export interface OrderHistoryClasses {
  root?: string;
  title?: string;
  ordersList?: string;
  orderCard?: string;
  orderNumber?: string;
  orderDate?: string;
  orderTotal?: string;
  orderStatus?: string;
}

export interface OrderHistoryProps {
  id?: string;
  testId?: string;
  content?: OrderHistoryContent;
  config?: OrderHistoryConfig;
  style?: OrderHistoryStyle;
  classes?: OrderHistoryClasses;
  storefrontStore?: {
    storeSlug?: string;
  } | null;
}

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function resolveColor(color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor;
  const colorMap: Record<string, string> = {
    primary: "var(--color-primary, #1a1a1a)",
    secondary: "var(--color-secondary, #f5f5f5)",
    accent: "var(--color-accent, #c9a96e)",
    muted: "var(--color-muted, #6b7280)",
    white: "#ffffff",
    black: "#000000",
    transparent: "transparent",
  };
  return colorMap[color] || color;
}

function normalizeOrderStatus(
  status: string | undefined,
): Order["status"] {
  switch (String(status || "").trim().toLowerCase()) {
    case "pending":
      return "pending";
    case "confirmed":
    case "processing":
    case "ready_for_pickup":
      return "processing";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
    case "refunded":
      return "cancelled";
    default:
      return "pending";
  }
}

// ─────────────────────────────────────────
// MAIN ORDER HISTORY COMPONENT
// ─────────────────────────────────────────
export function OrderHistory({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
  storefrontStore,
}: OrderHistoryProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Historique des commandes",
    orders = [],
    statusLabels = {
      pending: "En attente",
      processing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    },
  } = content;
  const storeSlug = String(storefrontStore?.storeSlug || "").trim();
  const isBackendMode = Boolean(storeSlug);

  // ── EXTRACT CONFIG ──
  const {
    showOrderDetails = true,
    animation = { entrance: "fade-in", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "secondary",
    text: textColor = "primary",
    accent: accentColor = "accent",
    cardBg: cardBgColor = "white",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "16" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);
  const sessionQuery = useBoutiqueClientSessionQuery(storeSlug);
  const ordersQuery = useBoutiqueClientOrdersQuery(
    storeSlug,
    Boolean(sessionQuery.data?.customer),
  );
  const backendOrders = useMemo<Order[]>(
    () =>
      (ordersQuery.data || []).map((order) => ({
        id: order.orderNumber || order.id,
        orderNumber: order.orderNumber || order.id,
        date: order.createdAt,
        total: Number(order.total || 0),
        status: normalizeOrderStatus(order.status),
        items: Array.isArray(order.items) ? order.items.length : 0,
      })),
    [ordersQuery.data],
  );
  const displayOrders = isBackendMode ? backendOrders : orders;
  const isLoading = isBackendMode && (sessionQuery.isLoading || ordersQuery.isLoading);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#f5f5f5");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

  const statusConfig: Record<
    string,
    { icon: React.ElementType; color: string }
  > = {
    pending: { icon: Clock, color: "#f59e0b" },
    processing: { icon: Package, color: "#3b82f6" },
    shipped: { icon: Truck, color: "#8b5cf6" },
    delivered: { icon: CheckCircle, color: "#22c55e" },
    cancelled: { icon: XCircle, color: "#ef4444" },
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("w-full", classes?.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      <SectionContainer
        size={container}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("text-2xl font-bold mb-6", classes?.title)}
          style={{ color: resolvedTextColor }}
        >
          {title}
        </motion.h2>

        <div className={cn("space-y-4", classes?.ordersList)}>
          {displayOrders.map((order, index) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border flex items-center justify-between",
                  classes?.orderCard,
                )}
                style={{
                  backgroundColor: resolvedCardBgColor,
                  borderColor: resolvedBorderColor,
                }}
              >
                <div>
                  <p
                    className={cn("font-semibold", classes?.orderNumber)}
                    style={{ color: resolvedTextColor }}
                  >
                    Commande #{order.orderNumber}
                  </p>
                  <p
                    className={cn("text-sm", classes?.orderDate)}
                    style={{ color: `${resolvedTextColor}99` }}
                  >
                    {order.date} • {order.items} article
                    {order.items > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn("font-semibold", classes?.orderTotal)}
                    style={{ color: resolvedAccentColor }}
                  >
                    {order.total.toFixed(2)}€
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm",
                      classes?.orderStatus,
                    )}
                  >
                    <StatusIcon
                      className="w-4 h-4"
                      style={{ color: status.color }}
                    />
                    <span style={{ color: status.color }}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isLoading && displayOrders.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
            style={{ color: `${resolvedTextColor}99` }}
          >
            Aucune commande trouvée
          </motion.p>
        )}
      </SectionContainer>
    </SectionWrapper>
  );
}

export default OrderHistory;

Object.assign(OrderHistory, { schema: orderHistorySchema });

export const schema = orderHistorySchema;
