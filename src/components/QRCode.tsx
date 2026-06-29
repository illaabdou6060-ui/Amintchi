/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { generateDeterministicQRGrid } from '../utils/qr';

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  logoColor?: string;
  className?: string;
}

export default function QRCode({
  value,
  size = 200,
  fgColor = '#050508',
  bgColor = '#FFFFFF',
  logoColor = '#E05206', // Niger orange sun brand color
  className = ''
}: QRCodeProps) {
  const grid = useMemo(() => generateDeterministicQRGrid(value), [value]);
  const gridSize = grid.length;

  // Render SVG paths representing the grid
  const paths = useMemo(() => {
    const dots: string[] = [];
    const centerStart = Math.floor(gridSize / 2) - 2;
    const centerEnd = Math.floor(gridSize / 2) + 2;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c]) {
          // Clear a circular center region for the Amintchi Sun Logo
          if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
            continue;
          }
          // Append rect path
          dots.push(`M ${c} ${r} h 1 v 1 h -1 z`);
        }
      }
    }
    return dots.join(' ');
  }, [grid, gridSize]);

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="w-full h-full"
        style={{ backgroundColor: bgColor }}
        shapeRendering="crispEdges"
        id={`qr-${value.substring(0, 8)}`}
      >
        {/* Background layer */}
        <rect width={gridSize} height={gridSize} fill={bgColor} />

        {/* Foreground QR modules */}
        <path d={paths} fill={fgColor} />

        {/* Center brand logo overlay with a clean white backing circle */}
        <g transform={`translate(${gridSize / 2}, ${gridSize / 2})`}>
          {/* Backing circle to clear the zone */}
          <circle r="2.8" fill={bgColor} />
          
          {/* Outer orange ring representing the Niger Sun symbol */}
          <circle r="1.8" fill="none" stroke={logoColor} strokeWidth="0.5" />
          
          {/* Central sun core */}
          <circle r="0.9" fill={logoColor} />
          
          {/* Stylized 'A' letter for Amintchi inside the sun */}
          <text
            x="0"
            y="0.35"
            textAnchor="middle"
            fontSize="1.1"
            fontWeight="black"
            fill="#FFFFFF"
            fontFamily="sans-serif"
          >
            A
          </text>
        </g>
      </svg>
    </div>
  );
}
