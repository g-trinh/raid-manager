# Raid manager

## Summary

This application is a raid manager roguelike game. All specifications can be found in [docs/features](docs/features).

## Target devices

The applications runs on a web app, a mobile app and a desktop app.
The target resolutions will be : 4k, 2k, 1080p and 720p.

## Technologies

Game engine : Electron + React + Three.js (TypeScript)
Game Logic : TypeScript, zustand stores
Backend : GoLang (1.28+)

## Project files architecture

/raid-manager
  /app  # Electron + React + Three.js app
    /src/main      # Electron main process
    /src/preload   # Electron preload scripts
    /src/renderer  # React renderer (UI, game logic, screens)
  /go   # GoLang backend server

## Run the project

App :

```
cd app
npm install
npm run dev
```