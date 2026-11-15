import { redactSensitiveData } from "./sensetiveDataGuardrails.js";

export const validateOutput = (answer) => {

  if (typeof answer !== "string" || !answer.trim()) {

    return {
      allowed: false,
      reason: "Invalid AI response"
    };

  }

  if (answer.length > 10000) {

    return {
      allowed: false,
      reason: "AI response exceeds the allowed length"
    };

  }

  const safeAnswer = redactSensitiveData(answer);

  return {

    allowed: true,

    answer: safeAnswer

  };

};
