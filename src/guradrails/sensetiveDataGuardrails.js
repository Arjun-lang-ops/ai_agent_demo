export const redactSensitiveData = (text) => {

  let safeText = text;

  // Redact email addresses
  safeText = safeText.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    "[EMAIL REDACTED]"
  );

  // Redact phone numbers (basic international pattern)
  safeText = safeText.replace(
    /(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)/g,
    "[PHONE REDACTED]"
  );

  // Redact common credential assignments
  safeText = safeText.replace(
    /\b(password|api[_-]?key|secret)\s*[:=]\s*\S+/gi,
    "$1=[REDACTED]"
  );

  return safeText;

};