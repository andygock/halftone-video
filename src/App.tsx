import React, { useState, useRef, useEffect } from "react";
import "./App.css";

interface CircleData {
  x: number;
  y: number;
  r: number;
}

const App: React.FC = () => {
  // State variables for the video and control settings.
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [dotSize, setDotSize] = useState<number>(4); // Maximum dot radius (in pixels)
  const [sampleResolution, setSampleResolution] = useState<number>(10); // Pixel step size
  const [frameRate, setFrameRate] = useState<number>(8); // Output frame rate (fps)
  const [halftoneData, setHalftoneData] = useState<CircleData[]>([]);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 640,
    height: 360,
  });

  // Refs for the hidden video and canvas elements.
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle video file upload.
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  // This function grabs the current video frame, samples pixels and computes circles.
  const updateHalftoneData = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure the canvas matches the video dimensions.
    canvas.width = videoDimensions.width;
    canvas.height = videoDimensions.height;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Retrieve the image data.
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const circles: CircleData[] = [];

    // Loop over the pixels using the sample resolution.
    for (let y = 0; y < canvas.height; y += sampleResolution) {
      for (let x = 0; x < canvas.width; x += sampleResolution) {
        const index = (y * canvas.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        // Calculate luminance using the standard formula.
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        // For a halftone effect, darker areas yield larger circles.
        const radius = (1 - luminance / 255) * dotSize;
        circles.push({ x, y, r: radius });
      }
    }
    setHalftoneData(circles);
  };

  // When the video metadata is loaded, update dimensions and start looping playback.
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });
        video.loop = true;
        video.play();
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [videoUrl]);

  // Set up an interval to update the halftone effect at the desired frame rate.
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        videoRef.current &&
        !videoRef.current.paused &&
        !videoRef.current.ended
      ) {
        updateHalftoneData();
      }
    }, 1000 / frameRate);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameRate, dotSize, sampleResolution, videoDimensions, videoUrl]);

  return (
    <div className="app-container">
      <h1>Halftone Video Converter</h1>
      <div className="control-group">
        <label>
          Upload Video:&nbsp;
          <input type="file" accept="video/*" onChange={handleVideoUpload} />
        </label>
      </div>
      <div className="control-group">
        <label>
          Dot Size: {dotSize} px&nbsp;
          <input
            type="range"
            min="1"
            max="50"
            value={dotSize}
            onChange={(e) => setDotSize(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="control-group">
        <label>
          Sample Resolution: {sampleResolution} px&nbsp;
          <input
            type="range"
            min="2"
            max="50"
            value={sampleResolution}
            onChange={(e) => setSampleResolution(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="control-group">
        <label>
          Output Frame Rate (fps): {frameRate}&nbsp;
          <input
            type="range"
            min="1"
            max="60"
            value={frameRate}
            onChange={(e) => setFrameRate(Number(e.target.value))}
          />
        </label>
      </div>

      {videoUrl && (
        <div className="video-container">
          {/* Hidden video and canvas for frame processing */}
          <video ref={videoRef} src={videoUrl} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
          {/* Render the animated halftone SVG */}
          <svg
            width={videoDimensions.width}
            height={videoDimensions.height}
            className="halftone-svg"
            viewBox={`0 0 ${videoDimensions.width} ${videoDimensions.height}`}
          >
            {halftoneData.map((circle, idx) => (
              <circle
                key={idx}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                fill="black"
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};

export default App;
