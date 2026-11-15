import { z } from "zod";

import { detectPromptInjection } from "./injectionDetector.js";

const inputSchema = z.object({

  query: z.string()
    .trim()
    .min(2, "Query is too short")
    .max(2000, "Query is too long"),

  documentId: z.string().optional()

});

export const validateUserInput = (input) => {

  const validation = inputSchema.safeParse(input);

  if (!validation.success) {

    return {
      allowed: false,
      reason: "Invalid user input"
    };

  }

  const injectionResult = detectPromptInjection(
    validation.data.query
  );

  if (injectionResult.detected) {

    return {
      allowed: false,
      reason: "Potential prompt injection detected"
    };

  }

  return {
    allowed: true,
    data: validation.data
  };

};