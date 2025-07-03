import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const db = admin.firestore();

// Récupération de la clé API Stripe depuis les variables d'environnement
// Pour le déploiement, définir STRIPE_SECRET_KEY dans les variables d'environnement Firebase Functions
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15",
});

// Fonction pour mettre à jour le statut premium d'un utilisateur
async function updateUserPremiumStatus(
  userId: string, 
  isPremium: boolean,
  stripeData?: {
    customerId?: string;
    subscriptionId?: string;
    planId?: string;
  }
): Promise<void> {
  const userRef = db.collection("users").doc(userId);
  
  // Mettre à jour le statut de l'utilisateur
  await userRef.update({
    userType: isPremium ? "premium" : "free",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (isPremium && stripeData) {
    // Créer un nouvel enregistrement d'abonnement
    await db.collection("subscriptions").add({
      userId,
      status: "active",
      planId: stripeData.planId || "premium-monthly",
      planName: "Premium Mensuel",
      amount: 9.90,
      currency: "EUR",
      stripeCustomerId: stripeData.customerId,
      stripeSubscriptionId: stripeData.subscriptionId,
      startDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else if (!isPremium) {
    // Mettre à jour tous les abonnements actifs en annulés
    const subscriptionsRef = db.collection("subscriptions");
    const activeSubscriptions = await subscriptionsRef
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();
    
    const batch = db.batch();
    activeSubscriptions.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        endDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    
    await batch.commit();
  }
}

// Webhook pour traiter les événements Stripe
export const stripeWebhook = functions.https.onRequest(async (request, response) => {
  const sig = request.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ""; // Définir dans les variables d'environnement

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    );
  } catch (err) {
    functions.logger.error(`Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`);
    response.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`);
    return;
  }

  // Gérer les événements de paiement
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Récupérer l'ID utilisateur depuis les métadonnées ou le client Stripe
      const userId = session.client_reference_id;
      
      if (userId) {
        await updateUserPremiumStatus(userId, true, {
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
        });
        
        functions.logger.info(`Premium activated for user: ${userId}`);
      } else {
        functions.logger.error("No user ID found in session metadata");
      }
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Récupérer l'utilisateur par l'ID client Stripe
      const customerId = subscription.customer as string;
      const usersSnapshot = await db.collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();
      
      if (!usersSnapshot.empty) {
        const userId = usersSnapshot.docs[0].id;
        const status = subscription.status;
        
        // Mettre à jour le statut premium en fonction de l'état de l'abonnement
        if (status === "active" || status === "trialing") {
          await updateUserPremiumStatus(userId, true, {
            customerId,
            subscriptionId: subscription.id,
            planId: subscription.items.data[0]?.price.id,
          });
          functions.logger.info(`Subscription updated to active for user: ${userId}`);
        } else if (status === "canceled" || status === "unpaid") {
          await updateUserPremiumStatus(userId, false);
          functions.logger.info(`Subscription canceled for user: ${userId}`);
        }
      }
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Récupérer l'utilisateur par l'ID client Stripe
      const customerId = subscription.customer as string;
      const usersSnapshot = await db.collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();
      
      if (!usersSnapshot.empty) {
        const userId = usersSnapshot.docs[0].id;
        await updateUserPremiumStatus(userId, false);
        functions.logger.info(`Subscription deleted for user: ${userId}`);
      }
      break;
    }
    
    default:
      functions.logger.info(`Unhandled event type: ${event.type}`);
  }

  response.json({ received: true });
});

// Fonction pour connecter l'utilisateur à son abonnement Stripe existant
export const linkUserToStripe = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "L'utilisateur doit être connecté pour effectuer cette action."
    );
  }

  const { stripeCustomerId } = data;
  const userId = context.auth.uid;

  if (!stripeCustomerId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "L'identifiant client Stripe est requis."
    );
  }

  try {
    // Récupérer les informations de l'abonnement depuis Stripe
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (customer.deleted) {
      throw new functions.https.HttpsError(
        "not-found",
        "Le client Stripe n'existe pas ou a été supprimé."
      );
    }

    // Mettre à jour l'utilisateur avec l'ID client Stripe
    await db.collection("users").doc(userId).update({
      stripeCustomerId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Récupérer les abonnements actifs de ce client
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      
      // Mettre à jour le statut premium
      await updateUserPremiumStatus(userId, true, {
        customerId: stripeCustomerId,
        subscriptionId: subscription.id,
        planId: subscription.items.data[0]?.price.id,
      });

      return { success: true, premium: true };
    }

    return { success: true, premium: false };
  } catch (error) {
    functions.logger.error("Error linking user to Stripe:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Une erreur est survenue lors de la liaison avec Stripe."
    );
  }
});
