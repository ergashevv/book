import { botWebhookHandler } from '@/lib/bot';

export async function POST(req) {
  // Pass the request to grammy's webhook handler
  return await botWebhookHandler(req);
}
