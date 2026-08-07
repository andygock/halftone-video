export type OutputMode = "ascii" | "halftone";

interface HalftoneControlsProps {
  dotSize: number;
  frameRate: number;
  maximumDotSize: number;
  outputMode: OutputMode;
  sampleResolution: number;
  onDotSizeChange: (value: number) => void;
  onFrameRateChange: (value: number) => void;
  onOutputModeChange: (value: OutputMode) => void;
  onSampleResolutionChange: (value: number) => void;
  onVideoUpload: (file: File | null) => void;
}

export function HalftoneControls({
  dotSize,
  frameRate,
  maximumDotSize,
  outputMode,
  sampleResolution,
  onDotSizeChange,
  onFrameRateChange,
  onOutputModeChange,
  onSampleResolutionChange,
  onVideoUpload,
}: HalftoneControlsProps) {
  return (
    <section className="controls" aria-label="Preview controls">
      <label className="control-group">
        <span>Upload video</span>
        <input
          type="file"
          accept="video/*"
          onChange={(event) => onVideoUpload(event.target.files?.[0] ?? null)}
        />
      </label>

      <label className="control-group">
        <span>Output mode</span>
        <select
          value={outputMode}
          onChange={(event) =>
            onOutputModeChange(event.target.value as OutputMode)
          }
        >
          <option value="halftone">Halftone dots</option>
          <option value="ascii">ASCII art</option>
        </select>
      </label>

      {outputMode === "halftone" && (
        <label className="control-group">
          <span>Maximum dot radius: {dotSize} px</span>
          <input
            type="range"
            min="1"
            max={maximumDotSize}
            value={dotSize}
            onChange={(event) => onDotSizeChange(Number(event.target.value))}
          />
        </label>
      )}

      <label className="control-group">
        <span>Sample spacing: {sampleResolution} px</span>
        <input
          type="range"
          min="2"
          max="50"
          value={sampleResolution}
          onChange={(event) =>
            onSampleResolutionChange(Number(event.target.value))
          }
        />
      </label>

      <label className="control-group">
        <span>Preview sampling rate: {frameRate} fps</span>
        <input
          type="range"
          min="1"
          max="60"
          value={frameRate}
          onChange={(event) => onFrameRateChange(Number(event.target.value))}
        />
      </label>
    </section>
  );
}
