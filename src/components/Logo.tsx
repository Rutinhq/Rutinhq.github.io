import { cn } from '@/lib/utils'
import { CAPO_GREEN, HqMark } from '@/components/HqMark'

/** Capo lockup: Inter "Rutin" wordmark + HQ squircle. Wordmark uses currentColor. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 125 36"
      width={125}
      height={36}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('block h-7 w-auto shrink-0 overflow-visible md:h-8', className)}
    >
      <g transform="translate(-2.9 31)" fill="currentColor">
        <path d="M2.90 0L6.91 0L6.91-9.90L12.25-9.90C12.32-9.90 12.41-9.90 12.48-9.90L17.79 0L22.34 0L16.58-10.58C19.76-11.78 21.36-14.45 21.36-17.96C21.36-22.80 18.35-26.19 12.29-26.19L2.90-26.19M6.91-13.32L6.91-22.76L11.83-22.76C15.70-22.76 17.30-20.92 17.30-17.96C17.30-15.03 15.70-13.32 11.87-13.32M32.63 0.25C35.33 0.25 37.44-0.97 38.67-3.81L38.69 0L42.40 0L42.40-19.65L38.51-19.65L38.51-8.02C38.51-4.90 36.56-3.13 33.94-3.13C31.38-3.13 29.79-4.82 29.79-7.65L29.79-19.65L25.93-19.65L25.93-7.17C25.93-2.32 28.62 0.25 32.63 0.25M55.99-19.65L52.07-19.65L52.07-24.33L48.20-24.33L48.20-19.65L45.33-19.65L45.33-16.51L48.20-16.51L48.20-4.99C48.20-1.65 50.26 0.26 53.82 0.26C54.72 0.26 55.71 0.14 56.53-0.14L55.85-3.23C55.37-3.13 54.62-3.02 54.21-3.02C52.68-3.02 52.07-3.73 52.07-5.31L52.07-16.51L55.99-16.51M59.84 0L63.70 0L63.70-19.65L59.84-19.65M72.77-11.64C72.77-14.75 74.71-16.52 77.34-16.52C79.91-16.52 81.49-14.84 81.49-12.01L81.49 0L85.36 0L85.36-12.48C85.36-17.33 82.69-19.90 78.68-19.90C75.90-19.90 73.85-18.65 72.62-15.87L72.60-19.65L68.91-19.65L68.91 0L72.77 0" />
        <rect x="60.48" y="-26.25" width="2.62" height="2.62" />
      </g>
      <svg x={93} y={2} width={32} height={32} viewBox="0 0 64 64">
        <HqMark letterColor="currentColor" frameColor={CAPO_GREEN} />
      </svg>
    </svg>
  )
}
