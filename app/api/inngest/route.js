import { serve } from "inngest/next";
import { inngest } from "@/app/api/inngest/client";

// Import your functions
import {
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
} from "@/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
  ],
});






































































































































