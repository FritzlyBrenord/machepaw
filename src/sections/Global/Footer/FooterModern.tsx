"use client";

// ============================================
// FOOTER MODERN — 100% Configurable Architecture
// ============================================

import { useState, type ElementType, type FormEvent } from "react";
import { footerModernSchema } from "./FooterModern.schema";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Music2,
  Send,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "@/lib/router";
import { SectionWrapper, SectionContainer } from "@/components/SectionWrapper";
import { cn, useSectionStyles } from "@/hooks/useSectionStyles";
import type {
  FooterModernProps,
  FooterColumn,
  FooterSocialLink,
  HeaderLogo,
} from "@/types/section-config-types";

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

function parseFooterLinks(
  value: unknown,
): Array<{ label: string; href: string; link: string; url: string }> {
  if (Array.isArray(value)) {
    return value.map((link) => {
      const href =
        (typeof link?.href === "string" && link.href) ||
        (typeof link?.link === "string" && link.link) ||
        (typeof link?.url === "string" && link.url) ||
        "#";

      return {
        ...(typeof link === "object" && link !== null ? link : {}),
        label:
          typeof link?.label === "string" && link.label.trim().length > 0
            ? link.label
            : "Lien",
        href,
        link: href,
        url: href,
      };
    });
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, hrefPart] = line.split("|");
      const label = (labelPart || "Lien").trim();
      const href = (hrefPart || "#").trim() || "#";

      return {
        label,
        href,
        link: href,
        url: href,
      };
    });
}

// ─────────────────────────────────────────
// SOCIAL ICONS MAP
// ─────────────────────────────────────────
const socialIcons: Record<string, ElementType> = {
  whatsapp: MessageCircle,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  twitter: Twitter,
  linkedin: Linkedin,
  pinterest: MessageCircle,
};

// ─────────────────────────────────────────
// LOGO COMPONENT
// ─────────────────────────────────────────
function FooterLogo({
  logo,
  textColor,
  accentColor,
  onClick,
  classes,
}: {
  logo: HeaderLogo;
  textColor: string;
  accentColor: string;
  onClick: () => void;
  classes?: { logo?: string; logoText?: string; logoImage?: string };
}) {
  const logoText = logo.text || "Boutique";
  const letterSpacing = logo.letterSpacing || "0.02em";

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 transition-opacity hover:opacity-80",
        classes?.logo,
      )}
    >
      {logo.type === "image" && logo.image ? (
        <img
          src={logo.image}
          alt={logoText}
          className={cn("h-10 w-auto object-contain", classes?.logoImage)}
        />
      ) : logo.type === "svg" ? (
        <div className="h-10 w-10">{logo.svg}</div>
      ) : (
        <span
          className={cn("text-2xl font-bold tracking-tight", classes?.logoText)}
          style={{ color: textColor, letterSpacing }}
        >
          {logoText}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────
// NEWSLETTER FORM COMPONENT
// ─────────────────────────────────────────
function NewsletterForm({
  config,
  accentColor,
  textColor,
  backgroundColor,
  classes,
}: {
  config: {
    enabled?: boolean;
    title?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
  };
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  classes?: { newsletterForm?: string; input?: string; button?: string };
}) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!config.enabled) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-sm" style={{ color: accentColor }}>
        Merci pour votre inscription !
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3", classes?.newsletterForm)}
    >
      {(config.title || config.description) && (
        <div>
          {config.title && (
            <h4
              className="font-semibold text-lg mb-1"
              style={{ color: textColor }}
            >
              {config.title}
            </h4>
          )}
          {config.description && (
            <p className="text-sm" style={{ color: `${textColor}80` }}>
              {config.description}
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          placeholder={config.placeholder || "Votre email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm rounded-lg border outline-none transition-all",
            classes?.input,
          )}
          style={{
            backgroundColor: `${textColor}08`,
            borderColor: `${textColor}20`,
            color: textColor,
          }}
          required
        />
        <button
          type="submit"
          className={cn(
            "px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all hover:opacity-90",
            classes?.button,
          )}
          style={{ backgroundColor: accentColor, color: "#fff" }}
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">
            {config.buttonText || "S'inscrire"}
          </span>
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────
// SOCIAL LINKS COMPONENT
// ─────────────────────────────────────────
function SocialLinks({
  links,
  textColor,
  accentColor,
  classes,
}: {
  links: FooterSocialLink[];
  textColor: string;
  accentColor: string;
  classes?: { socialLinks?: string; socialLink?: string };
}) {
  if (!links.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", classes?.socialLinks)}>
      {links.map((link, index) => {
        const Icon = socialIcons[link.platform] || MessageCircle;
        return (
          <a
            key={`${link.platform}-${index}`}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all hover:opacity-80",
              classes?.socialLink,
            )}
            style={{ backgroundColor: `${textColor}12`, color: textColor }}
          >
            <Icon className="w-4 h-4" />
            <span className="capitalize">{link.platform}</span>
          </a>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// NAVIGATION COLUMN COMPONENT
// ─────────────────────────────────────────
function NavColumn({
  column,
  textColor,
  accentColor,
  onNavigate,
  classes,
}: {
  column: FooterColumn;
  textColor: string;
  accentColor: string;
  onNavigate: (href: string) => void;
  classes?: {
    navColumn?: string;
    navTitle?: string;
    navList?: string;
    navLink?: string;
  };
}) {
  return (
    <div className={classes?.navColumn}>
      <h4
        className={cn("font-semibold mb-3", classes?.navTitle)}
        style={{ color: textColor }}
      >
        {column.title}
      </h4>
      <ul className={cn("space-y-2.5", classes?.navList)}>
        {column.links.map((link, linkIndex) => (
          <li key={linkIndex}>
            <button
              onClick={() => onNavigate(link.href || link.link || link.url || "#")}
              className={cn(
                "text-sm transition-all hover:opacity-80 text-left",
                link.external && "inline-flex items-center gap-1",
                classes?.navLink,
              )}
              style={{ color: `${textColor}bf` }}
            >
              {link.label}
              {link.external && <ArrowRight className="w-3 h-3" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────
// CONTACT INFO COMPONENT
// ─────────────────────────────────────────
function ContactInfo({
  address,
  phone,
  email,
  accentColor,
  textColor,
  classes,
}: {
  address?: string;
  phone?: string;
  email?: string;
  accentColor: string;
  textColor: string;
  classes?: { contactItem?: string };
}) {
  const items = [
    address ? { icon: MapPin, label: address, href: undefined } : null,
    phone ? { icon: Phone, label: phone, href: `tel:${phone}` } : null,
    email ? { icon: Mail, label: email, href: `mailto:${email}` } : null,
  ].filter(Boolean) as Array<{
    icon: ElementType;
    label: string;
    href?: string;
  }>;

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const Icon = item.icon;
        const content = (
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl px-4 py-2.5",
              classes?.contactItem,
            )}
            style={{ backgroundColor: `${textColor}08` }}
          >
            <Icon className="w-4 h-4 mt-1" style={{ color: accentColor }} />
            <span
              className="text-sm leading-6"
              style={{ color: `${textColor}d9` }}
            >
              {item.label}
            </span>
          </div>
        );

        return item.href ? (
          <a
            key={index}
            href={item.href}
            className="block hover:opacity-80 transition-opacity"
          >
            {content}
          </a>
        ) : (
          <div key={index}>{content}</div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN FOOTER MODERN COMPONENT
// ─────────────────────────────────────────
export function FooterModern({
  id,
  testId,
  content = {},
  config = {},
  style = {},
  classes = {},
}: FooterModernProps & { isPreview?: boolean }) {
  const navigate = useNavigate();

  // ── EXTRACT CONTENT ──
  const {
    logo,
    description,
    columns = [],
    newsletter,
    social = [],
    copyright,
    legalLinks,
    contactInfo,
  } = content;
  const normalizedLogo =
    typeof logo === "string" ? { type: "text" as const, text: logo } : logo;
  const normalizedColumns = columns.map((column) => ({
    ...column,
    links: parseFooterLinks(column.links),
  }));
  const socialLinks = Array.isArray(social)
    ? social
    : Object.entries(social || {})
        .filter(([, url]) => typeof url === "string" && url.trim().length > 0)
        .map(([platform, url]) => ({
          platform,
          url,
        }));
  const normalizedLegalLinks = (legalLinks || []).map((link) => ({
    ...link,
    href: link.href || link.link || link.url || "#",
  }));
  const whatsappLink = socialLinks.find((item) => item.platform === "whatsapp")?.url;

  // ── EXTRACT CONFIG ──
  const {
    variant = "asymmetric",
    columnsRatio = "2:1:1",
    showNewsletter = true,
    showSocial = true,
    showPayment = false,
    animation = {},
  } = config;

  // ── EXTRACT STYLE ──
  const {
    colors: styleColors = {},
    spacing: styleSpacing = {},
    border: styleBorder = {},
  } = style;

  const {
    background: backgroundColor = "primary",
    text: textColor = "white",
    accent: accentColor = "accent",
    border: borderColor,
  } = styleColors;

  const { container = "contained", paddingY = "16" } = styleSpacing;

  // ── HOOKS ──
  const { css } = useSectionStyles(style);

  // ── HELPERS ──
  const resolvedBgColor = resolveColor(backgroundColor, "#1a1a1a");
  const resolvedTextColor = resolveColor(textColor, "#ffffff");
  const resolvedAccentColor = resolveColor(accentColor, "#c9a96e");
  const resolvedBorderColor = borderColor
    ? resolveColor(borderColor, `${resolvedTextColor}20`)
    : `${resolvedTextColor}20`;

  const handleNavigation = (href?: string) => {
    if (!href) {
      return;
    }

    if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.location.href = href;
    }
  };

  // ── LAYOUT CONFIG ──
  const isNewsletterTop = variant === "newsletter-top";
  const isGrid4 = variant === "grid-4";
  const isMinimal = variant === "minimal";
  const isCentered = variant === "centered";

  // Ratio parsing for asymmetric layout
  const [col1Ratio, col2Ratio, col3Ratio] = columnsRatio
    .split(":")
    .map((r) => parseFloat(r) || 1);

  // ── RENDER ──
  return (
    <SectionWrapper
      id={id}
      testId={testId}
      as="footer"
      animation={animation}
      className={cn("w-full relative overflow-hidden", classes.root)}
      style={{
        background: `linear-gradient(180deg, ${resolvedBgColor}, ${resolvedBgColor}f2)`,
        color: resolvedTextColor,
        ...css,
      }}
    >
      {/* Top Newsletter Section */}
      {isNewsletterTop && newsletter?.enabled && (
        <div
          className="border-b"
          style={{
            borderColor: resolvedBorderColor,
            paddingTop: `${parseInt(paddingY) * 0.25}rem`,
            paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
          }}
        >
          <SectionContainer size={container} className={classes.topSection}>
            <NewsletterForm
              config={newsletter}
              accentColor={resolvedAccentColor}
              textColor={resolvedTextColor}
              backgroundColor={resolvedBgColor}
              classes={classes}
            />
          </SectionContainer>
        </div>
      )}

      {/* Main Footer Content */}
      <div
        style={{
          paddingTop: `${parseInt(paddingY) * 0.25}rem`,
          paddingBottom: `${parseInt(paddingY) * 0.25}rem`,
        }}
      >
        <SectionContainer size={container} className={classes.mainSection}>
          {/* Main Flex Layout */}
          <div
            className={cn(
              "flex flex-wrap gap-8 lg:gap-12 mb-8",
              isCentered && "justify-center text-center",
              classes.inner,
            )}
          >
            {/* Logo & Description Group */}
            {!isMinimal && (
              <div
                className={cn(
                  "flex flex-col gap-4",
                  "flex-1 min-w-[250px] max-w-md",
                  classes.logoColumn,
                )}
              >
                {normalizedLogo && (
                  <FooterLogo
                    logo={normalizedLogo}
                    textColor={resolvedTextColor}
                    accentColor={resolvedAccentColor}
                    onClick={() => handleNavigation("/")}
                    classes={classes}
                  />
                )}

                {description ? (
                  <p
                    className="max-w-md text-sm leading-6"
                    style={{ color: `${resolvedTextColor}bf` }}
                  >
                    {description}
                  </p>
                ) : null}

                {showSocial && (
                  <SocialLinks
                    links={socialLinks}
                    textColor={resolvedTextColor}
                    accentColor={resolvedAccentColor}
                    classes={classes}
                  />
                )}

                {/* Inline Newsletter */}
                {!isNewsletterTop && newsletter?.enabled && (
                  <NewsletterForm
                    config={newsletter}
                    accentColor={resolvedAccentColor}
                    textColor={resolvedTextColor}
                    backgroundColor={resolvedBgColor}
                    classes={classes}
                  />
                )}
              </div>
            )}

            {/* Navigation Group */}
            {!isMinimal && normalizedColumns.length > 0 && (
              <div
                className={cn(
                  "flex flex-wrap gap-x-8 gap-y-6",
                  "flex-1 justify-start lg:justify-center",
                  classes.navColumns,
                )}
              >
                {normalizedColumns.map((column, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col gap-3",
                      "min-w-[140px]",
                      columns.length <= 2 ? "flex-1" : "",
                    )}
                  >
                    <NavColumn
                      column={column}
                      textColor={resolvedTextColor}
                      accentColor={resolvedAccentColor}
                      onNavigate={handleNavigation}
                      classes={classes}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Contact Info Group */}
            {!isMinimal &&
              (contactInfo?.address ||
                contactInfo?.phone ||
                contactInfo?.email) && (
                <div
                  className={cn(
                    "flex flex-col gap-3",
                    "flex-1 min-w-[200px] max-w-xs",
                    classes.contactColumn,
                  )}
                >
                  <h4
                    className="font-semibold text-lg"
                    style={{ color: resolvedTextColor }}
                  >
                    {contactInfo?.title || "Restons en contact"}
                  </h4>
                  <ContactInfo
                    address={contactInfo?.address}
                    phone={contactInfo?.phone}
                    email={contactInfo?.email}
                    accentColor={resolvedAccentColor}
                    textColor={resolvedTextColor}
                    classes={classes}
                  />
                </div>
              )}

            {/* Minimal Layout - Just centered logo and copyright */}
            {isMinimal && normalizedLogo && (
              <div className="flex flex-col items-center gap-4">
                <FooterLogo
                  logo={normalizedLogo}
                  textColor={resolvedTextColor}
                  accentColor={resolvedAccentColor}
                  onClick={() => handleNavigation("/")}
                  classes={classes}
                />
                <p
                  className="text-sm"
                  style={{ color: `${resolvedTextColor}80` }}
                >
                  {copyright}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          {!isMinimal && (
            <div
              className={cn(
                "pt-5 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm",
                classes.bottomSection,
              )}
              style={{
                borderColor: resolvedBorderColor,
                color: `${resolvedTextColor}80`,
              }}
            >
              <p className={classes.copyright}>{copyright}</p>

              {/* Legal Links */}
              {normalizedLegalLinks.length > 0 && (
                <div className={cn("flex flex-wrap gap-4", classes.legalLinks)}>
                  {normalizedLegalLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigation(link.href || link.link || link.url || "#")}
                      className="hover:opacity-80 transition-opacity"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}

              {/* WhatsApp CTA */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  style={{ color: resolvedAccentColor }}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer un message sur WhatsApp</span>
                </a>
              )}
            </div>
          )}
        </SectionContainer>
      </div>
    </SectionWrapper>
  );
}

Object.assign(FooterModern, { schema: footerModernSchema });

export const schema = footerModernSchema;

export default FooterModern;
