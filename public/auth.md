# Authentication surfaces — RutinHQ

Canonical host: https://www.rutinhq.com/

This file tells agents which surfaces are public and which are authenticated.
It does not publish credentials, tokens, keys, or registration endpoints.

Human page: https://www.rutinhq.com/agents/auth
API catalog (RFC 9727): https://www.rutinhq.com/.well-known/api-catalog

## Public — no credentials

These surfaces are intentionally open. Do not send Authorization headers.

- Marketing site: https://www.rutinhq.com/ (hub, GTM OS, STORE OS, NEXUS OS, blog)
- Public curriculum catalog: https://docs.rutinhq.com/catalog/
- Agent catalog (HTML): https://www.rutinhq.com/agents
- Agent catalog (markdown): https://www.rutinhq.com/agents.md
- RFC 9727 api-catalog: https://www.rutinhq.com/.well-known/api-catalog
- llms.txt: https://www.rutinhq.com/llms.txt
- llms-full.txt: https://www.rutinhq.com/llms-full.txt
- Sitemap: https://www.rutinhq.com/sitemap.xml
- robots.txt: https://www.rutinhq.com/robots.txt
- RutinHQ Guide concierge: `POST https://www.rutinhq.com/api/guide` — catalog-grounded answers, no secrets, no prices

Contact: strategy@rutinhq.com
30-min fit call: https://calendly.com/rutinhq/30min

## Authenticated — not for agents

- `docs.rutinhq.com` home and other Access-gated operator docs sit behind Cloudflare Access for humans.
- The only docs surface agents should read is the public catalog: https://docs.rutinhq.com/catalog/
- Do not probe Access login, cookies, service tokens, or bypass paths.

## What this host does not offer

- No agent OAuth / OpenID registration flow on www
- No pay-per-crawl, x402, or machine-payable pages on marketing
- No API keys, tokens, or secrets in this file or in the public catalog

If a task needs a human: email strategy@rutinhq.com or book 30 min.
