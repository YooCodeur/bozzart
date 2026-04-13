/**
 * Sanitize HTML by stripping dangerous tags and attributes.
 * Used in server components where DOMPurify (which needs a DOM) is not available.
 * For client components, use isomorphic-dompurify directly.
 */
export function sanitizeHtml(html: string): string {
  return html
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handler attributes
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Remove javascript: protocol in href/src
    .replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""')
    // Remove style tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove iframe tags
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, "")
    // Remove object/embed tags
    .replace(/<(?:object|embed)\b[^>]*>.*?<\/(?:object|embed)>/gi, "");
}
