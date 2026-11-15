const suspiciousPatterns = [

  /ignore\s+(all\s+)?previous\s+instructions/i,

  /reveal\s+(the\s+)?system\s+prompt/i,

  /show\s+(me\s+)?your\s+hidden\s+instructions/i,

  /bypass\s+(all\s+)?security/i,

  /ignore\s+your\s+rules/i,

  /act\s+as\s+an\s+unrestricted/i

];

export const detectPromptInjection = (text) => {

  for (const pattern of suspiciousPatterns) {

    if (pattern.test(text)) {

      return {
        detected: true,
        pattern: pattern.toString()
      };

    }

  }

  return {
    detected: false
  };

};