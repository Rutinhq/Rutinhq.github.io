/** Capo HQ mark geometry in a 64×64 space. */

export const CAPO_GREEN = '#2ECC8F'
export const CAPO_BG = '#0A0A0A'
export const HQ_MARK_SIZE = 64

const UX = Math.SQRT1_2
const UY = Math.SQRT1_2

const Q_CX = 43
const Q_CY = 32
const INNER_DIST = 4
const OUTER_DIST = 16.8
const HEAD_LEN = 4.4
const HEAD_HALF = 3.2

const IX = Q_CX - INNER_DIST * UX
const IY = Q_CY - INNER_DIST * UY
const OX = Q_CX + OUTER_DIST * UX
const OY = Q_CY + OUTER_DIST * UY

function headPoints(
  tipX: number,
  tipY: number,
  dirX: number,
  dirY: number,
): string {
  const bx = tipX - dirX * HEAD_LEN
  const by = tipY - dirY * HEAD_LEN
  const px = -dirY
  const py = dirX
  return [
    `${tipX.toFixed(2)},${tipY.toFixed(2)}`,
    `${(bx + px * HEAD_HALF).toFixed(2)},${(by + py * HEAD_HALF).toFixed(2)}`,
    `${(bx - px * HEAD_HALF).toFixed(2)},${(by - py * HEAD_HALF).toFixed(2)}`,
  ].join(' ')
}

const INNER_HEAD = headPoints(IX, IY, -UX, -UY)
const OUTER_HEAD = headPoints(OX, OY, UX, UY)
const SHAFT_X1 = IX + UX * HEAD_LEN
const SHAFT_Y1 = IY + UY * HEAD_LEN
const SHAFT_X2 = OX - UX * HEAD_LEN
const SHAFT_Y2 = OY - UY * HEAD_LEN

type HqMarkProps = {
  letterColor?: string
  frameColor?: string
  maskId?: string
}

/** Squircle + HQ. Q tail is a NW↔SE dual-headed arrow with a ring gap. */
export function HqMark({
  letterColor = CAPO_GREEN,
  frameColor = CAPO_GREEN,
  maskId = 'rutin-hq-q-gap',
}: HqMarkProps) {
  return (
    <g>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={HQ_MARK_SIZE}
          height={HQ_MARK_SIZE}
        >
          <rect width={HQ_MARK_SIZE} height={HQ_MARK_SIZE} fill="#fff" />
          <line
            x1={IX}
            y1={IY}
            x2={OX}
            y2={OY}
            stroke="#000"
            strokeWidth={7.2}
            strokeLinecap="butt"
          />
        </mask>
      </defs>
      <rect
        x={5}
        y={5}
        width={54}
        height={54}
        rx={15.5}
        ry={15.5}
        fill="none"
        stroke={frameColor}
        strokeWidth={5.2}
      />
      <line
        x1={15.2}
        y1={20.8}
        x2={15.2}
        y2={43.2}
        stroke={letterColor}
        strokeWidth={4.8}
        strokeLinecap="square"
      />
      <line
        x1={26.2}
        y1={20.8}
        x2={26.2}
        y2={43.2}
        stroke={letterColor}
        strokeWidth={4.8}
        strokeLinecap="square"
      />
      <line
        x1={15.2}
        y1={32}
        x2={26.2}
        y2={32}
        stroke={letterColor}
        strokeWidth={4.8}
        strokeLinecap="square"
      />
      <circle
        cx={Q_CX}
        cy={Q_CY}
        r={10.4}
        fill="none"
        stroke={letterColor}
        strokeWidth={4.8}
        mask={`url(#${maskId})`}
      />
      <line
        x1={SHAFT_X1}
        y1={SHAFT_Y1}
        x2={SHAFT_X2}
        y2={SHAFT_Y2}
        stroke={letterColor}
        strokeWidth={4}
        strokeLinecap="butt"
      />
      <polygon points={INNER_HEAD} fill={letterColor} />
      <polygon points={OUTER_HEAD} fill={letterColor} />
    </g>
  )
}
