"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Search,
  Palette,
  Layout,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Wand2,
  Store,
  Target,
  Users,
  DollarSign,
  Globe,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  MessageSquare,
  Bot,
  User,
  Send,
  AlertCircle,
  Zap,
} from "lucide-react";

// Types
interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface Section {
  id: string;
  type:
    | "hero"
    | "features"
    | "products"
    | "testimonials"
    | "newsletter"
    | "footer";
  props: Record<string, any>;
}

interface GeneratedTemplate {
  name: string;
  description: string;
  category: string;
  colorScheme: ColorScheme;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  globalStyle: {
    borderRadius: string;
    containerWidth: string;
    spacing: string;
  };
  sections: Section[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "template" | "thinking" | "error";
  template?: GeneratedTemplate;
  analysis?: string;
}

interface Question {
  id: string;
  question: string;
  options?: string[];
  type: "text" | "choice" | "multiselect";
  icon: React.ReactNode;
}

export default function AITemplateGenerator() {
  const [step, setStep] = useState<
    "welcome" | "interview" | "research" | "generating" | "result" | "error"
  >("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] =
    useState<GeneratedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions: Question[] = [
    {
      id: "business_type",
      question: "Quel type de boutique souhaitez-vous créer ?",
      type: "choice",
      options: [
        "Mode & Luxe",
        "Électronique & Tech",
        "Maison & Déco",
        "Sport & Fitness",
        "Alimentaire & Gourmet",
        "Beauté & Bien-être",
        "Artisanat & Handmade",
        "Autre",
      ],
      icon: <Store className="w-5 h-5" />,
    },
    {
      id: "target_audience",
      question: "Qui est votre client idéal ?",
      type: "choice",
      options: [
        "Jeunes adultes (18-25)",
        "Professionnels (25-40)",
        "Familles",
        "Seniors",
        "Niche premium",
        "Tous publics",
      ],
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "price_range",
      question: "Quelle est votre gamme de prix ?",
      type: "choice",
      options: [
        "Économique (< 50€)",
        "Milieu de gamme (50-200€)",
        "Premium (200-500€)",
        "Luxe (> 500€)",
        "Mixte",
      ],
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: "brand_personality",
      question: "Comment décririez-vous l'identité de votre marque ?",
      type: "choice",
      options: [
        "Élégant & Sophistiqué",
        "Moderne & Minimaliste",
        "Audacieux & Créatif",
        "Authentique & Artisanal",
        "Technologique & Futuriste",
        "Chaleureux & Familial",
      ],
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: "preferred_colors",
      question: "Des préférences de couleurs spécifiques ? (optionnel)",
      type: "text",
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: "must_have_features",
      question: "Fonctionnalités indispensables ?",
      type: "multiselect",
      options: [
        "Filtres avancés",
        "Avis clients",
        "Wishlist",
        "Live chat",
        "Newsletter",
        "Multilingue",
      ],
      icon: <Layout className="w-5 h-5" />,
    },
    {
      id: "inspiration",
      question: "Sites ou marques qui vous inspirent ? (optionnel)",
      type: "text",
      icon: <Globe className="w-5 h-5" />,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startInterview = () => {
    setStep("interview");
    setMessages([
      {
        role: "assistant",
        content:
          "Bonjour ! Je suis votre architecte de templates IA. Je vais vous poser quelques questions pour comprendre votre vision, puis je rechercherai les meilleures pratiques du secteur pour créer un template sur-mesure. Commençons !",
        type: "text",
      },
    ]);
    askQuestion(0);
  };

  const askQuestion = (index: number) => {
    if (index >= questions.length) {
      startResearch();
      return;
    }

    setCurrentQuestionIndex(index);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: questions[index].question,
          type: "text",
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleAnswer = (answer: string) => {
    const currentQ = questions[currentQuestionIndex];
    const newAnswers = { ...userAnswers, [currentQ.id]: answer };
    setUserAnswers(newAnswers);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: answer,
        type: "text",
      },
    ]);

    setInputValue("");

    setTimeout(() => {
      askQuestion(currentQuestionIndex + 1);
    }, 400);
  };

  const startResearch = async () => {
    setStep("research");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "🔍 Recherche en cours... J'analyse les tendances actuelles du secteur " +
          userAnswers.business_type,
        type: "thinking",
      },
    ]);

    try {
      const response = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: userAnswers,
          step: "research",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur de recherche");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Analyse terminée !\n\n${data.analysis}`,
          type: "thinking",
        },
      ]);

      // Attendre un peu pour la lisibilité
      setTimeout(() => {
        generateTemplate();
      }, 1000);
    } catch (err) {
      handleError(
        "Erreur lors de la recherche. Vérifiez votre clé API dans .env.local",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateTemplate = async () => {
    setStep("generating");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "⚙️ Génération du template personnalisé avec les meilleures pratiques identifiées...",
        type: "thinking",
      },
    ]);

    try {
      const response = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: userAnswers,
          step: "generate",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur de génération");
      }

      const data = await response.json();

      if (!data.template) {
        throw new Error("Template non généré");
      }

      setGeneratedTemplate(data.template);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Votre template est prêt ! Voici la structure complète générée selon vos spécifications.",
          type: "template",
          template: data.template,
        },
      ]);

      setStep("result");
    } catch (err) {
      handleError(
        err instanceof Error ? err.message : "Erreur de génération du template",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (message: string) => {
    setError(message);
    setStep("error");
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: message,
        type: "error",
      },
    ]);
  };

  const copyTemplate = () => {
    if (generatedTemplate) {
      navigator.clipboard.writeText(JSON.stringify(generatedTemplate, null, 2));
      // Feedback visuel
      const btn = document.getElementById("copy-btn");
      if (btn) {
        btn.textContent = "Copié !";
        setTimeout(() => (btn.textContent = "Copier"), 2000);
      }
    }
  };

  const downloadTemplate = () => {
    if (generatedTemplate) {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(generatedTemplate, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `template-${generatedTemplate.category || "boutique"}.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const resetGenerator = () => {
    setStep("welcome");
    setMessages([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setGeneratedTemplate(null);
    setInputValue("");
    setError(null);
  };

  // Composants UI
  const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
    <div className="flex flex-col gap-1">
      <div
        className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-gray-500 font-mono uppercase">
        {label}
      </span>
      <span className="text-[10px] text-gray-400 font-mono">{color}</span>
    </div>
  );

  const ChatMessage = ({ message }: { message: Message }) => {
    if (message.type === "template" && message.template) {
      const t = message.template;
      return (
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div
            className="p-6 md:p-8 border-b border-gray-100"
            style={{ backgroundColor: t.colorScheme.background }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium"
                    style={{ color: t.colorScheme.accent }}
                  >
                    {t.category}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: t.colorScheme.text + "80" }}
                  >
                    <Zap className="w-3 h-3" />
                    IA Généré
                  </span>
                </div>
                <h3
                  className="text-3xl md:text-4xl font-bold"
                  style={{
                    color: t.colorScheme.text,
                    fontFamily: t.typography.headingFont,
                  }}
                >
                  {t.name}
                </h3>
                <p
                  className="mt-2 text-base"
                  style={{ color: t.colorScheme.text + "99" }}
                >
                  {t.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  id="copy-btn"
                  onClick={copyTemplate}
                  className="px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                  style={{ color: t.colorScheme.text }}
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    backgroundColor: t.colorScheme.accent,
                    color: t.colorScheme.background,
                  }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            </div>

            {/* Palette */}
            <div className="flex flex-wrap gap-4 p-4 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
              <ColorSwatch color={t.colorScheme.primary} label="Primary" />
              <ColorSwatch color={t.colorScheme.secondary} label="Secondary" />
              <ColorSwatch color={t.colorScheme.accent} label="Accent" />
              <ColorSwatch
                color={t.colorScheme.background}
                label="Background"
              />
              <ColorSwatch color={t.colorScheme.text} label="Text" />
            </div>
          </div>

          {/* Sections */}
          <div className="p-6 md:p-8 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2 text-lg">
              <Layout className="w-5 h-5 text-indigo-600" />
              Structure ({t.sections.length} sections)
            </h4>

            <div className="grid gap-4">
              {t.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: t.colorScheme.accent }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 capitalize text-lg">
                      {section.type}
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                      {section.type === "hero" &&
                        "Bannière principale avec titre et CTA"}
                      {section.type === "features" &&
                        `${section.props.items?.length || 4} avantages clés`}
                      {section.type === "products" &&
                        `Grille de ${section.props.products?.length || 4} produits`}
                      {section.type === "testimonials" &&
                        `Témoignages clients (${section.props.items?.length || 2} avis)`}
                      {section.type === "newsletter" &&
                        "Inscription email avec CTA"}
                      {section.type === "footer" &&
                        "Liens et informations légales"}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-indigo-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Code Preview */}
            <div className="mt-8 p-4 bg-gray-900 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-4 text-gray-400 text-xs uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  template.json
                </span>
                <span className="text-gray-600">Ready to use</span>
              </div>
              <pre className="text-xs md:text-sm text-green-400 font-mono leading-relaxed overflow-x-auto pb-2">
                {JSON.stringify(t, null, 2).slice(0, 1200)}
                {JSON.stringify(t, null, 2).length > 1200 && "\n..."}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 md:p-8 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadTemplate}
              className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
              <Download className="w-5 h-5" />
              Exporter le Template
            </button>
            <button
              onClick={resetGenerator}
              className="px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Créer un autre
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === "assistant"
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200"
              : "bg-gray-900 text-white"
          }`}
        >
          {message.role === "assistant" ? (
            <Bot className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <div
          className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
            message.role === "assistant"
              ? message.type === "thinking"
                ? "bg-indigo-50 border border-indigo-100 text-indigo-900"
                : message.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-white border border-gray-200 text-gray-800 shadow-sm"
              : "bg-gray-900 text-white"
          }`}
        >
          {message.type === "thinking" && (
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-medium text-xs uppercase tracking-wider">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyse en cours
            </div>
          )}
          {message.type === "error" && (
            <div className="flex items-center gap-2 mb-2 text-red-600 font-medium text-xs uppercase tracking-wider">
              <AlertCircle className="w-3 h-3" />
              Erreur
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg tracking-tight">
                Template AI Studio
              </h1>
              <p className="text-xs text-gray-500">
                Générateur intelligent de templates e-commerce
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              API Gratuite
            </div>
            {step !== "welcome" && step !== "result" && (
              <button
                onClick={resetGenerator}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                title="Recommencer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {step === "welcome" && (
          <div className="max-w-3xl mx-auto text-center py-12 md:py-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-8 border border-indigo-100">
              <Wand2 className="w-4 h-4" />
              Propulsé par Gemini 2.5 Flash + OpenRouter
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Créez votre boutique <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                en 5 minutes
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Je analyse votre secteur via recherche web, étudie vos concurrents
              et génère un template e-commerce premium optimisé pour votre
              cible.
            </p>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 text-left">
              <div className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. Interview intelligente
                </h3>
                <p className="text-sm text-gray-600">
                  7 questions ciblées pour comprendre votre vision unique
                </p>
              </div>

              <div className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-purple-200 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. Recherche sectorielle
                </h3>
                <p className="text-sm text-gray-600">
                  Analyse des tendances 2026 et meilleures pratiques UX
                </p>
              </div>

              <div className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-green-200 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <Layout className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. Template sur-mesure
                </h3>
                <p className="text-sm text-gray-600">
                  Structure, couleurs et contenu personnalisés par IA
                </p>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Commencer la création
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Gratuit
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Export JSON immédiat
              </span>
            </p>
          </div>
        )}

        {(step === "interview" ||
          step === "research" ||
          step === "generating" ||
          step === "error") && (
          <div className="max-w-3xl mx-auto">
            {/* Progress */}
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between text-xs md:text-sm text-gray-500 mb-2 font-medium">
                <span className={step === "interview" ? "text-indigo-600" : ""}>
                  Interview
                </span>
                <span className={step === "research" ? "text-indigo-600" : ""}>
                  Recherche
                </span>
                <span
                  className={
                    step === "generating" || step === "result"
                      ? "text-indigo-600"
                      : ""
                  }
                >
                  Génération
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out"
                  style={{
                    width:
                      step === "interview"
                        ? `${Math.max(10, (currentQuestionIndex / questions.length) * 33)}%`
                        : step === "research"
                          ? "66%"
                          : step === "generating"
                            ? "85%"
                            : "100%",
                  }}
                />
              </div>
            </div>

            {/* Chat Container */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 md:p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
                {messages.map((msg, idx) => (
                  <ChatMessage key={idx} message={msg} />
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span className="text-sm text-gray-500">
                        En train d'écrire...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                {step === "interview" && !isTyping && !isLoading && (
                  <div className="space-y-3">
                    {questions[currentQuestionIndex]?.type === "choice" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {questions[currentQuestionIndex].options?.map(
                          (option) => (
                            <button
                              key={option}
                              onClick={() => handleAnswer(option)}
                              className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-sm md:text-base"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                                  {option}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    )}

                    {questions[currentQuestionIndex]?.type ===
                      "multiselect" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {questions[currentQuestionIndex].options?.map(
                            (option) => (
                              <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm md:text-base"
                              >
                                {option}
                              </button>
                            ),
                          )}
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Cliquez pour sélectionner et continuer
                        </p>
                      </div>
                    )}

                    {questions[currentQuestionIndex]?.type === "text" && (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            inputValue.trim() &&
                            handleAnswer(inputValue)
                          }
                          placeholder="Votre réponse..."
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            inputValue.trim() && handleAnswer(inputValue)
                          }
                          disabled={!inputValue.trim()}
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {(step === "research" ||
                  step === "generating" ||
                  isLoading) && (
                  <div className="flex items-center justify-center gap-3 text-gray-500 py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-sm font-medium">
                      {step === "research"
                        ? "Recherche web en cours..."
                        : "Génération IA..."}
                    </span>
                  </div>
                )}

                {step === "error" && (
                  <div className="flex flex-col gap-3">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <AlertCircle className="w-4 h-4" />
                        Configuration requise
                      </div>
                      <p className="mb-2">
                        Vérifiez votre fichier .env.local :
                      </p>
                      <code className="block bg-red-100 p-2 rounded text-xs font-mono">
                        OPENROUTER_API_KEY=sk-or-v1-votre-cle
                      </code>
                      <p className="mt-2 text-xs">
                        Obtenez une clé gratuite sur{" "}
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          className="underline"
                        >
                          openrouter.ai/keys
                        </a>
                      </p>
                    </div>
                    <button
                      onClick={resetGenerator}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info API */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Utilise l'API OpenRouter (Gemini 2.5 Flash) • 1,500
                requêtes/jour gratuites
              </p>
            </div>
          </div>
        )}

        {step === "result" && generatedTemplate && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4 border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                Template généré avec succès
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Votre boutique est prête !
              </h2>
              <p className="text-gray-600 mt-2">
                Template optimisé basé sur l'analyse de votre secteur
              </p>
            </div>

            <ChatMessage
              message={{
                role: "assistant",
                content: "",
                type: "template",
                template: generatedTemplate,
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Template AI Studio • Propulsé par OpenRouter & Gemini</p>
          <div className="flex gap-6 text-xs">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              API Gratuite: 1,500 req/jour
            </span>
            <span>•</span>
            <span>Modèle: gemini-2.5-flash-exp:free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
