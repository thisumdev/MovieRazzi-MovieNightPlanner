// Sanitizes user input to prevent XSS or injection attacks
export function sanitizeInput(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[<>]/g, "") // remove angle brackets
    .replace(/script/gi, "") // strip script tags
    .replace(/[^\w\s.,!?'"-]/g, " ") // remove other unsafe chars
    .trim();
}