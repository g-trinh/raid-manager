# Raid manager

## Summary

This application is a raid manager roguelike game. All specifications can be found in [docs/features](docs/features).

## Target devices

The applications runs on a web app, a mobile app and a desktop app.
The target resolutions will be : 4k, 2k, 1080p and 720p.

## Technologies

Game engine : GoDot (4.6+)
Game Logic : GDScript, GUT framework
Backend : GoLang (1.28+)

## Project files architecture

/raid-manager
  /game # GoDot project
    /script # GDScript scripts
    /scenes # GoDot scenes
  /go   # GoLang backend server

## Run the project

Godot :

```
godot --path game
```