import { getStore } from '@netlify/blobs'; // Keep storage credentials inside Netlify's function runtime.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // Accept opaque submission IDs for safe retry handling.
const reply = (status, data) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); // Return fresh JSON without exposing internal errors.
const orderKey = review => `${review.createdAt}|${review.id}`; // Give pagination a stable order when new reviews arrive.
export function createReviewsHandler(openStore = () => getStore({ name: 'butttercloud-customer-reviews', consistency: 'strong' })) { // Allow isolated storage tests while using shared production storage by default.
  return async request => { // Handle only public review reads and validated submissions.
    if (!['GET', 'POST'].includes(request.method)) return reply(405, { error: 'This action is not available.' }); // Exclude editing and deletion from the public endpoint.
    try { // Keep storage outages recoverable for visitors.
      if (request.method === 'GET') { // Load saved reviews for any visitor.
        const after = new URL(request.url).searchParams.get('after') || ''; // Read the optional pagination cursor.
        if (after.length > 100) return reply(400, { error: 'Invalid page.' }); // Bound untrusted cursor input.
        const store = openStore(); // Open the shared site-wide store only when needed.
        const { blobs } = await store.list({ prefix: 'review/' }); // Automatically include all storage listing pages.
        const reviews = []; // Collect the small bakery's stored reviews before ordering them.
        for (let index = 0; index < blobs.length; index += 20) { // Limit simultaneous storage reads.
          const batch = await Promise.all(blobs.slice(index, index + 20).map(blob => store.get(blob.key, { type: 'json' }))); // Read independent records without a shared overwrite-prone array.
          reviews.push(...batch.filter(review => review && UUID.test(review.id) && typeof review.createdAt === 'string')); // Ignore a record removed while the page was loading.
        } // Finish the bounded storage reads.
        reviews.sort((a, b) => orderKey(b).localeCompare(orderKey(a))); // Show the newest reviews first.
        const remaining = after ? reviews.filter(review => orderKey(review) < after) : reviews; // Keep pagination stable across new submissions.
        const page = remaining.slice(0, 30); // Send a manageable number of cards at once.
        return reply(200, { reviews: page, next: remaining.length > 30 ? orderKey(page[page.length - 1]) : null }); // Allow older reviews to remain reachable.
      } // End public review loading.
      const origin = request.headers.get('origin'); // Check browser submissions against this deployed site.
      if (origin && origin !== new URL(request.url).origin) return reply(403, { error: 'Please submit your review from this website.' }); // Reject another site's browser form submission.
      if (!request.headers.get('content-type')?.includes('application/json')) return reply(415, { error: 'Please use the review form.' }); // Accept only the documented request format.
      const raw = await request.text(); // Read the bounded function request body.
      if (new TextEncoder().encode(raw).length > 12000) return reply(413, { error: 'Your review is too long.' }); // Reject oversized input before parsing it.
      let input; // Keep invalid JSON out of the storage layer.
      try { input = JSON.parse(raw); } catch { return reply(400, { error: 'Please check your review and try again.' }); } // Report malformed submissions clearly.
      if (!input || typeof input !== 'object' || Array.isArray(input) || input.website) return reply(400, { error: 'Please use the review form.' }); // Reject malformed records and the bot-trap field.
      const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : ''; // Normalize the public name without interpreting it as markup.
      const item = typeof input.item === 'string' ? input.item.trim().replace(/\s+/g, ' ') : ''; // Normalize the item label shown on the card.
      const message = typeof input.message === 'string' ? input.message.trim() : ''; // Preserve the customer's words and intentional line breaks.
      if (!UUID.test(input.id || '') || name.length < 1 || name.length > 60 || item.length < 2 || item.length > 80 || message.length < 10 || message.length > 1000 || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) return reply(400, { error: 'Add your name, order, a 1–5 star rating, and a review of 10–1,000 characters.' }); // Repeat validation on the server, where it cannot be bypassed.
      const review = { id: input.id.toLowerCase(), name, item, message, rating: input.rating, createdAt: new Date().toISOString() }; // Save only the public review fields and a server-generated time.
      const store = openStore(); // Use the same durable store read by other visitors.
      const key = `review/${review.id}`; // Give every submission its own record to avoid lost concurrent reviews.
      const { modified } = await store.setJSON(key, review, { onlyIfNew: true }); // Make retries safe without allowing an existing review to be overwritten.
      if (!modified) { // Recover a submission whose successful response was lost in transit.
        const existing = await store.get(key, { type: 'json' }); // Read the already-saved record with strong consistency.
        if (!existing || ['name', 'item', 'message', 'rating'].some(field => existing[field] !== review[field])) return reply(409, { error: 'Please edit your review and submit it again.' }); // Prevent one submission ID from changing a saved review.
        return reply(200, { review: existing }); // Confirm the original save without duplicating its card.
      } // End retry recovery.
      return reply(201, { review }); // Display the review only after its persistent write has succeeded.
    } catch { return reply(503, { error: 'Reviews are temporarily unavailable. Please try again shortly.' }); } // Keep form contents intact during a storage outage.
  }; // Return the request handler.
} // End the review API factory.
export default createReviewsHandler(); // Use the modern Request/Response Netlify Functions API.
export const config = { path: '/api/reviews', rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 30 } }; // Limit repeated automated requests without collecting visitors' IP addresses in reviews.
