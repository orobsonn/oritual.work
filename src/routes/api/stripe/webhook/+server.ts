import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';
import { users } from '$lib/server/db/schema';
import Stripe from 'stripe';

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const stripeSecretKey = platform?.env.STRIPE_SECRET_KEY;
	const webhookSecret = platform?.env.STRIPE_WEBHOOK_SECRET;

	if (!stripeSecretKey || !webhookSecret) {
		return new Response('Stripe not configured', { status: 500 });
	}

	const stripe = new Stripe(stripeSecretKey, {
		apiVersion: '2025-12-15.clover'
	});

	const signature = request.headers.get('stripe-signature');
	if (!signature) {
		return new Response('No signature', { status: 400 });
	}

	const body = await request.text();

	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
	} catch (err) {
		console.error('Webhook signature verification failed:', err);
		return new Response('Invalid signature', { status: 400 });
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		const userId = session.metadata?.userId;
		const customerId = session.customer as string;

		if (userId) {
			await locals.db
				.update(users)
				.set({
					isPremium: 1,
					stripeCustomerId: customerId,
					premiumPurchasedAt: new Date().toISOString()
				})
				.where(eq(users.id, userId));

			console.log(`User ${userId} upgraded to premium`);
		}
	}

	return new Response('OK', { status: 200 });
};
