import { validateUserInput } from "../guradrails/inputGuardrails.js";

export const inputGuardrail = (req, res, next) => {

  const result = validateUserInput(req.body);

  if (!result.allowed) {

    return res.status(400).json({

      success: false,

      message: result.reason

    });

  }

  req.validatedInput = result.data;

  next();

};
