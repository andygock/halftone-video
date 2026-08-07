import type { RefObject } from "react";
import type { OutputMode } from "./HalftoneControls";
import type { Dimensions } from "./processing";

interface HalftonePreviewProps {
  asciiArt: string;
  dimensions: Dimensions;
  outputCanvasRef: RefObject<HTMLCanvasElement | null>;
  outputMode: OutputMode;
}

export function HalftonePreview({
  asciiArt,
  dimensions,
  outputCanvasRef,
  outputMode,
}: HalftonePreviewProps) {
  return (
    <section className="preview" aria-label="Processed video preview">
      <canvas
        ref={outputCanvasRef}
        className={outputMode === "halftone" ? "halftone-canvas" : "hidden"}
        width={dimensions.width}
        height={dimensions.height}
      />
      {outputMode === "ascii" && (
        <div className="ascii-container">
          <pre className="ascii-art">{asciiArt}</pre>
        </div>
      )}
    </section>
  );
}
