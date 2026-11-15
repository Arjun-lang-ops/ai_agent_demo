import { z } from "zod";

import {
  streamRagAnswer
} from "../services/ragService.js";


const streamSchema = z.object({

  query: z.string().trim().min(2).max(2000),

  limit: z.coerce.number().int().min(1).max(10).default(5),

  documentId: z.string().optional()

});


const streamRagController = async (req, res) => {

  // STEP 1: Validate request
  const validation = streamSchema.safeParse(req.body);


  if (!validation.success) {

    return res.status(400).json({

      success: false,

      message: "Invalid request",

      errors: validation.error.flatten()

    });

  }


  const {
    query,
    limit,
    documentId
  } = validation.data;


  // STEP 2: Set SSE headers
  res.status(200);

  res.set({

    "Content-Type": "text/event-stream",

    "Cache-Control": "no-cache, no-transform",

    "Connection": "keep-alive",

    "X-Accel-Buffering": "no"

  });


  res.flushHeaders();


  // STEP 3: Helper to send SSE events
  const sendEvent = (event, data) => {

    if (res.destroyed || res.writableEnded) {
      return;
    }

    res.write(`event: ${event}\n`);

    res.write(`data: ${JSON.stringify(data)}\n\n`);

  };


  // STEP 4: Detect client disconnection
  let clientDisconnected = false;

  res.on("close", () => {

    if (!res.writableEnded) {
      clientDisconnected = true;
    }

  });


  try {

    sendEvent("status", {
      message: "Searching relevant documents..."
    });


    // STEP 5: Call streaming RAG service
    const result = await streamRagAnswer({

      query,

      tenantId: req.tenantId,

      limit,

      documentId,


      // Send generated text
      onToken: async (text) => {

        if (clientDisconnected) {
          return;
        }

        sendEvent("token", {
          text
        });

      },


      // Send document sources
      onSources: async (sources) => {

        if (clientDisconnected) {
          return;
        }

        sendEvent("sources", {
          sources
        });

      }

    });


    // STEP 6: Send completion event
    if (!clientDisconnected) {

      sendEvent("done", {

        message: "Generation completed",

        retrievedChunks: result.retrievedChunks

      });

    }


  } catch (error) {

    console.error("Streaming RAG error:", error);

    if (!clientDisconnected) {

      sendEvent("error", {

        message: "Unable to generate the answer."

      });

    }

  } finally {

    if (!res.writableEnded && !res.destroyed) {
      res.end();
    }

  }

};


export {
  streamRagController
};