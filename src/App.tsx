import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { HalftoneControls, type OutputMode } from "./HalftoneControls";
import { HalftonePreview } from "./HalftonePreview";
import {
  MAX_DECODED_PIXELS,
  MAX_FILE_SIZE_BYTES,
  MAX_SAMPLE_POINTS,
} from "./constants";
import {
  buildAsciiArt,
  buildHalftoneData,
  calculatePreviewDimensions,
  calculateSamplingGrid,
  drawHalftone,
} from "./processing";
import { useVideoFrameLoop } from "./useVideoFrameLoop";

const App = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dotSize, setDotSize] = useState(4);
  const [sampleResolution, setSampleResolution] = useState(10);
  const [frameRate, setFrameRate] = useState(8);
  const [asciiArt, setAsciiArt] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("halftone");
  const [videoReady, setVideoReady] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState({
    width: 640,
    height: 360,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const samplingCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const maximumDotSize = Math.max(1, Math.floor(sampleResolution / 2));

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleVideoUpload = useCallback((file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a supported video file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("The selected video is larger than the 1 GB safety limit.");
      return;
    }

    setError(null);
    setPlaybackBlocked(false);
    setVideoReady(false);
    setAsciiArt("");
    setVideoUrl(URL.createObjectURL(file));
  }, []);

  const startPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setPlaybackBlocked(false);
    } catch {
      setPlaybackBlocked(true);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const decodedPixels = video.videoWidth * video.videoHeight;
    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0 ||
      decodedPixels > MAX_DECODED_PIXELS
    ) {
      video.pause();
      setVideoReady(false);
      setError(
        "This video's decoded resolution is too large to process safely.",
      );
      return;
    }

    setPreviewDimensions(
      calculatePreviewDimensions(video.videoWidth, video.videoHeight),
    );
    setVideoReady(true);
    setError(null);
    void startPlayback();
  }, [startPlayback]);

  const handleSampleResolutionChange = useCallback((value: number) => {
    setSampleResolution(value);
    setDotSize((current) =>
      Math.min(current, Math.max(1, Math.floor(value / 2))),
    );
  }, []);

  const processCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    const samplingCanvas = samplingCanvasRef.current;
    if (!video || !samplingCanvas || !videoReady) return;

    const samplingContext = samplingCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!samplingContext) return;

    const grid = calculateSamplingGrid(
      previewDimensions.width,
      previewDimensions.height,
      sampleResolution,
      MAX_SAMPLE_POINTS,
    );

    if (
      samplingCanvas.width !== grid.columns ||
      samplingCanvas.height !== grid.rows
    ) {
      samplingCanvas.width = grid.columns;
      samplingCanvas.height = grid.rows;
    }

    samplingContext.drawImage(video, 0, 0, grid.columns, grid.rows);
    const pixels = samplingContext.getImageData(
      0,
      0,
      grid.columns,
      grid.rows,
    ).data;

    if (outputMode === "ascii") {
      setAsciiArt(buildAsciiArt(pixels, grid.columns, grid.rows));
      return;
    }

    const outputCanvas = outputCanvasRef.current;
    const outputContext = outputCanvas?.getContext("2d");
    if (!outputCanvas || !outputContext) return;

    const circles = buildHalftoneData(
      pixels,
      grid.columns,
      grid.rows,
      previewDimensions.width,
      previewDimensions.height,
      dotSize,
    );
    drawHalftone(
      outputCanvas,
      outputContext,
      circles,
      previewDimensions.width,
      previewDimensions.height,
    );
  }, [
    dotSize,
    outputMode,
    previewDimensions.height,
    previewDimensions.width,
    sampleResolution,
    videoReady,
  ]);

  useVideoFrameLoop({
    videoRef,
    active: videoReady,
    framesPerSecond: frameRate,
    onFrame: processCurrentFrame,
  });

  return (
    <main className="app-container">
      <h1>Halftone Video Converter</h1>
      <p className="intro">
        Process a local video into a real-time halftone or ASCII preview. The
        video stays in your browser and is not uploaded.
      </p>

      <HalftoneControls
        dotSize={dotSize}
        frameRate={frameRate}
        maximumDotSize={maximumDotSize}
        outputMode={outputMode}
        sampleResolution={sampleResolution}
        onDotSizeChange={setDotSize}
        onFrameRateChange={setFrameRate}
        onOutputModeChange={setOutputMode}
        onSampleResolutionChange={handleSampleResolutionChange}
        onVideoUpload={handleVideoUpload}
      />

      {error && (
        <p className="message error-message" role="alert">
          {error}
        </p>
      )}

      {playbackBlocked && !error && (
        <div className="message" role="status">
          <span>Playback was blocked by your browser.</span>
          <button type="button" onClick={() => void startPlayback()}>
            Play video
          </button>
        </div>
      )}

      {videoUrl && (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="processing-video"
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => {
              setVideoReady(false);
              setError("The browser could not decode this video.");
            }}
          />
          <canvas ref={samplingCanvasRef} className="hidden" />

          {videoReady && (
            <HalftonePreview
              asciiArt={asciiArt}
              dimensions={previewDimensions}
              outputCanvasRef={outputCanvasRef}
              outputMode={outputMode}
            />
          )}
        </>
      )}
    </main>
  );
};

export default App;
