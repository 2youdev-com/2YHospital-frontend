import { SVGProps } from 'react';

/**
 * 2YHospital Logo — SVG icon component.
 *
 * Precisely traced from the official logo:
 *   - Rounded medical cross (two-tone teal)
 *   - White person with arms raised (cutout)
 *   - Large organic leaf sweeping to the left
 *   - Smaller leaf extending downward
 */
export default function LogoIcon(props: SVGProps<SVGSVGElement>) {
  const dark = '#167a7a';
  const light = '#2bbcb3';

  return (
    <svg
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* ── Cross shape (dark teal base) ── */}
      <path
        d={`
          M 48 4 L 64 4 Q 70 4, 70 10 L 70 30
          L 88 30 Q 94 30, 94 36 L 94 52 Q 94 58, 88 58
          L 70 58 L 70 72 Q 70 78, 64 78 L 48 78 Q 42 78, 42 72
          L 42 58 L 24 58 Q 18 58, 18 52 L 18 36 Q 18 30, 24 30
          L 42 30 L 42 10 Q 42 4, 48 4 Z
        `}
        fill={dark}
      />

      {/* ── Lighter teal on top-right quadrant ── */}
      <path
        d={`
          M 56 4 L 64 4 Q 70 4, 70 10 L 70 30
          L 88 30 Q 94 30, 94 36 L 94 44 L 56 44 Z
        `}
        fill={light}
      />

      {/* ── Large left leaf ── */}
      <path
        d={`
          M 38 40
          C 28 28, 8 28, 4 50
          C 0 72, 14 92, 28 98
          C 12 84, 10 58, 38 40 Z
        `}
        fill={dark}
      />

      {/* ── Bottom leaf ── */}
      <path
        d={`
          M 52 78
          C 46 86, 40 100, 46 108
          C 52 112, 58 100, 58 78
          Z
        `}
        fill={dark}
      />

      {/* ── Person: head (white circle) ── */}
      <circle cx="56" cy="28" r="5.5" fill="white" />

      {/* ── Person: arms raised + body (white cutout) ── */}
      <path
        d={`
          M 56 40
          C 50 40, 42 32, 34 24
          C 31 21, 27 21, 26 24
          C 25 27, 27 29, 30 32
          C 36 38, 42 46, 46 56
          L 46 72
          L 66 72
          L 66 56
          C 70 46, 76 38, 82 32
          C 85 29, 87 27, 86 24
          C 85 21, 81 21, 78 24
          C 70 32, 62 40, 56 40
          Z
        `}
        fill="white"
      />
    </svg>
  );
}
