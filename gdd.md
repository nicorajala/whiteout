Project Name: WHITEOUT
1. High Concept

WHITEOUT is a fast-paced 3D downhill snowboarding game built with Three.js that emphasizes speed, flow, jumps, and aerial tricks across a large mountain environment. The core experience focuses on mastering terrain, chaining tricks, and maintaining momentum while descending steep snow-covered slopes.

2. Target Platform & Tech Stack
Platform

Web (Chrome / Firefox)

Keyboard + Mouse

Optional Gamepad (Web Gamepad API)

Technology

Rendering: Three.js

Language: JavaScript (ES6+)

Physics: Custom physics (Raycasting + Vector math)

Build Tool: Vite / Webpack

Audio: Web Audio API

Input: Keyboard + Gamepad API

3. Core Gameplay Pillars

Flow Over Realism – Movement feels smooth and responsive

Momentum-Based Riding – Speed depends on slope angle and carving

Skill Expression – Tricks reward timing and control

Readable Terrain – Clear visual language for ramps, cliffs, powder

4. Player Mechanics
4.1 Movement System
Player State

Grounded

Airborne

Landing

Crashed

Movement Variables
speed
maxSpeed
acceleration
gravity
friction
slopeAngle
airControl

Ground Movement Logic

Speed increases automatically when riding downhill

Slope angle is calculated using raycast normal

Carving increases speed slightly

Braking applies heavy friction

Formula Example:

speed += slopeAngle * acceleration
speed -= friction

Carving

Left/right lean changes direction

Deep carving increases turn radius

Hard turns reduce speed slightly

4.2 Jump System
Jump Types

Natural terrain jumps

Player-initiated jump (charge based)

Jump Input

Hold Jump → charge power

Release → vertical impulse

Airborne Physics

Reduced gravity

Horizontal momentum preserved

Limited air rotation control

Landing

Successful landing if board aligns with slope normal

Bad angle → speed loss or crash

5. Trick System
Trick Categories
Spins

180°

360°

540°

720°

Grabs

Nose Grab

Tail Grab

Indy

Melon

Trick Detection

Rotation tracked via Y-axis angular velocity

Trick confirmed on landing

Combo System

Multiple tricks per jump

Combo ends on landing or crash

5.1 Trick Scoring
Base Points
Trick	Points
180	100
360	300
720	800
Grab	+150
Multipliers

Airtime bonus

Clean landing ×1.5

Combo multiplier stacking

6. Snow Physics
Snow Types
Type	Effect
Packed Snow	Normal speed
Powder	Slower, higher friction
Ice	Faster, harder turning
Implementation

Terrain tagged by material

Friction coefficient applied per surface

Particle effects for powder spray

7. Camera System
Camera Type

Third-person follow camera

Behavior

Smooth lerp following player

Dynamic FOV based on speed

Camera tilt during carving and spins

Zoom out slightly during airtime

8. Terrain Design
Mountain Layout

Single large downhill map

Multiple paths and lines

Natural ramps, cliffs, bowls

Boundaries

Invisible walls

Fall reset system

9. Controls
Keyboard
Action	Key
Accelerate	W
Brake	S
Carve Left	A
Carve Right	D
Jump	Space
Spin	Q / E
Grab	Mouse Button
Gamepad

Left Stick: Movement

A: Jump

X/Y: Grabs

Triggers: Spin

10. UI / HUD
On-Screen Elements

Speed meter

Combo score popup

Trick name display

Airtime indicator

Menus

Main Menu

Controls

Restart Run

11. Audio Design
Sounds

Snow carving loop

Wind speed ramp

Jump takeoff

Landing impact

Trick confirmation

12. Visual Style
Art Direction

Clean, minimalistic snow environment

Soft lighting, volumetric fog

Snow particles on turns and landings

13. File & Code Structure
/src
 ├─ core/
 │   ├─ Game.js
 │   ├─ Input.js
 │   ├─ Physics.js
 ├─ player/
 │   ├─ PlayerController.js
 │   ├─ TrickSystem.js
 │   ├─ JumpSystem.js
 ├─ camera/
 │   ├─ CameraController.js
 ├─ world/
 │   ├─ Terrain.js
 │   ├─ SnowMaterial.js
 ├─ ui/
 │   ├─ HUD.js

14. Performance Considerations

Use LOD meshes

Frustum culling

Merge static terrain meshes

Limit particle count

15. Future Expansion

Time trials

Replay system

Online leaderboards

Procedural mountains

Character customization

16. MVP Scope

Must-Have:

Ride downhill

Jump off terrain

Perform spins + grabs

Score system

One mountain

Nice-to-Have:

Weather

Ragdoll crashes

Replay camera

If you want next, I can:

Write a Three.js starter template

Design player physics equations

Create a trick detection algorithm

Convert this into a developer task breakdown

Just tell me 🚀