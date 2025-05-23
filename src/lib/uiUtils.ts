import { clsx, type ClassValue } from "clsx"
import { marked } from 'marked'
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts markdown to HTML asynchronously using marked and sanitizes the result with DOMPurify.
 * @param markdown The markdown string to convert.
 * @returns A Promise that resolves to a sanitized HTML string.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const html = await marked.parse(markdown, { async: true }) as string
  return DOMPurify.sanitize(html)
}
