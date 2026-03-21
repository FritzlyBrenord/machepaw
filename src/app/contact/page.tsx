"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    content: "12 Avenue des Champs-Élysées",
    subContent: "75008 Paris, France",
  },
  {
    icon: Phone,
    title: "Téléphone",
    content: "+33 1 23 45 67 89",
    subContent: "Lun-Ven, 9h-19h",
  },
  {
    icon: Mail,
    title: "Email",
    content: "contact@luxe.com",
    subContent: "Service client 24/7",
  },
  {
    icon: Clock,
    title: "Horaires",
    content: "Lun-Sam: 10h-20h",
    subContent: "Dim: 12h-18h",
  },
];

const boutiques = [
  {
    city: "Paris",
    address: "12 Avenue des Champs-Élysées, 75008",
    phone: "+33 1 23 45 67 89",
  },
  {
    city: "Genève",
    address: "Rue du Rhône 42, 1204",
    phone: "+41 22 123 45 67",
  },
  {
    city: "Milan",
    address: "Via Montenapoleone 8, 20121",
    phone: "+39 02 123 45 67",
  },
  {
    city: "Londres",
    address: "Bond Street 25, W1S 1RS",
    phone: "+44 20 1234 5678",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <section className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <span className="text-amber-400 text-sm uppercase tracking-[0.3em] mb-4 block">
              Contact
            </span>
            <h1 className="text-4xl md:text-5xl font-light mb-4">
              Restons en contact
            </h1>
            <p className="text-white/70">
              Notre équipe de conseillers est à votre disposition pour toute question 
              ou demande personnalisée.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 shadow-lg border border-neutral-100"
              >
                <div className="w-12 h-12 bg-neutral-900 text-white flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">{info.title}</h3>
                <p className="text-neutral-900">{info.content}</p>
                <p className="text-sm text-neutral-500">{info.subContent}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-light text-neutral-900 mb-2">
                Envoyez-nous un message
              </h2>
              <p className="text-neutral-500 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans les 24h.
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-green-50 border border-green-200 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-green-800 mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-green-600">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                        placeholder="jean@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="order">Question sur une commande</option>
                      <option value="product">Renseignement produit</option>
                      <option value="return">Retour & Remboursement</option>
                      <option value="appointment">Rendez-vous en boutique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-900 focus:outline-none resize-none"
                      placeholder="Votre message..."
                    />
                  </div>
                  <Button type="submit" size="lg" fullWidth>
                    <Send className="w-5 h-5 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-neutral-100 min-h-[400px] lg:min-h-0"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500">
                    Carte interactive de nos boutiques
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Boutiques */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-amber-600 text-sm uppercase tracking-[0.2em] mb-4 block">
              Nos Boutiques
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900">
              Venez nous rencontrer
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {boutiques.map((boutique, index) => (
              <motion.div
                key={boutique.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 border border-neutral-200"
              >
                <h3 className="text-xl font-medium text-neutral-900 mb-4">
                  {boutique.city}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-600">{boutique.address}</p>
                  <p className="text-neutral-900 font-medium">{boutique.phone}</p>
                </div>
                <button className="mt-4 text-sm text-neutral-900 underline hover:no-underline">
                  Voir l&apos;itinéraire
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-2xl font-light text-neutral-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-neutral-500 mb-6 max-w-xl mx-auto">
            Consultez notre FAQ pour trouver rapidement des réponses à vos questions 
            sur les commandes, la livraison, les retours et plus encore.
          </p>
          <Button variant="outline">Consulter la FAQ</Button>
        </div>
      </section>
    </div>
  );
}
