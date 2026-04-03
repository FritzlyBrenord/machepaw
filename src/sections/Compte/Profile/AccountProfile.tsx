"use client";

// ============================================
// ACCOUNT PROFILE — 100% Configurable Architecture
// ============================================

import { User, Mail, Phone, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import { accountProfileSchema } from "./AccountProfile.schema";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface AccountProfileContent {
  title?: string;
  user?: UserProfile;
  labels?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    saveButton?: string;
  };
}

export interface AccountProfileConfig {
  showAvatar?: boolean;
  editable?: boolean;
  animation?: {
    entrance?: "fade-in" | "slide-up" | "scale-in" | "none";
  };
}

export interface AccountProfileStyle {
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

export interface AccountProfileClasses {
  root?: string;
  title?: string;
  card?: string;
  avatar?: string;
  form?: string;
  field?: string;
  saveButton?: string;
}

export interface AccountProfileProps {
  id?: string;
  testId?: string;
  content?: AccountProfileContent;
  config?: AccountProfileConfig;
  style?: AccountProfileStyle;
  classes?: AccountProfileClasses;
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

// ─────────────────────────────────────────
// MAIN ACCOUNT PROFILE COMPONENT
// ─────────────────────────────────────────
export function AccountProfile({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: AccountProfileProps) {
  // ── EXTRACT CONTENT ──
  const {
    title = "Profil",
    user = {},
    labels = {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      saveButton: "Enregistrer",
    },
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    showAvatar = true,
    editable = true,
    animation = { entrance: "fade-in" },
  } = config;

  // ── EXTRACT STYLE ──
  const { colors: styleColors = {}, spacing: styleSpacing = {} } = style;

  const {
    background: backgroundColor = "white",
    text: textColor = "primary",
    accent: accentColor = "accent",
    cardBg: cardBgColor = "white",
    border: borderColor,
  } = styleColors;

  const { container = "narrow", paddingY = "10" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#ffffff");
  const resolvedTextColor = resolveColor(textColor, "#1a1a1a");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedCardBgColor = resolveColor(cardBgColor, "#ffffff");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, "#e5e5e5")
    : "#e5e5e5";

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={cn("p-6 rounded-lg border", classes?.card)}
          style={{
            borderColor: resolvedBorderColor,
            backgroundColor: resolvedCardBgColor,
          }}
        >
          {/* Avatar */}
          {showAvatar && (
            <div
              className={cn("flex items-center gap-4 mb-6", classes?.avatar)}
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${resolvedAccentColor}20` }}
                  >
                    <User
                      className="w-10 h-10"
                      style={{ color: resolvedAccentColor }}
                    />
                  </div>
                )}
                {editable && (
                  <button
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: resolvedAccentColor }}
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: resolvedTextColor }}
                >
                  {user.firstName} {user.lastName}
                </p>
                <p
                  className="text-sm"
                  style={{ color: `${resolvedTextColor}99` }}
                >
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 gap-4",
              classes?.form,
            )}
          >
            <div className={cn("space-y-2", classes?.field)}>
              <Label style={{ color: resolvedTextColor }}>
                {labels.firstName}
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: `${resolvedTextColor}66` }}
                />
                <Input
                  defaultValue={user.firstName}
                  className="pl-10"
                  disabled={!editable}
                  style={{ borderColor: resolvedBorderColor }}
                />
              </div>
            </div>
            <div className={cn("space-y-2", classes?.field)}>
              <Label style={{ color: resolvedTextColor }}>
                {labels.lastName}
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: `${resolvedTextColor}66` }}
                />
                <Input
                  defaultValue={user.lastName}
                  className="pl-10"
                  disabled={!editable}
                  style={{ borderColor: resolvedBorderColor }}
                />
              </div>
            </div>
            <div className={cn("space-y-2 sm:col-span-2", classes?.field)}>
              <Label style={{ color: resolvedTextColor }}>{labels.email}</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: `${resolvedTextColor}66` }}
                />
                <Input
                  type="email"
                  defaultValue={user.email}
                  className="pl-10"
                  disabled={!editable}
                  style={{ borderColor: resolvedBorderColor }}
                />
              </div>
            </div>
            <div className={cn("space-y-2 sm:col-span-2", classes?.field)}>
              <Label style={{ color: resolvedTextColor }}>{labels.phone}</Label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: `${resolvedTextColor}66` }}
                />
                <Input
                  type="tel"
                  defaultValue={user.phone}
                  className="pl-10"
                  disabled={!editable}
                  style={{ borderColor: resolvedBorderColor }}
                />
              </div>
            </div>
          </div>

          {editable && (
            <Button
              className={cn("w-full mt-6", classes?.saveButton)}
              size="lg"
              style={{
                backgroundColor: resolvedAccentColor,
                color: "#ffffff",
              }}
            >
              {labels.saveButton}
            </Button>
          )}
        </motion.div>
      </SectionContainer>
    </SectionWrapper>
  );
}

export default AccountProfile;

Object.assign(AccountProfile, { schema: accountProfileSchema });

export const schema = accountProfileSchema;
