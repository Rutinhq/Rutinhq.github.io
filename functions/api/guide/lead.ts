/**
 * Cloudflare Pages Function — POST /api/guide/lead
 * Accepts { leadBrief } and POSTs to GUIDE_LEAD_WEBHOOK_URL when set.
 * Always 200 { ok: true, delivered: boolean } so the widget can fall back
 * to clipboard + short mailto if the webhook is unset or fails.
 */

import { handleGuideLeadRequest } from '../../../src/guide/api'

type Env = {
  GUIDE_LEAD_WEBHOOK_URL?: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  return handleGuideLeadRequest(context.request, context.env)
}
