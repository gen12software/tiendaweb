import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isFreeShipping(threshold: number | null, subtotal: number): boolean {
  return threshold !== null && subtotal >= threshold
}
