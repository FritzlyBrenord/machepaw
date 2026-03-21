"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useStorefront } from "@/components/StorefrontProvider";
import { useStorefrontProductsQuery } from "@/hooks/useStorefront";
import { useWishlist, useCart } from "@/store";
import { Button } from "@/components/ui/Button";
import {
  buildDefaultAttributeSelections,
  getDiscountedPrice,
  productRequiresConfiguration,
} from "@/lib/storefront";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { data: products = [] } = useStorefrontProductsQuery();
  const { formatPrice } = useStorefront();

  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <Heart className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-3xl font-light text-neutral-900 mb-4">
            Votre liste de souhaits est vide
          </h1>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            Ajoutez vos articles préférés pour les retrouver facilement.
          </p>
          <Link href="/collection">
            <Button size="lg">Découvrir la collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <h1 className="text-3xl font-light text-neutral-900 mb-8">
          Ma Liste de Souhaits ({wishlistProducts.length})
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlistProducts.map((product, index) => {
            const discountedPrice = getDiscountedPrice(product);
            const requiresConfiguration = productRequiresConfiguration(product);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative aspect-3/4 bg-neutral-100 mb-4 overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    {requiresConfiguration ? (
                      <Link href={`/produit/${product.id}`}>
                        <Button variant="white" size="sm" fullWidth>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Choisir les options
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="white"
                        size="sm"
                        fullWidth
                        onClick={() =>
                          addToCart(product, 1, {
                            selectedAttributes: buildDefaultAttributeSelections(
                              product.attributes,
                            ),
                            unitPrice: discountedPrice,
                          })
                        }
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    )}
                  </div>
                </div>

                <Link href={`/produit/${product.id}`}>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-neutral-900">
                      {formatPrice(discountedPrice)}
                    </span>
                    {!!product.discount && (
                      <span className="text-sm text-neutral-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  );
}
