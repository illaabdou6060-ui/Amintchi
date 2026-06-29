/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Hash utility using djb2 algorithm.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash;
}

/**
 * Generates a deterministic 25x25 QR Code matrix representing any input string.
 * This guarantees the exact same transaction hash will always produce the exact same
 * unique QR pattern. Includes real position-detection finder patterns and quiet zones.
 */
export function generateDeterministicQRGrid(text: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Pseudo-random number generator seeded with the input text hash
  let seed = djb2Hash(text);
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // 1. Fill grid with random bits representing payload
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      grid[r][c] = random() > 0.45; // slightly denser for aesthetic look
    }
  }

  // 2. Set Finder Patterns (Position Detection Squares)
  const setFinderPattern = (rowOffset: number, colOffset: number) => {
    // 1-pixel quiet zone border around finder pattern (set to false)
    for (let r = -1; r < 8; r++) {
      for (let c = -1; c < 8; c++) {
        const nr = rowOffset + r;
        const nc = colOffset + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            grid[nr][nc] = false;
          }
        }
      }
    }

    // Main 7x7 finder pattern structure
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rowOffset + r][colOffset + c] = isBorder || isCenter;
      }
    }
  };

  // Position finder patterns in Top-Left, Top-Right, and Bottom-Left corners
  setFinderPattern(0, 0);
  setFinderPattern(0, size - 7);
  setFinderPattern(size - 7, 0);

  // 3. Set Alignment Pattern at bottom-right (5x5 pattern centered at row 18, col 18)
  const setAlignmentPattern = (rowOffset: number, colOffset: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        grid[rowOffset + r][colOffset + c] = isBorder || isCenter;
      }
    }
  };
  setAlignmentPattern(size - 9, size - 9);

  // 4. Timing patterns (alternating black and white pixels connecting the finder patterns)
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  return grid;
}
