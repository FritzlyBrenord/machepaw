"use client";

// ============================================
// ACCOUNT CONTENT - 100% Configurable Architecture
// ============================================

import type { StorefrontSectionStoreData } from "@/lib/storefront-section-data";
import type { AccountDashboardConfig } from "./AccountDashboard";
import { AccountDashboard } from "@/sections/Compte/Dashboard/AccountDashboard";
import { accountContentSchema } from "./AccountContent.schema";

export interface AccountContentStyle {
  background?: string;
  text?: string;
  accent?: string;
  cardBg?: string;
  border?: string;
  paddingY?: string;
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

export interface AccountContentClasses {
  root?: string;
}

export interface AccountContentProps {
  id?: string;
  title?: string;
  subtitle?: string;
  content?: {
    title?: string;
    subtitle?: string;
  };
  config?: Partial<AccountDashboardConfig>;
  showStats?: boolean;
  showOrders?: boolean;
  showAddresses?: boolean;
  showProfile?: boolean;
  showLogout?: boolean;
  enableAccountDelete?: boolean;
  storefrontStore?: StorefrontSectionStoreData | null;
  style?: AccountContentStyle;
  classes?: AccountContentClasses;
}

export function AccountContent({
  id,
  title: legacyTitle,
  subtitle: legacySubtitle,
  content = {},
  config = {},
  showStats,
  showOrders,
  showAddresses,
  showProfile,
  showLogout,
  enableAccountDelete,
  storefrontStore,
  style = {},
  classes = {},
}: AccountContentProps) {
  const {
    background: legacyBackgroundColor = "secondary",
    text: legacyTextColor = "primary",
    accent: legacyAccentColor = "accent",
    cardBg: legacyCardBgColor = "#ffffff",
    border: legacyBorderColor = "#e5e7eb",
    paddingY: legacyPaddingY = "16",
    colors: nestedColors = {},
    spacing: nestedSpacing = {},
  } = style;

  const resolvedConfig: Partial<AccountDashboardConfig> = {
    ...config,
    showStats: config.showStats ?? showStats ?? true,
    showOrders: config.showOrders ?? showOrders ?? true,
    showAddresses: config.showAddresses ?? showAddresses ?? true,
    showProfile: config.showProfile ?? showProfile ?? true,
    showLogout: config.showLogout ?? showLogout ?? true,
    enableAccountDelete:
      config.enableAccountDelete ?? enableAccountDelete ?? true,
  };

  const backgroundColor = nestedColors.background ?? legacyBackgroundColor;
  const textColor = nestedColors.text ?? legacyTextColor;
  const accentColor = nestedColors.accent ?? legacyAccentColor;
  const cardBgColor = nestedColors.cardBg ?? legacyCardBgColor;
  const borderColor = nestedColors.border ?? legacyBorderColor;
  const padding = nestedSpacing.paddingY ?? legacyPaddingY;
  const resolvedTitle = legacyTitle || content.title || "Mon Compte";
  const resolvedSubtitle =
    legacySubtitle || content.subtitle || "Gerez vos informations et vos commandes";

  return (
    <AccountDashboard
      id={id}
      content={{ title: resolvedTitle, subtitle: resolvedSubtitle }}
      config={resolvedConfig}
      style={{
        colors: {
          background: backgroundColor,
          text: textColor,
          accent: accentColor,
          cardBg: cardBgColor,
          border: borderColor,
        },
        spacing: {
          paddingY: padding,
          container: nestedSpacing.container ?? "contained",
        },
      }}
      classes={classes}
      storefrontStore={storefrontStore || undefined}
    />
  );
}

export default AccountContent;

Object.assign(AccountContent, { schema: accountContentSchema });

export const schema = accountContentSchema;
