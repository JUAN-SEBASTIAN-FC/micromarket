import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { checkRateLimit, getClientIP, getRateLimitHeaders } from "./rateLimiter";

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2024-04-10",
});

export const stripeWebhook = onRequest(
  { secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  async (req, res) => {
    // ✅ Rate limiting: prevenir DoS
    const rateLimitCheck = await checkRateLimit(req, 'stripe');
    if (!rateLimitCheck.allowed) {
      const headers = getRateLimitHeaders('stripe', getClientIP(req));
      res.status(429).set(headers).send('Too many requests. Try again later.');
      return;
    }

    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // ✅ VALIDACIÓN OBLIGATORIA
    if (!endpointSecret) {
      console.error("STRIPE_WEBHOOK_SECRET no configurado");
      res.status(500).send("Webhook secret not configured");
      return;
    }

    if (!sig) {
      console.error("Stripe signature missing");
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    let event;

    try {
      // ✅ SIEMPRE verificar la firma
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.client_reference_id;

      if (!userId) {
        console.warn(`No client_reference_id in session ${session.id}`);
        res.json({ received: true });
        return;
      }

      try {
        await admin.firestore().collection('users').doc(userId).update({
          isPlus: true,
          plusSince: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`User ${userId} upgraded to Plus`);
      } catch (error) {
        console.error(`Failed to update user ${userId}:`, error);
        res.status(500).send("Failed to process payment");
        return;
      }
    }

    res.json({ received: true });
  }
);
