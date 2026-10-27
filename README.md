# Crashflock

A complete static HTML5 slingshot-destruction game built for GitHub Pages.

## Content
- Bird Side: 10 stories x 20 levels = 200 campaign levels.
- Pig Side: 10 stories x 20 levels = 200 campaign levels.
- Boss encounters on levels 5 and 15 of every story, major bosses on 10, final bosses on 20.
- 21 playable characters per side (42 total), with a new character discovery every 10 campaign levels after the starter.
- Finite character copies plus expensive permanent Infinite unlocks bought with earned coins.
- Endless Run, Boss Rush, Daily Challenge, Capsule Lab, and campaign level certification.
- Local save data, touch input, mouse input, keyboard ability activation (Space), app icons, offline cache support.

## Run
Open `index.html` directly, or serve the folder with any static web server. GitHub Pages works without a build step.

## Level QA
Open Level Certification from the main menu. The validator checks all 400 handcrafted/deterministic campaign level definitions with the same launch origin, gravity, wind, and fixed-step trajectory math used by gameplay. It verifies every required core/weak point can be reached with a bounded launch speed and that the level provides enough shots.

## Asset background policy
World backgrounds and material tiles are opaque because backgrounds are part of those images. Character sprite sheets use transparency because the characters must be composited over six different world backgrounds. No blanket background-removal pass is used.


## Variety rebuild

The campaign uses 20 generated-art block systems: wood, thick wood, glass, reinforced glass, stone, metal, riveted metal, ice, snow, sandstone, crystal, bone, rope, chain, honey, explosive, spring, fan, magnet, and teleporter. The certification pass also checks that all 400 campaign structure fingerprints are unique.
