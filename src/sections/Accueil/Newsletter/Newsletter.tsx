"use client";

// ============================================
// NEWSLETTER — 100% Configurable Architecture
// ============================================

import { Send, Check, Sparkles, Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type {
  NewsletterProps,
  NewsletterField,
} from "@/types/section-config-types";
import newsletterSchema from "./Newsletter.schema";

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
// SUCCESS VIEW COMPONENT
// ─────────────────────────────────────────
function SuccessView({
  message,
  accentColor,
  textColor,
  classes,
}: {
  message: string;
  accentColor: string;
  textColor: string;
  classes?: { successMessage?: string };
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "flex flex-col items-center gap-5 py-8",
        classes?.successMessage,
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: accentColor }}
      >
        <Check className="w-9 h-9 text-white" strokeWidth={2.5} />
      </motion.div>
      <h2
        className="text-2xl sm:text-3xl font-light text-center"
        style={{ color: textColor }}
      >
        Bienvenue dans notre cercle exclusif
      </h2>
      <p style={{ color: `${textColor}70` }} className="text-center max-w-md">
        {message}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// INLINE FORM COMPONENT
// ─────────────────────────────────────────
function InlineForm({
  email,
  setEmail,
  onSubmit,
  placeholder,
  buttonText,
  accentColor,
  textColor,
  showPrivacy,
  privacyText,
  accepted,
  setAccepted,
  focused,
  setFocused,
  classes,
  style,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  buttonText: string;
  accentColor: string;
  textColor: string;
  showPrivacy: boolean;
  privacyText?: string;
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  focused: boolean;
  setFocused: (v: boolean) => void;
  classes?: {
    form?: string;
    inputGroup?: string;
    input?: string;
    button?: string;
    checkbox?: string;
    privacy?: string;
  };
  style?: { border?: { input?: string; inputRadius?: string } };
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn("w-full flex flex-col gap-4 max-w-lg", classes?.form)}
    >
      {/* Email field */}
      <div
        className={cn(
          "relative flex items-center transition-all duration-300",
          style?.border?.inputRadius === "none"
            ? "rounded-none"
            : "rounded-full",
          classes?.inputGroup,
        )}
        style={{
          border: `1px solid ${focused ? accentColor : `${textColor}20`}`,
          backgroundColor: `${textColor}07`,
          boxShadow: focused ? `0 0 0 3px ${accentColor}15` : "none",
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          className={cn(
            "flex-1 bg-transparent px-6 py-4 text-sm outline-none",
            style?.border?.inputRadius === "none" && "rounded-none",
            classes?.input,
          )}
          style={{ color: textColor }}
        />
        <motion.button
          type="submit"
          className={cn(
            "mr-1.5 flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all",
            style?.border?.inputRadius === "none"
              ? "rounded-none"
              : "rounded-full",
            classes?.button,
          )}
          style={{ backgroundColor: accentColor }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{buttonText}</span>
        </motion.button>
      </div>

      {/* Privacy */}
      {showPrivacy && (
        <label
          className={cn(
            "flex items-center justify-center gap-2.5 cursor-pointer group text-sm",
            classes?.privacy,
          )}
          style={{ color: `${textColor}60` }}
        >
          <div
            onClick={() => setAccepted(!accepted)}
            className={cn(
              "w-4 h-4 border flex items-center justify-center transition-all",
              classes?.checkbox,
            )}
            style={{
              borderColor: accepted ? accentColor : `${textColor}30`,
              backgroundColor: accepted ? accentColor : "transparent",
            }}
          >
            {accepted && (
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            )}
          </div>
          <span>{privacyText}</span>
        </label>
      )}
    </form>
  );
}

// ─────────────────────────────────────────
// CENTERED FORM COMPONENT
// ─────────────────────────────────────────
function CenteredForm(props: Parameters<typeof InlineForm>[0]) {
  return <InlineForm {...props} />;
}

// ─────────────────────────────────────────
// SPLIT FORM COMPONENT
// ─────────────────────────────────────────
function SplitForm({
  email,
  setEmail,
  onSubmit,
  title,
  description,
  placeholder,
  buttonText,
  accentColor,
  textColor,
  showPrivacy,
  privacyText,
  accepted,
  setAccepted,
  imageUrl,
  classes,
  style,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  placeholder: string;
  buttonText: string;
  accentColor: string;
  textColor: string;
  showPrivacy: boolean;
  privacyText?: string;
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  imageUrl?: string;
  classes?: {
    content?: string;
    form?: string;
    input?: string;
    button?: string;
  };
  style?: { border?: { input?: string; inputRadius?: string } };
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Image side */}
      {imageUrl && (
        <div className="relative aspect-square lg:aspect-auto lg:h-full min-h-[300px] rounded-2xl overflow-hidden">
          <img
            src={imageUrl}
            alt="Newsletter"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
      )}

      {/* Form side */}
      <div className={cn("flex flex-col gap-6 p-6 lg:p-12", classes?.content)}>
        <div>
          <h2
            className="text-3xl sm:text-4xl font-light tracking-tight mb-3"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          {description && (
            <p style={{ color: `${textColor}70` }}>{description}</p>
          )}
        </div>

        <InlineForm
          email={email}
          setEmail={setEmail}
          onSubmit={onSubmit}
          placeholder={placeholder}
          buttonText={buttonText}
          accentColor={accentColor}
          textColor={textColor}
          showPrivacy={showPrivacy}
          privacyText={privacyText}
          accepted={accepted}
          setAccepted={setAccepted}
          focused={focused}
          setFocused={setFocused}
          classes={classes}
          style={style}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN NEWSLETTER COMPONENT
// ─────────────────────────────────────────
export function Newsletter({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: NewsletterProps) {
  // ── EXTRACT CONTENT ──
  const {
    title,
    description,
    placeholder = "Votre adresse email",
    buttonText = "S'inscrire",
    privacyText = "J'accepte de recevoir la newsletter",
    successMessage = "Vous recevrez prochainement nos offres et nouveautés en avant-première.",
    fields = ["email"],
  } = content;

  // ── EXTRACT CONFIG ──
  const {
    variant = "centered",
    showPrivacy = true,
    requirePrivacy = true,
    animation = { entrance: "fade-in", stagger: true },
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    typography: styleTypography = {},
    spacing: styleSpacing = {},
    border: styleBorder = {},
    effects: styleEffects = {},
  } = style;

  const {
    background: backgroundColor = "primary",
    text: textColor = "white",
    accent: accentColor = "accent",
  } = styleColors;

  const { titleSize = "4xl", textAlign = "center" } = styleTypography;

  const { container = "contained", paddingY = "16" } = styleSpacing;

  // ── STATE ──
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#0a0a0a");
  const resolvedTextColor = resolveColor(textColor, "#ffffff");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && (!requirePrivacy || !showPrivacy || accepted)) {
      setSubmitted(true);
    }
  };

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="section"
      animation={animation}
      className={cn("w-full relative overflow-hidden", classes.root)}
      style={{
        backgroundColor: resolvedBgColor,
        color: resolvedTextColor,
        ...css,
      }}
    >
      {/* Background accents */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${resolvedAccentColor}18, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${resolvedTextColor} 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Horizontal lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${resolvedAccentColor}30, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${resolvedAccentColor}20, transparent)`,
        }}
      />

      <SectionContainer
        size={container}
        className={cn("relative", classes.container)}
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessView
              message={successMessage}
              accentColor={resolvedAccentColor}
              textColor={resolvedTextColor}
              classes={classes}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex flex-col gap-8",
                variant === "centered" &&
                  "items-center text-center max-w-2xl mx-auto",
                variant === "inline" &&
                  "items-center text-center max-w-2xl mx-auto",
                classes.content,
              )}
            >
              {/* Icon */}
              {variant !== "minimal" && (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {variant === "split" ? (
                    <Mail
                      className="w-7 h-7"
                      style={{ color: resolvedAccentColor }}
                    />
                  ) : (
                    <Sparkles
                      className="w-7 h-7"
                      style={{ color: resolvedAccentColor }}
                    />
                  )}
                </motion.div>
              )}

              {/* Ornament + Title */}
              <div
                className={cn(
                  "flex flex-col gap-3",
                  variant === "centered" || variant === "inline"
                    ? "items-center"
                    : "",
                )}
              >
                {variant !== "minimal" && (
                  <div className="flex items-center gap-3">
                    <div
                      className="h-px w-10"
                      style={{
                        background: `linear-gradient(to right, transparent, ${resolvedAccentColor})`,
                      }}
                    />
                    <span
                      className="text-[10px] tracking-[0.35em] uppercase font-medium"
                      style={{ color: resolvedAccentColor }}
                    >
                      Newsletter
                    </span>
                    <div
                      className="h-px w-10"
                      style={{
                        background: `linear-gradient(to left, transparent, ${resolvedAccentColor})`,
                      }}
                    />
                  </div>
                )}

                {title && (
                  <h2
                    className={cn(
                      "font-light tracking-tight",
                      titleSize === "3xl" && "text-3xl sm:text-4xl",
                      titleSize === "4xl" && "text-3xl sm:text-4xl lg:text-5xl",
                      titleSize === "5xl" && "text-4xl sm:text-5xl lg:text-6xl",
                      classes.title,
                    )}
                    style={{ color: resolvedTextColor }}
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <p
                    className={cn(
                      "text-base font-light max-w-md",
                      classes.description,
                    )}
                    style={{ color: `${resolvedTextColor}70` }}
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* Form */}
              {variant === "split" ? (
                <SplitForm
                  email={email}
                  setEmail={setEmail}
                  onSubmit={handleSubmit}
                  title={title || ""}
                  description={description}
                  placeholder={placeholder}
                  buttonText={buttonText}
                  accentColor={resolvedAccentColor}
                  textColor={resolvedTextColor}
                  showPrivacy={showPrivacy}
                  privacyText={privacyText}
                  accepted={accepted}
                  setAccepted={setAccepted}
                  imageUrl={(content as any).imageUrl}
                  classes={classes}
                  style={style}
                />
              ) : (
                <CenteredForm
                  email={email}
                  setEmail={setEmail}
                  onSubmit={handleSubmit}
                  placeholder={placeholder}
                  buttonText={buttonText}
                  accentColor={resolvedAccentColor}
                  textColor={resolvedTextColor}
                  showPrivacy={showPrivacy}
                  privacyText={privacyText}
                  accepted={accepted}
                  setAccepted={setAccepted}
                  focused={focused}
                  setFocused={setFocused}
                  classes={classes}
                  style={style}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </SectionContainer>
    </SectionWrapper>
  );
}

Object.assign(Newsletter, { schema: newsletterSchema });

export const schema = newsletterSchema;

export default Newsletter;
