import { useMemo } from 'react'
import type { ElevatorSpec } from '@/lib/api/types'
import { toFa } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════
   نقشه برش چاه آسانسور

   امضای بصری این سایت. مشخصاتی که کاربر وارد می‌کند بلافاصله
   روی یک نمای برش زنده می‌نشیند: تعداد توقف، موتورخانه یا MRL،
   کابین و وزنه تعادل، ریل، بافر و چاهک. شماره‌های روی نقشه با
   شماره ردیف‌های لیست قطعات یکی است، پس خریدار می‌بیند هر قطعه
   کجای چاه می‌نشیند.

   همه چیز با SVG رسم می‌شود — بدون تصویر و بدون کتابخانه.
   ══════════════════════════════════════════════════════════════ */

const C = {
  line: '#9aabbb',
  faint: '#c6d0da',
  ink: '#1e2a38',
  signal: '#f5a800',
  paper: '#ffffff',
}

export function ShaftDiagram({
  spec,
  activeMarker,
}: {
  spec: ElevatorSpec
  activeMarker?: number
}) {
  const geom = useMemo(() => {
    const W = 300
    const H = 440
    const padX = 46
    // فضای بالای چاه: در حالت موتورخانه‌دار باید اتاق موتور هم جا شود
    const topPad = spec.type === 'traction' ? 52 : 26
    const headroom = topPad + (spec.type === 'mrl' ? 30 : 34)
    const pitDepth = 26
    const shaftTop = headroom + 14
    const shaftBottom = H - pitDepth - 18
    const usable = shaftBottom - shaftTop
    const floorH = usable / spec.stops
    // کابین را روی طبقه دوم از پایین می‌نشانیم تا نمای زنده‌تری بدهد
    const restIndex = Math.min(spec.stops - 1, 1)
    const cabinBottom = shaftBottom - floorH * restIndex
    const cabinH = Math.min(floorH * 0.78, 62)
    return { W, H, padX, headroom, pitDepth, shaftTop, shaftBottom, floorH, cabinBottom, cabinH }
  }, [spec])

  const { W, H, padX, headroom, shaftTop, shaftBottom, floorH, cabinBottom, cabinH } = geom
  const shaftW = W - padX * 2
  const cabinW = shaftW * (spec.type === 'hydraulic' ? 0.66 : 0.54)
  const cabinX = padX + 10
  const cwtX = padX + shaftW - 30

  const hot = (n: number) => (activeMarker === n ? C.signal : C.ink)
  const hotW = (n: number) => (activeMarker === n ? 2.4 : 1.4)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label="نمای برش چاه آسانسور">
      <defs>
        <pattern id="hatch45" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke={C.faint} strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* دیواره‌های بتنی چاه */}
      <rect x={padX - 12} y={headroom} width="12" height={H - headroom - 6} fill="url(#hatch45)" stroke={C.line} strokeWidth="1" />
      <rect x={padX + shaftW} y={headroom} width="12" height={H - headroom - 6} fill="url(#hatch45)" stroke={C.line} strokeWidth="1" />
      <rect x={padX - 12} y={H - 18} width={shaftW + 24} height="12" fill="url(#hatch45)" stroke={C.line} strokeWidth="1" />

      {/* موتورخانه یا MRL */}
      {spec.type === 'mrl' ? (
        <g>
          <rect x={padX + shaftW - 46} y={shaftTop - 24} width="40" height="18" rx="2"
            fill={C.paper} stroke={hot(1)} strokeWidth={hotW(1)} />
          <circle cx={padX + shaftW - 26} cy={shaftTop - 15} r="5" fill="none" stroke={hot(1)} strokeWidth={hotW(1)} />
          <text x={padX + shaftW - 50} y={shaftTop - 10} fontSize="7.5" fill={C.line} textAnchor="end">
            موتور داخل چاه
          </text>
        </g>
      ) : spec.type === 'traction' ? (
        <g>
          <rect x={padX - 12} y={headroom - 44} width={shaftW + 24} height="44" fill={C.paper} stroke={C.line} strokeWidth="1" />
          <text x={W / 2} y={headroom - 33} fontSize="7.5" fill={C.line} textAnchor="middle">موتورخانه</text>
          <rect x={W / 2 - 22} y={headroom - 26} width="44" height="18" rx="2"
            fill={C.paper} stroke={hot(1)} strokeWidth={hotW(1)} />
          <circle cx={W / 2 + 12} cy={headroom - 17} r="6" fill="none" stroke={hot(1)} strokeWidth={hotW(1)} />
          {/* تابلو فرمان */}
          <rect x={padX - 4} y={headroom - 32} width="14" height="26" rx="1.5"
            fill={C.paper} stroke={hot(2)} strokeWidth={hotW(2)} />
        </g>
      ) : (
        <g>
          <rect x={padX - 12} y={headroom - 30} width={shaftW + 24} height="30" fill={C.paper} stroke={C.line} strokeWidth="1" />
          <rect x={padX - 4} y={headroom - 24} width="22" height="18" rx="2"
            fill={C.paper} stroke={hot(1)} strokeWidth={hotW(1)} />
          <text x={W / 2 + 20} y={headroom - 12} fontSize="7.5" fill={C.line} textAnchor="middle">پاور یونیت</text>
        </g>
      )}

      {/* خط طبقات */}
      {Array.from({ length: spec.stops + 1 }).map((_, i) => {
        const y = shaftBottom - floorH * i
        const isFloor = i < spec.stops
        return (
          <g key={i}>
            <line x1={padX - 12} y1={y} x2={padX + shaftW + 12} y2={y} stroke={C.faint} strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3 3'} />
            {isFloor && (
              <>
                {/* درب طبقه */}
                <rect
                  x={padX} y={y - Math.min(floorH * 0.62, 40)}
                  width="7" height={Math.min(floorH * 0.62, 40)}
                  fill={C.paper} stroke={hot(7)} strokeWidth={hotW(7)}
                />
                <text x={padX - 20} y={y - 3} fontSize="8" fill={C.line} textAnchor="middle" className="num">
                  {toFa(i + 1)}
                </text>
              </>
            )}
          </g>
        )
      })}

      {/* ریل کابین و وزنه */}
      <line x1={cabinX - 6} y1={shaftTop} x2={cabinX - 6} y2={shaftBottom} stroke={hot(3)} strokeWidth={hotW(3) + 0.6} />
      <line x1={cabinX + cabinW + 6} y1={shaftTop} x2={cabinX + cabinW + 6} y2={shaftBottom} stroke={hot(3)} strokeWidth={hotW(3) + 0.6} />
      {spec.type !== 'hydraulic' && (
        <>
          <line x1={cwtX - 5} y1={shaftTop} x2={cwtX - 5} y2={shaftBottom} stroke={hot(4)} strokeWidth={hotW(4)} />
          <line x1={cwtX + 17} y1={shaftTop} x2={cwtX + 17} y2={shaftBottom} stroke={hot(4)} strokeWidth={hotW(4)} />
        </>
      )}

      {/* سیم‌بکسل */}
      {spec.type !== 'hydraulic' && (
        <g stroke={hot(5)} strokeWidth={hotW(5) * 0.7} fill="none">
          <path d={`M${cabinX + cabinW / 2} ${cabinBottom - cabinH} V ${shaftTop - 4}`} />
          <path d={`M${cwtX + 6} ${cabinBottom - cabinH - 30} V ${shaftTop - 4}`} />
          <path d={`M${cabinX + cabinW / 2} ${shaftTop - 4} H ${cwtX + 6}`} />
        </g>
      )}

      {/* وزنه تعادل */}
      {spec.type !== 'hydraulic' && (
        <rect
          x={cwtX} y={shaftBottom - floorH * (spec.stops - 1) - 20}
          width="12" height="54" rx="1.5"
          fill={C.ink} opacity="0.85"
        />
      )}

      {/* سیلندر هیدرولیک */}
      {spec.type === 'hydraulic' && (
        <rect x={cabinX + cabinW / 2 - 5} y={cabinBottom} width="10" height={shaftBottom - cabinBottom + 12}
          fill={C.paper} stroke={hot(1)} strokeWidth={hotW(1)} />
      )}

      {/* کابین */}
      <g>
        <rect
          x={cabinX} y={cabinBottom - cabinH} width={cabinW} height={cabinH} rx="2"
          fill={C.paper} stroke={hot(6)} strokeWidth={hotW(6) + 0.4}
        />
        <rect
          x={cabinX + 4} y={cabinBottom - cabinH + 4} width={cabinW - 8} height={cabinH - 8}
          fill="none" stroke={C.faint} strokeWidth="1"
        />
        <line x1={cabinX + cabinW / 2} y1={cabinBottom - cabinH + 4} x2={cabinX + cabinW / 2} y2={cabinBottom - 4}
          stroke={C.faint} strokeWidth="1" />
        {/* پاراشوت زیر کابین */}
        <rect x={cabinX - 4} y={cabinBottom - 4} width="9" height="9" rx="1"
          fill={C.paper} stroke={hot(8)} strokeWidth={hotW(8)} />
        <rect x={cabinX + cabinW - 5} y={cabinBottom - 4} width="9" height="9" rx="1"
          fill={C.paper} stroke={hot(8)} strokeWidth={hotW(8)} />
      </g>

      {/* گاورنر */}
      <g>
        <circle cx={padX + shaftW - 8} cy={shaftTop + 16} r="7" fill={C.paper} stroke={hot(9)} strokeWidth={hotW(9)} />
        <circle cx={padX + shaftW - 8} cy={shaftTop + 16} r="2" fill={hot(9)} />
      </g>

      {/* بافر چاهک */}
      <g>
        <rect x={cabinX + cabinW / 2 - 16} y={shaftBottom + 6} width="10" height="14" rx="1.5"
          fill={C.paper} stroke={hot(10)} strokeWidth={hotW(10)} />
        <rect x={cabinX + cabinW / 2 + 6} y={shaftBottom + 6} width="10" height="14" rx="1.5"
          fill={C.paper} stroke={hot(10)} strokeWidth={hotW(10)} />
        <text x={padX + shaftW + 16} y={shaftBottom + 18} fontSize="7.5" fill={C.line}>چاهک</text>
      </g>

      {/* خط اندازه ارتفاع سفر */}
      <g stroke={C.line} strokeWidth="0.9" fill="none">
        <line x1={W - 18} y1={shaftTop} x2={W - 18} y2={shaftBottom} />
        <line x1={W - 22} y1={shaftTop} x2={W - 14} y2={shaftTop} />
        <line x1={W - 22} y1={shaftBottom} x2={W - 14} y2={shaftBottom} />
      </g>
      <text
        x={W - 24} y={(shaftTop + shaftBottom) / 2}
        fontSize="8.5" fill={C.ink} textAnchor="middle"
        transform={`rotate(-90 ${W - 24} ${(shaftTop + shaftBottom) / 2})`}
        className="num"
      >
        ارتفاع سفر {toFa(spec.travelHeight || spec.stops * 3)} متر
      </text>

      {/* شماره‌های راهنما */}
      {[
        { n: 1, x: spec.type === 'traction' ? W / 2 + 30 : padX + shaftW - 52, y: headroom - 17 },
        { n: 6, x: cabinX + cabinW + 14, y: cabinBottom - cabinH / 2 },
        { n: 10, x: cabinX + cabinW / 2 + 24, y: shaftBottom + 16 },
      ].map((m) => (
        <g key={m.n}>
          <circle cx={m.x} cy={m.y} r="7.5" fill={activeMarker === m.n ? C.signal : C.ink} />
          <text x={m.x} y={m.y + 3} fontSize="8.5" fill={activeMarker === m.n ? C.ink : C.paper} textAnchor="middle" fontWeight="700" className="num">
            {toFa(m.n)}
          </text>
        </g>
      ))}
    </svg>
  )
}
