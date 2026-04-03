import type { SectionSchema } from "@/lib/section-registry";

export const newsletterSchema: SectionSchema = {
  name: "Newsletter",
  type: "newsletter",
  category: "content",
  description: "Bloc d'inscription newsletter avec variantes de formulaire",
  icon: "Layout",
  settings: [
    { id: "content.title", type: "text", label: "Titre", default: "Rejoignez notre cercle" },
    {
      id: "content.description",
      type: "textarea",
      label: "Description",
      default: "Recevez en avant-premiere nos nouveautes, offres et inspirations.",
    },
    { id: "content.placeholder", type: "text", label: "Placeholder", default: "Votre adresse email" },
    { id: "content.buttonText", type: "text", label: "Texte bouton", default: "S'inscrire" },
    {
      id: "content.privacyText",
      type: "text",
      label: "Texte privacy",
      default: "J'accepte de recevoir la newsletter",
    },
    {
      id: "content.successMessage",
      type: "textarea",
      label: "Message de succes",
      default: "Vous recevrez prochainement nos offres et nouveautes en avant-premiere.",
    },
    { id: "content.imageUrl", type: "image", label: "Image split", default: "" },
    {
      id: "config.variant",
      type: "select",
      label: "Variant",
      options: [
        { value: "centered", label: "Centered" },
        { value: "inline", label: "Inline" },
        { value: "minimal", label: "Minimal" },
        { value: "split", label: "Split" },
      ],
      default: "centered",
    },
    {
      id: "config.showPrivacy",
      type: "checkbox",
      label: "Afficher la case privacy",
      default: true,
    },
    {
      id: "config.requirePrivacy",
      type: "checkbox",
      label: "Privacy obligatoire",
      default: true,
    },
  ],
  blocks: [],
  defaults: {
    content: {
      title: "Rejoignez notre cercle",
      description: "Recevez en avant-premiere nos nouveautes, offres et inspirations.",
      placeholder: "Votre adresse email",
      buttonText: "S'inscrire",
      privacyText: "J'accepte de recevoir la newsletter",
      successMessage:
        "Vous recevrez prochainement nos offres et nouveautes en avant-premiere.",
      fields: ["email"],
      imageUrl: "",
    },
    config: {
      variant: "centered",
      showPrivacy: true,
      requirePrivacy: true,
      animation: {
        entrance: "fade-in",
        stagger: true,
      },
    },
    style: {
      colors: {
        background: "primary",
        text: "white",
        accent: "accent",
      },
      typography: {
        titleSize: "4xl",
        textAlign: "center",
      },
      spacing: {
        paddingY: "16",
        container: "contained",
      },
      border: {
        inputRadius: "full",
      },
    },
    classes: {},
  },
};

export default newsletterSchema;
