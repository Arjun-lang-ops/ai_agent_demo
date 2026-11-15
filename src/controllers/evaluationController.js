import {
  runEvaluationSuite
} from "../services/evaluationService.js";

export const runEvaluationController = async (
  req,
  res
) => {

  const k = Number(req.body.k || 5);

  if (!Number.isInteger(k) || k < 1 || k > 20) {

    return res.status(400).json({

      success: false,

      message: "K must be between 1 and 20."

    });

  }

  const result = await runEvaluationSuite({

    tenantId: req.tenantId,

    userId: req.user._id,

    k

  });

  return res.status(200).json({

    success: true,

    message: "Evaluation completed successfully.",

    data: result

  });

};