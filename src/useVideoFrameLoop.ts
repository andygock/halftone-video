import { useEffect, type RefObject } from "react";

interface VideoFrameLoopOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  framesPerSecond: number;
  onFrame: () => void;
}

export function useVideoFrameLoop({
  videoRef,
  active,
  framesPerSecond,
  onFrame,
}: VideoFrameLoopOptions) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;

    const minimumDelay = 1000 / framesPerSecond;
    let lastProcessedAt = -minimumDelay;
    let animationFrameId: number | null = null;
    let videoFrameId: number | null = null;

    const processIfDue = (now: number) => {
      if (now - lastProcessedAt >= minimumDelay) {
        onFrame();
        lastProcessedAt = now;
      }
    };

    if (typeof video.requestVideoFrameCallback === "function") {
      const handleVideoFrame: VideoFrameRequestCallback = (now) => {
        processIfDue(now);
        videoFrameId = video.requestVideoFrameCallback(handleVideoFrame);
      };

      videoFrameId = video.requestVideoFrameCallback(handleVideoFrame);
    } else {
      const handleAnimationFrame = (now: number) => {
        if (!video.paused && !video.ended) processIfDue(now);
        animationFrameId = requestAnimationFrame(handleAnimationFrame);
      };

      animationFrameId = requestAnimationFrame(handleAnimationFrame);
    }

    return () => {
      if (videoFrameId !== null) {
        video.cancelVideoFrameCallback(videoFrameId);
      }
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, [active, framesPerSecond, onFrame, videoRef]);
}
