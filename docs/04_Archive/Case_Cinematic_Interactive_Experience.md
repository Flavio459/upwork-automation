# Reference Case: Cinematic Interactive Experience

> [!IMPORTANT]
> Este arquivo é um caso de referencia historica. Nao representa um projeto ativo deste vault.
> Use-o como benchmark de arquitetura, narrativa comercial e capacidade tecnica.

## Source Brief

This reference case is based on a real Upwork brief for a React / Next.js interactive art-book style experience with cinematic visuals, embedded video, interactive hotspots, layered audio, and lip-synced character narration.

## Status

- Type: portfolio reference case
- Delivery status: architecture study / reusable sales case
- Use case: support proposals for interactive web experiences, multimedia-heavy builds, and AI-assisted character narration
- If you did not personally ship the full product, present this as a reference architecture or concept study, not as a delivered client result.

## Client Goal

Build a high-quality interactive HTML5 application that feels more like a cinematic book or world explorer than a static website.

## Core Experience

- full-screen cinematic scenes
- embedded 16:9 video playback with custom controls
- interactive hotspots triggered by click
- layered audio for voice, background, and scene events
- character narrator with lip-sync animation
- smooth transitions between scenes and pages
- static deployment on AWS S3 + CloudFront

## Technical Constraints

- React or Next.js required
- strong UI interactivity, not static page design
- video and audio integration required
- animation experience preferred
- portfolio proof required
- optional AI tools: ElevenLabs, D-ID, HeyGen

## Recommended Architecture

### Frontend Structure

- Next.js App Router or React SPA depending on static export needs
- scene-driven page structure
- shared manifest describing worlds, assets, audio cues, hotspots, and transitions
- client-side media controller for play/pause, preload, and scene sync

### Interaction Layer

- hotspot overlay system
- event-driven state for scene progression
- transitions handled independently from content rendering
- keyboard and accessibility support where possible

### Audio and Narration

- dedicated audio manager for voice, music, and scene cues
- narration timeline linked to scene state
- optional avatar/lip-sync integration for narrated segments

### Deployment

- static build output
- upload to S3
- CloudFront for CDN, caching, and asset delivery

## Why This Case Matters

- it demonstrates how to orchestrate complex browser-native experiences
- it shows comfort with multimedia state, not just layout work
- it is relevant for clients who want immersive, cinematic, or game-like web interactions
- it can be reused as reference architecture for projects involving AI narration, avatar tools, and rich media flows

## Sales Angle

This case should be presented as a reference architecture for interactive media orchestration:

- scene-based React/Next.js architecture
- video, audio, and animation coordination
- interactive hotspots and transitions
- AI-assisted narration or avatar integration when needed

## Proposal Answer Seed

If asked how I would structure the app:

1. Build a scene manifest that defines each world, its assets, and its interactions.
2. Use a client-side media controller to synchronize video, audio, and narration.
3. Render hotspots and transitions as a separate interaction layer.
4. Keep the app static-friendly so it can deploy cleanly to S3 and CloudFront.
5. Add avatar or lip-sync narration as a modular layer, not as the core rendering system.

## Portfolio Blurb

Reference case for a cinematic interactive web experience in React / Next.js: full-screen scenes, embedded video, layered audio, hotspots, and narration-driven transitions. The architecture is designed for static deployment and media-heavy storytelling, with room for AI-assisted narration and avatar tools where needed.

## Related Operational Example

- [Worked Example: Cinematic Adjacency](Worked_Example_Cinematic_Adjacency.md)
