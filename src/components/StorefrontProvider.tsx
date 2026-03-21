"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AdminSettings, CurrencySetting } from "@/data/types";
import { useAdminSettingsQuery } from "@/hooks/useAdminSettings";
import { convertAmount, formatConvertedAmount } from "@/lib/storefront";

type StorefrontContextValue = {
  settings?: AdminSettings;
  currencies: CurrencySetting[];
  shippingRates: AdminSettings["shippingRates"];
  baseCurrency?: CurrencySetting;
  currency?: CurrencySetting;
  setCurrency: (code: string) => void;
  convertPrice: (amount: number) => number;
  formatPrice: (amount: number) => string;
};

const DEFAULT_CURRENCY: CurrencySetting = {
  code: "HTG",
  name: "Gourde Haitienne",
  symbol: "G",
  exchangeRate: 0.0076,
  isActive: true,
  isDefault: true,
  decimals: 0,
};

const STOREFRONT_CURRENCY_STORAGE_KEY = "storefront-currency";

const StorefrontContext = createContext<StorefrontContextValue | undefined>(
  undefined,
);

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: settings } = useAdminSettingsQuery();
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>();

  const currencies = useMemo(() => {
    const activeCurrencies =
      settings?.currencies?.filter((currency) => currency.isActive) || [];

    return activeCurrencies.length ? activeCurrencies : [DEFAULT_CURRENCY];
  }, [settings]);

  const baseCurrency = useMemo(
    () =>
      currencies.find((currency) => currency.isDefault) ||
      currencies[0] ||
      DEFAULT_CURRENCY,
    [currencies],
  );

  const currency = useMemo(
    () =>
      currencies.find((candidate) => candidate.code === selectedCurrencyCode) ||
      baseCurrency,
    [baseCurrency, currencies, selectedCurrencyCode],
  );

  useEffect(() => {
    const storedCurrency =
      typeof window === "undefined"
        ? undefined
        : window.localStorage.getItem(STOREFRONT_CURRENCY_STORAGE_KEY) ||
          undefined;

    setSelectedCurrencyCode(storedCurrency || baseCurrency.code);
  }, [baseCurrency.code]);

  useEffect(() => {
    if (!selectedCurrencyCode) {
      return;
    }

    window.localStorage.setItem(
      STOREFRONT_CURRENCY_STORAGE_KEY,
      selectedCurrencyCode,
    );
  }, [selectedCurrencyCode]);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      settings,
      currencies,
      shippingRates: settings?.shippingRates || [],
      baseCurrency,
      currency,
      setCurrency: setSelectedCurrencyCode,
      convertPrice: (amount: number) =>
        convertAmount(amount, baseCurrency, currency),
      formatPrice: (amount: number) =>
        formatConvertedAmount(amount, baseCurrency, currency),
    }),
    [baseCurrency, currencies, currency, settings],
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }

  return context;
}
