"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { useUI } from "@/store";
import { products, categories } from "@/data";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  "Quels sont vos best-sellers ?",
  "Avez-vous des promotions ?",
  "Comment suivre ma commande ?",
  "Quels sont les délais de livraison ?",
];

export function ChatBot() {
  const { isChatOpen, toggleChat } = useUI();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content:
        "Bonjour ! Je suis votre assistant virtuel LUXE. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Best sellers
    if (
      lowerMessage.includes("best-seller") ||
      lowerMessage.includes("populaire")
    ) {
      const bestsellers = products.filter((p) => p.isBestseller).slice(0, 3);
      return `Nos best-sellers actuels sont :
${bestsellers.map((p) => `• ${p.name} - ${p.price}€`).join("\n")}

Voulez-vous en savoir plus sur l'un d'eux ?`;
    }

    // Promotions
    if (
      lowerMessage.includes("promo") ||
      lowerMessage.includes("réduction") ||
      lowerMessage.includes("solde")
    ) {
      const discounted = products.filter((p) => p.discount && p.discount > 0);
      if (discounted.length > 0) {
        return `Nous avons actuellement ${discounted.length} produits en promotion :
${discounted.map((p) => `• ${p.name} : -${p.discount}%`).join("\n")}

Consultez notre page collection pour voir tous les articles en solde !`;
      }
      return "Pour le moment, nous n'avons pas de promotions en cours. Inscrivez-vous à notre newsletter pour être informé en priorité !";
    }

    // Delivery
    if (lowerMessage.includes("livraison") || lowerMessage.includes("délai")) {
      return `Nos délais de livraison sont :
• France métropolitaine : 2-3 jours ouvrés
• Europe : 3-5 jours ouvrés
• International : 5-10 jours ouvrés

Livraison gratuite à partir de 500€ d'achat !`;
    }

    // Order tracking
    if (
      lowerMessage.includes("suivi") ||
      lowerMessage.includes("commande") ||
      lowerMessage.includes("colis")
    ) {
      return `Pour suivre votre commande :
1. Connectez-vous à votre compte
2. Allez dans "Mes commandes"
3. Cliquez sur la commande souhaitée

Vous y trouverez le numéro de suivi et le lien vers le transporteur.

Avez-vous déjà un compte chez nous ?`;
    }

    // Returns
    if (
      lowerMessage.includes("retour") ||
      lowerMessage.includes("remboursement")
    ) {
      return `Notre politique de retour :
• Retours acceptés sous 30 jours
• Produits non portés avec étiquettes
• Remboursement sous 5 jours ouvrés après réception

Pour initier un retour, allez dans votre espace client > Mes commandes.`;
    }

    // Categories
    if (
      lowerMessage.includes("catégorie") ||
      lowerMessage.includes("produit")
    ) {
      return `Nous proposons les catégories suivantes :
${categories.map((c) => `• ${c.name} (${c.productCount} produits)`).join("\n")}

Quelle catégorie vous intéresse ?`;
    }

    // Watches
    if (lowerMessage.includes("montre")) {
      const watches = products.filter((p) => p.category === "Montres");
      return `Nous avons ${watches.length} montres de luxe en stock, de ${Math.min(
        ...watches.map((w) => w.price),
      )}€ à ${Math.max(...watches.map((w) => w.price))}€.

Nos montres sont certifiées authentiques avec garantie internationale de 2 ans.`;
    }

    // Jewelry
    if (
      lowerMessage.includes("bijou") ||
      lowerMessage.includes("bague") ||
      lowerMessage.includes("collier")
    ) {
      return `Notre collection de bijoux comprend :
• Bagues solitaires et alliances
• Colliers et pendentifs
• Bracelets
• Boucles d'oreilles

Tous nos bijoux sont en or 18k avec certificat d'authenticité. Souhaitez-vous voir une catégorie spécifique ?`;
    }

    // Price
    if (lowerMessage.includes("prix") || lowerMessage.includes("budget")) {
      return `Nous avons des produits dans toutes les gammes de prix :
• Accessoires : 200€ - 500€
• Maroquinerie : 300€ - 5,000€
• Montres : 5,000€ - 60,000€
• Haute Joaillerie : sur demande

Quel est votre budget approximatif ?`;
    }

    // Greeting
    if (
      lowerMessage.includes("bonjour") ||
      lowerMessage.includes("salut") ||
      lowerMessage.includes("hello")
    ) {
      return "Bonjour ! Ravie de vous accueillir sur LUXE. Je peux vous aider à trouver un produit, suivre une commande, ou répondre à vos questions. Que souhaitez-vous faire ?";
    }

    // Thanks
    if (lowerMessage.includes("merci") || lowerMessage.includes("thank")) {
      return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Puis-je vous aider à trouver un produit spécifique ?";
    }

    // Default
    return `Je comprends. Pour mieux vous aider, pourriez-vous me préciser :

• Cherchez-vous un produit spécifique ?
• Avez-vous besoin d'aide pour une commande existante ?
• Souhaitez-vous des informations sur nos services ?

Vous pouvez aussi utiliser les suggestions rapides ci-dessous !`;
  };

  const handleSend = async (content: string = input) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: generateResponse(content),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000,
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-neutral-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-neutral-800 transition-colors"
      >
        {isChatOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] bg-white shadow-2xl border border-neutral-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-neutral-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium">Assistant LUXE</h3>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/10 transition-colors rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-neutral-900 text-white"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 text-sm whitespace-pre-line ${
                      message.type === "user"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-900 shadow-sm"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length < 3 && (
              <div className="px-4 py-3 bg-white border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-2">
                  Questions fréquentes :
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSend(question)}
                      className="text-xs px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-neutral-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none text-sm"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
