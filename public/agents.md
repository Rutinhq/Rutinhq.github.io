# Agent catalog — RutinHQ

Canonical host: https://www.rutinhq.com/

Thin index of public endpoints and discovery files. No secrets.
Commercial pages stay one SKU at a time.

Human catalog (HTML): https://www.rutinhq.com/agents
This file is the machine-readable twin.

## Public resources

- Systems catalog (curriculum): https://docs.rutinhq.com/catalog/
- Contact: strategy@rutinhq.com
- 30-min fit call: https://calendly.com/rutinhq/30min
- llms.txt: https://www.rutinhq.com/llms.txt
- llms-full.txt: https://www.rutinhq.com/llms-full.txt
- Sitemap: https://www.rutinhq.com/sitemap.xml
- RFC 9727 api-catalog: https://www.rutinhq.com/.well-known/api-catalog
- auth.md: https://www.rutinhq.com/auth.md
- Agent catalog (HTML): https://www.rutinhq.com/agents
- Agent catalog (markdown): https://www.rutinhq.com/agents.md

## Auth

www and the public catalog need no credentials.

`docs.rutinhq.com` home and other Access-gated operator docs sit behind
Cloudflare Access for humans. The only docs surface agents should read is
the public catalog: https://docs.rutinhq.com/catalog/

Do not probe Access login, cookies, service tokens, or bypass paths.

This site does not publish prices.

If a task needs a human: email strategy@rutinhq.com or book 30 min.
