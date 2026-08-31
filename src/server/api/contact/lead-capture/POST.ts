export type LeadPayload = {
  conversation?: {
    messages_attributes?: { body: string }[]
    data?: Record<string, string>
  }
  user?: { email?: string; name?: string }
}

export type LeadResponse = {
  status: (code: number) => LeadCaptureResponse
  json: (payload: unknown) => void
}

type LeadCaptureResponse = LeadResponse

export async function handleLeadCapture(
  req: { body: LeadPayload },
  res: LeadResponse,
) {
  const email = req.body?.user?.email?.trim()
  const name = req.body?.user?.name?.trim()

  if (!email || !name) {
    res.status(400).json({ error: 'Missing name or email' })
    return
  }

  const inboxUrl = process.env.GODADDY_INBOX_WEBHOOK_URL
  const inboxKey = process.env.GODADDY_INBOX_API_KEY

  if (inboxUrl) {
    const response = await fetch(inboxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(inboxKey ? { Authorization: `Bearer ${inboxKey}` } : {}),
      },
      body: JSON.stringify(req.body),
    })
    if (!response.ok) {
      res.status(502).json({ error: 'Inbox delivery failed' })
      return
    }
  } else {
    console.info('[lead-capture] local fallback', JSON.stringify(req.body))
  }

  res.status(200).json({ ok: true })
}
