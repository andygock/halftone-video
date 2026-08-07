# Halftone Video Converter

A Vite and React application that turns a local video into a real-time
halftone-dot or ASCII-art preview. Processing happens entirely in the browser;
the selected video is not uploaded.

Inspired by [OpenAI's Super Bowl ad](https://www.youtube.com/watch?v=kIhb5pEo_j0).

[Open the live demo](https://andygock.github.io/halftone-video/)

![Animated halftone preview](./screenshot_horse.gif)

## Features

- Preview local video files as halftone dots or ASCII art.
- Adjust the maximum halftone-dot radius.
- Adjust pixel-sample spacing.
- Control how frequently decoded video frames are sampled.
- Bound preview resolution and sample count to keep large videos responsive.
- Process videos locally without uploading them.

The frame-rate control affects preview sampling frequency. It does not change
the video's playback speed or create an exported animation.

## Requirements

- Node.js 20.19 or later, or Node.js 22.12 or later
- pnpm 11.1.1, as declared in `package.json`
- A modern browser with Canvas and HTML video support

The `requestVideoFrameCallback` browser API is used when available. Browsers
without it use a `requestAnimationFrame` fallback.

## Installation

```bash
git clone https://github.com/andygock/halftone-video
cd halftone-video
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Then open <http://localhost:5173>.

## Usage

1. Select a video with the **Upload video** input.
2. Choose **Halftone dots** or **ASCII art**.
3. Adjust sample spacing and the preview sampling rate.
4. In halftone mode, adjust the maximum dot radius.
5. If browser autoplay is blocked, use the displayed **Play video** button.

Videos larger than 1 GB or with decoded dimensions above 3840×2160 are
rejected to prevent excessive browser resource use. The rendered preview's
longest edge is limited to 1280 pixels, and each frame uses at most 20,000
samples.

## Project commands

```bash
pnpm dev           # Start the development server
pnpm lint          # Run ESLint
pnpm test          # Run unit tests once
pnpm format        # Format supported files
pnpm format:check  # Check formatting without changing files
pnpm build         # Type-check and create a production build in docs/
pnpm preview       # Preview the production build locally
pnpm audit         # Check dependencies for known vulnerabilities
```

## Deployment

Vite writes the production build to `docs/` with relative asset URLs. The
directory is intentionally ignored on the source branch because the published
site is maintained on the repository's `pages` branch. After validating a
build, publish the contents of `docs/` through that branch or configure GitHub
Actions to deploy the same directory.

The relative Vite base allows the build to work under the
`/halftone-video/` GitHub Pages path.

## Architecture

- `src/App.tsx` owns the selected video and coordinates processing.
- `src/useVideoFrameLoop.ts` synchronizes processing with decoded frames.
- `src/processing.ts` contains pure sampling and conversion functions.
- `src/HalftoneControls.tsx` and `src/HalftonePreview.tsx` contain presentation
  components.

The live halftone output uses Canvas rather than thousands of SVG DOM elements.
The application currently provides a preview only; it does not export Canvas,
SVG, ASCII, or video files.

## Contributing

Contributions are welcome. Before opening a pull request, run:

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm build
```

## License

Licensed under the [MIT License](./LICENSE).
