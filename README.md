# Pixel Perfect

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pixel-perfect-canvas-3848.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b9361c40-4e17-4f4c-ad03-9db8fbd173f1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```


## Features & Architecture

### 🐉 3D Dragon Flight Experience
- **Interactive Three.js Canvas**: Smooth camera spline interpolation following dragon flight paths across procedural mountain terrain.
- **Dynamic Overlays**: Flight HUD, scroll-driven timeline scrubber, and speed controls.
- **Optimized GLTF Assets**: High-fidelity 3D dragon mesh with custom wing flapping and flight animations.

### 🏰 Wizard Chamber & Quest Adventure
- **Interactive Chamber Navigation**: Multi-room exploration (Observatory, Corridor, Dragon Nest, Grand Chamber).
- **Procedural Audio Synthesis**: Ambient castle atmosphere and spell sound effects generated via Web Audio API.
- **Rich UI System**: Built on Radix UI primitives and Tailwind CSS.
