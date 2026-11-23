/** Calendar date of this build in America/Los_Angeles (Capo / merge day). */
export const CONTENT_STAMP = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())
