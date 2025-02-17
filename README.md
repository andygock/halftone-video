# Halftone Video Converter

This project is a Vite + React application that converts video into a halftone effect SVG animation. The application allows users to upload a video, adjust the dot size, sample resolution, and output frame rate to create a custom halftone animation. Inspired by this [OpenAI's Super Bowl ad](https://www.youtube.com/watch?v=kIhb5pEo_j0).

[Demo](https://andygock.github.io/halftone-video/)

![Screenshot](./screenshot_horse.gif)

## Features

- Upload video files for processing.
- Adjust dot size to control the maximum radius of halftone dots.
- Adjust sample resolution to control the pixel step size.
- Adjust output frame rate to control the animation speed.
- Real-time preview of the halftone effect.

## Installation

I use `pnpm` for development, but you can use `npm` too. The instructions below use `pnpm`.

Clone the repository:

    git clone https://github.com/andygock/halftone-video
    cd halftone-video

Install dependencies:

    pnpm install

Start the development server:

    pnpm start

Open your browser and navigate to `http://localhost:5173`.

## Usage

1. Upload a video file using the "Upload Video" input.
2. Adjust the "Dot Size" slider to change the maximum radius of the halftone dots.
3. Adjust the "Sample Resolution" slider to change the pixel step size.
4. Adjust the "Output Frame Rate" slider to change the animation speed.
5. The halftone effect will be applied in real-time and displayed as an SVG animation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.

## License

This project is licensed under the MIT License.
