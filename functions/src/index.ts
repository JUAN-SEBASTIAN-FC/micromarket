import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2024-04-10",
});

export const stripeWebhook = onRequest(
  { secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      } else {
        // Fallback for local testing without signature verification (not recommended for prod)
        event = req.body;
      }
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // We pass the Firebase uid in the client_reference_id field of the payment link
      const userId = session.client_reference_id;

      if (userId) {
        console.log(`Payment successful for user ${userId}. Upgrading to Plus.`);
        
        try {
          await admin.firestore().collection('users').doc(userId).update({
            isPlus: true,
            plusSince: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Successfully upgraded user ${userId}`);
        } catch (error) {
          console.error(`Failed to update user in Firestore:`, error);
        }
      } else {
        console.warn(`No client_reference_id found in checkout session ${session.id}`);
      }
    }

    res.json({ received: true });
  }
);
