import Stripe from 'stripe';
import Workspace from '../models/Workspace.js';
import { getPlanLimits } from '../utils/planLimits.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  pro:      process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

export const getBillingStatus = async (req, res) => {
  const workspace = req.workspace;
  res.json({
    plan: workspace.plan,
    stripeCurrentPeriodEnd: workspace.stripeCurrentPeriodEnd,
    stripeSubscriptionId: workspace.stripeSubscriptionId,
    limits: getPlanLimits(workspace.plan),
  });
};

export const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;
  const workspace = req.workspace;

  const priceId = PRICES[plan];
  if (!priceId) return res.status(400).json({ message: 'Invalid plan' });

  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      metadata: { workspaceId: workspace._id.toString() },
    });
    customerId = customer.id;
    workspace.stripeCustomerId = customerId;
    await workspace.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/billing?success=true`,
    cancel_url:  `${process.env.CLIENT_URL}/billing`,
    metadata: { workspaceId: workspace._id.toString(), plan },
    subscription_data: {
      metadata: { workspaceId: workspace._id.toString(), plan },
    },
  });

  res.json({ url: session.url });
};

export const createPortalSession = async (req, res) => {
  const workspace = req.workspace;
  if (!workspace.stripeCustomerId)
    return res.status(400).json({ message: 'No billing account found' });

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/billing`,
  });

  res.json({ url: session.url });
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  const obj = event.data.object;

  switch (event.type) {

    case 'checkout.session.completed': {
      // obj.subscription may be null — retrieve the full session with subscription expanded
      const fullSession = await stripe.checkout.sessions.retrieve(obj.id, {
        expand: ['subscription'],
      });

      const sub = fullSession.subscription;
      if (!sub) break; // safety — shouldn't happen for subscription mode

      const workspaceId = fullSession.metadata?.workspaceId;
      const plan        = fullSession.metadata?.plan;
      if (!workspaceId || !plan) break;

      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      await Workspace.findByIdAndUpdate(workspaceId, {
        plan,
        stripeSubscriptionId:   sub.id,
        stripePriceId:          sub.items.data[0]?.price?.id ?? null,
        stripeCurrentPeriodEnd: periodEnd,
      });
      break;
    }

    case 'invoice.paid': {
      const subscriptionId = obj.subscription;
      if (!subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      await Workspace.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { stripeCurrentPeriodEnd: periodEnd }
      );
      break;
    }

    case 'customer.subscription.deleted': {
      await Workspace.findOneAndUpdate(
        { stripeSubscriptionId: obj.id },
        { plan: 'free', stripeSubscriptionId: null, stripePriceId: null, stripeCurrentPeriodEnd: null }
      );
      break;
    }
  }

  res.json({ received: true });
};