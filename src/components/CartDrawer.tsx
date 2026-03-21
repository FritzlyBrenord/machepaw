"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useStorefront } from "@/components/StorefrontProvider";
import { useCart, useUI } from "@/store";
import { Button } from "./ui/Button";

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount } =
    useCart();
  const { isCartOpen, toggleCart } = useUI();
  const { formatPrice } = useStorefront();

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <h2 className="text-xl font-light">Votre Panier</h2>
                <span className="bg-neutral-900 text-white text-xs px-2 py-1">
                  {cartCount} article{cartCount > 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
                  <p className="text-lg text-neutral-900 mb-2">
                    Votre panier est vide
                  </p>
                  <p className="text-neutral-500 mb-6">
                    Découvrez nos produits et ajoutez-les à votre panier
                  </p>
                  <Link href="/collection" onClick={toggleCart}>
                    <Button>Continuer les achats</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id || item.product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 pb-6 border-b border-neutral-100 last:border-0"
                    >
                      <Link
                        href={`/produit/${item.product.id}`}
                        onClick={toggleCart}
                        className="relative w-24 h-24 bg-neutral-100 flex-shrink-0"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                              {item.product.category}
                            </p>
                            <Link
                              href={`/produit/${item.product.id}`}
                              onClick={toggleCart}
                              className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            {item.selectedAttributes?.length > 0 && (
                              <p className="text-xs text-neutral-500 mt-1">
                                {item.selectedAttributes
                                  .map(
                                    (attribute) =>
                                      `${attribute.name}: ${attribute.value}`,
                                  )
                                  .join(" • ")}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              removeFromCart(item.id || item.product.id)
                            }
                            className="p-1 hover:bg-neutral-100 transition-colors ml-2"
                          >
                            <X className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-neutral-200">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id || item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              className="p-2 hover:bg-neutral-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id || item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              className="p-2 hover:bg-neutral-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-medium text-neutral-900">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </p>
                            {!!item.product.discount && (
                              <p className="text-sm text-neutral-400 line-through">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Sous-total</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  Frais de livraison calculés selon les règles en base à l’étape
                  suivante
                </p>

                <Link href="/panier" onClick={toggleCart}>
                  <Button fullWidth size="lg" className="group">
                    Voir le panier
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <button
                  onClick={toggleCart}
                  className="w-full text-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Continuer les achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
