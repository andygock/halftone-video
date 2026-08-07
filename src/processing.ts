import { ASCII_CHARACTERS, MAX_PREVIEW_EDGE } from "./constants";

export interface CircleData {
  x: number;
  y: number;
  radius: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface SamplingGrid {
  columns: number;
  rows: number;
  effectiveStep: number;
}

export function calculatePreviewDimensions(
  width: number,
  height: number,
  maximumEdge = MAX_PREVIEW_EDGE,
): Dimensions {
  const scale = Math.min(1, maximumEdge / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function calculateSamplingGrid(
  width: number,
  height: number,
  requestedStep: number,
  maximumPoints: number,
): SamplingGrid {
  const safeStep = Math.max(1, requestedStep);
  const safetyStep = Math.ceil(Math.sqrt((width * height) / maximumPoints));
  let effectiveStep = Math.max(safeStep, safetyStep);
  let columns = Math.max(1, Math.ceil(width / effectiveStep));
  let rows = Math.max(1, Math.ceil(height / effectiveStep));

  while (columns * rows > maximumPoints) {
    effectiveStep += 1;
    columns = Math.max(1, Math.ceil(width / effectiveStep));
    rows = Math.max(1, Math.ceil(height / effectiveStep));
  }

  return {
    columns,
    rows,
    effectiveStep,
  };
}

export function calculateLuminance(red: number, green: number, blue: number) {
  return 0.299 * red + 0.587 * green + 0.114 * blue;
}

export function buildHalftoneData(
  pixels: Uint8ClampedArray,
  columns: number,
  rows: number,
  outputWidth: number,
  outputHeight: number,
  maximumRadius: number,
): CircleData[] {
  const circles: CircleData[] = [];
  const cellWidth = outputWidth / columns;
  const cellHeight = outputHeight / rows;
  const safeMaximumRadius = Math.min(
    maximumRadius,
    cellWidth / 2,
    cellHeight / 2,
  );

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const pixelIndex = (row * columns + column) * 4;
      const luminance = calculateLuminance(
        pixels[pixelIndex],
        pixels[pixelIndex + 1],
        pixels[pixelIndex + 2],
      );

      circles.push({
        x: (column + 0.5) * cellWidth,
        y: (row + 0.5) * cellHeight,
        radius: (1 - luminance / 255) * safeMaximumRadius,
      });
    }
  }

  return circles;
}

export function buildAsciiArt(
  pixels: Uint8ClampedArray,
  columns: number,
  rows: number,
  characters = ASCII_CHARACTERS,
): string {
  const lines: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let column = 0; column < columns; column += 1) {
      const pixelIndex = (row * columns + column) * 4;
      const luminance = calculateLuminance(
        pixels[pixelIndex],
        pixels[pixelIndex + 1],
        pixels[pixelIndex + 2],
      );
      const characterIndex = Math.min(
        characters.length - 1,
        Math.floor((luminance / 255) * (characters.length - 1)),
      );
      line += characters[characterIndex];
    }
    lines.push(line);
  }

  return `${lines.join("\n")}\n`;
}

export function drawHalftone(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  circles: CircleData[],
  width: number,
  height: number,
) {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#111111";
  context.beginPath();

  for (const circle of circles) {
    if (circle.radius <= 0) continue;
    context.moveTo(circle.x + circle.radius, circle.y);
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  }

  context.fill();
}
