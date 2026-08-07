import { describe, expect, it } from "vitest";
import {
  buildAsciiArt,
  buildHalftoneData,
  calculateLuminance,
  calculatePreviewDimensions,
  calculateSamplingGrid,
} from "./processing";

function pixels(...values: number[]) {
  return new Uint8ClampedArray(values);
}

describe("calculateLuminance", () => {
  it("maps black and white to the luminance boundaries", () => {
    expect(calculateLuminance(0, 0, 0)).toBe(0);
    expect(calculateLuminance(255, 255, 255)).toBeCloseTo(255);
  });
});

describe("calculatePreviewDimensions", () => {
  it("preserves aspect ratio while limiting the longest edge", () => {
    expect(calculatePreviewDimensions(3840, 2160, 1280)).toEqual({
      width: 1280,
      height: 720,
    });
  });

  it("does not upscale small videos", () => {
    expect(calculatePreviewDimensions(640, 360, 1280)).toEqual({
      width: 640,
      height: 360,
    });
  });
});

describe("calculateSamplingGrid", () => {
  it("uses the requested spacing when it is within the point budget", () => {
    expect(calculateSamplingGrid(100, 50, 10, 1_000)).toEqual({
      columns: 10,
      rows: 5,
      effectiveStep: 10,
    });
  });

  it("increases spacing to constrain hostile workloads", () => {
    const grid = calculateSamplingGrid(3840, 2160, 2, 20_000);
    expect(grid.columns * grid.rows).toBeLessThanOrEqual(20_000);
    expect(grid.effectiveStep).toBeGreaterThan(2);
  });
});

describe("buildHalftoneData", () => {
  it("centers samples and maps darker pixels to larger dots", () => {
    const circles = buildHalftoneData(
      pixels(0, 0, 0, 255, 255, 255, 255, 255),
      2,
      1,
      20,
      10,
      5,
    );

    expect(circles[0]).toEqual({ x: 5, y: 5, radius: 5 });
    expect(circles[1]).toEqual({ x: 15, y: 5, radius: 0 });
  });
});

describe("buildAsciiArt", () => {
  it("maps black and white to opposite density characters", () => {
    expect(
      buildAsciiArt(pixels(0, 0, 0, 255, 255, 255, 255, 255), 2, 1, "@ "),
    ).toBe("@ \n");
  });
});
