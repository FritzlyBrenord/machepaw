import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "HTG"): string {
  return new Intl.NumberFormat("fr-HT", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscountedPrice(
  price: number,
  discount?: number
): number {
  if (!discount || discount <= 0) return price;
  return price * (1 - discount / 100);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function generateStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    "★".repeat(fullStars) +
    (hasHalfStar ? "☆" : "") +
    "☆".repeat(emptyStars)
  );
}

export function getEstimatedDeliveryRange(minDays: number = 1, maxDays: number = 5, baseDate: string | Date = new Date()): string {
  const startDate = new Date(baseDate);
  
  const minDate = new Date(startDate);
  minDate.setDate(minDate.getDate() + minDays);
  
  const maxDate = new Date(startDate);
  maxDate.setDate(maxDate.getDate() + maxDays);

  const formatterDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });
  const formatterMonth = new Intl.DateTimeFormat("fr-FR", { month: "long" });
  const formatterYear = new Intl.DateTimeFormat("fr-FR", { year: "numeric" });

  const minDayStr = formatterDay.format(minDate);
  const minMonthStr = formatterMonth.format(minDate);
  const minYearStr = formatterYear.format(minDate);

  const maxDayStr = formatterDay.format(maxDate);
  const maxMonthStr = formatterMonth.format(maxDate);
  const maxYearStr = formatterYear.format(maxDate);

  if (minMonthStr === maxMonthStr && minYearStr === maxYearStr) {
    return `${minDayStr} au ${maxDayStr} ${maxMonthStr} ${maxYearStr}`;
  } else if (minYearStr === maxYearStr) {
    return `${minDayStr} ${minMonthStr} au ${maxDayStr} ${maxMonthStr} ${maxYearStr}`;
  } else {
    return `${minDayStr} ${minMonthStr} ${minYearStr} au ${maxDayStr} ${maxMonthStr} ${maxYearStr}`;
  }
}
