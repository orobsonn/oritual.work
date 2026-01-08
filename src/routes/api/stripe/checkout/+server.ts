import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import Stripe from 'stripe';

export const POST: RequestHandler = async ({ request, platform, locals, url }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const stripeSecretKey = platform?.env.STRIPE_SECRET_KEY;
	const priceId = platform?.env.STRIPE_PRICE_ID;

	if (!stripeSecretKey || !priceId) {
		return new Response('Stripe not configured', { status: 500 });
	}

	const stripe = new Stripe(stripeSecretKey, {
		apiVersion: '2025-05-28.basil'
	});

	// Check if request wants onboarding price
	const formData = await request.formData();
	const isOnboarding = formData.get('onboarding') === 'true';
	const onboardingPriceId = platform?.env.STRIPE_ONBOARDING_PRICE_ID;

	const selectedPriceId = isOnboarding && onboardingPriceId ? onboardingPriceId : priceId;

	const baseUrl = url.origin;

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		payment_method_types: ['card'],
		line_items: [
			{
				price: selectedPriceId,
				quantity: 1
			}
		],
		metadata: {
			userId: locals.user.id
		},
		success_url: `${baseUrl}/app/upgrade/success`,
		cancel_url: `${baseUrl}/app/upgrade?cancelled=true`
	});

	if (session.url) {
		throw redirect(303, session.url);
	}

	return new Response('Failed to create checkout session', { status: 500 });
};
