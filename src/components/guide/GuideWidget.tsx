import { Calendar, MessageSquare, Send, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { shouldCaptureLead } from '@/guide/classify'
import {
  GUIDE_CALENDLY_URL,
  GUIDE_LIMITS,
  GUIDE_UI_NAME,
} from '@/guide/config'
import { localGuideReply } from '@/guide/fallback'
import { buildLeadBrief, leadMailtoHref } from '@/guide/lead'
import type {
  GuideApiResponse,
  GuideChatMessage,
  GuideLocale,
  LeadBrief,
} from '@/guide/types'
import { languageFromPathname } from '@/lib/i18n/paths'
import { cn } from '@/lib/utils'
import { getFocusable, trapTab } from './focusTrap'

type UiMessage = GuideChatMessage & { id: string }

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function GuideWidget() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const locale: GuideLocale = languageFromPathname(pathname)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [leadBrief, setLeadBrief] = useState<LeadBrief | null>(null)
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    { id: 'greet', role: 'assistant', content: t('guide.greeting') },
  ])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const launcher = launcherRef.current
    const previous = document.activeElement as HTMLElement | null
    const focusables = dialog ? getFocusable(dialog) : []
    ;(focusables[0] ?? dialog)?.focus()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
      if (dialog) trapTab(event, dialog)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      ;(previous && previous !== document.body ? previous : launcher)?.focus()
    }
  }, [open])

  useEffect(() => {
    const last = listRef.current?.lastElementChild as HTMLElement | undefined
    last?.scrollIntoView({ block: 'nearest' })
  }, [messages, open, pending])

  const turnsUsed = messages.filter((m) => m.role === 'user').length
  const atCap = turnsUsed >= GUIDE_LIMITS.maxMessagesPerSession

  async function send() {
    const text = input.trim().slice(0, GUIDE_LIMITS.maxInputChars)
    if (!text || pending || atCap) return

    const userMessage: UiMessage = { id: uid(), role: 'user', content: text }
    const nextMessages = [...messages, userMessage]
    const payload: GuideChatMessage[] = nextMessages
      .filter((m) => m.id !== 'greet')
      .map(({ role, content }) => ({ role, content }))
    const conversation = payload.length > 0 ? payload : [{ role: 'user' as const, content: text }]

    setInput('')
    setMessages(nextMessages)
    setPending(true)

    let reply = localGuideReply(conversation, locale)
    let brief: LeadBrief | undefined

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: conversation,
          locale,
          page: pathname,
        }),
      })
      if (res.ok) {
        const data = (await res.json()) as GuideApiResponse
        if (data.reply) reply = data.reply
        brief = data.leadBrief
      }
    } catch {
      // Degrade locally — same SoT replies + Calendly.
    }

    if (!brief && shouldCaptureLead(conversation)) {
      brief = buildLeadBrief(conversation, pathname, locale)
    }

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'assistant', content: reply },
    ])
    if (brief) setLeadBrief(brief)
    setPending(false)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-end p-4 sm:p-6">
      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="pointer-events-auto flex w-full max-w-[400px] flex-col rounded-none border border-border bg-background shadow-[0_0_0_1px_#111] outline-none max-h-[min(40rem,calc(100dvh-5.5rem))]"
        >
          <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p
                id={titleId}
                className="font-heading text-base font-extrabold tracking-[-0.03em]"
              >
                {GUIDE_UI_NAME}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">{t('guide.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label={t('guide.close')}
            >
              <X className="size-4" />
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            aria-live="polite"
          >
            {messages.map((message) => (
              <p
                key={message.id}
                className={cn(
                  'max-w-[92%] whitespace-pre-wrap text-[14px] leading-6',
                  message.role === 'user'
                    ? 'ml-auto bg-card px-3 py-2 text-foreground'
                    : 'text-foreground/90',
                )}
              >
                {message.content}
              </p>
            ))}
            {pending ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {t('guide.thinking')}
              </p>
            ) : null}
          </div>

          <div className="border-t border-border px-4 py-3">
            <p className="mb-3 text-[11px] text-muted-foreground">{t('guide.disclaimer')}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={GUIDE_CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 bg-primary px-3 text-[11px] font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              >
                <Calendar className="size-3.5" />
                {t('guide.ctaBook')}
              </a>
              {leadBrief ? (
                <a
                  href={leadMailtoHref(leadBrief)}
                  className="inline-flex h-9 items-center border border-border px-3 text-[11px] font-bold uppercase tracking-widest text-foreground hover:bg-card"
                >
                  {t('guide.leadCta')}
                </a>
              ) : null}
            </div>

            {atCap ? (
              <p className="mt-3 text-[13px] text-muted-foreground">{t('guide.limit')}</p>
            ) : (
              <form
                className="mt-3 flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void send()
                }}
              >
                <label className="sr-only" htmlFor="guide-input">
                  {t('guide.placeholder')}
                </label>
                <textarea
                  id="guide-input"
                  rows={2}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void send()
                    }
                  }}
                  placeholder={t('guide.placeholder')}
                  maxLength={GUIDE_LIMITS.maxInputChars}
                  className="min-h-11 flex-1 resize-none border border-input bg-card px-3 py-2 text-[14px] text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="inline-flex h-11 items-center justify-center bg-primary px-3 text-primary-foreground disabled:opacity-50"
                  aria-label={t('guide.send')}
                >
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto inline-flex h-12 items-center gap-2 border border-border bg-background px-4 text-[11px] font-bold uppercase tracking-widest text-foreground hover:border-primary hover:text-primary"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          <MessageSquare className="size-4 text-primary" />
          {t('guide.launcher')}
        </button>
      )}
    </div>
  )
}
