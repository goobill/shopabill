import { Router } from 'itty-router'
import Stripe from 'stripe'

const stripe_secret_key = env.STRIPE_SECRET_KEY
const domain = env.DOMAIN

// Environment variables (injected via wrangler.toml or dashboard)
const stripe = new Stripe(stripe_secret_key, {
  apiVersion: '2024-04-10',
})

const router = Router()

// Utility: Read request JSON body safely
async function readJson(request) {
  const contentType = request.headers.get('Content-Type') || ''
  if (contentType.includes('application/json')) {
    return await request.json()
  }
  return {}
}

// POST /create-checkout-session
router.post('/create-checkout-session', async (request) => {
  try {
    const body = await readJson(request)

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: '{{PRICE_ID}}', // Replace with real Stripe price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${domain}/return.html?session_id={CHECKOUT_SESSION_ID}`,
    })

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// GET /session-status?session_id=abc123
router.get('/session-status', async ({ query }) => {
  const sessionId = query.session_id

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return new Response(JSON.stringify({
      status: session.status,
      customer_email: session.customer_details?.email || null,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// 404 fallback
router.all('*', () => new Response('404, not found!', { status: 404 }))

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request))
})
