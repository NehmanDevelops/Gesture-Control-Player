# Gesture Control Player - Minority Report Style Interface

A futuristic web interface that lets you control volume with hand gestures via your webcam. Built with Next.js, TypeScript, MediaPipe, and Framer Motion.

## Features

- 👆👇 **Index Finger Gestures**: Raise/lower your index finger to increase/decrease volume
- 🖐️ **Neutral (Open Palm)**: Show an open palm to hold/pause volume changes
- 🎨 **Real-time Hand Skeleton Visualization**: See your hand tracked with cyan highlights
- 🔊 **Smooth Volume Control**: Instant volume feedback with animated visualizations
- 📱 **Mobile Responsive**: Works on mobile devices with front-facing camera support
- 🎯 **Gesture Feedback UI**: On-screen indicators show when volume is increasing/decreasing/neutral

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@mediapipe/tasks-vision** (for hand tracking)
- **react-webcam** (for video input)
- **framer-motion** (for smooth animations)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A webcam connected to your device
- Modern browser with WebAssembly support

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Allow camera permissions when prompted

## How to Use

1. **Enable Camera**: Click the “Enable Camera” button and allow permissions
2. **Raise Your Hand**: Keep your hand in the camera view to start tracking
3. **Volume Up**: Point your index finger **up** and hold
4. **Volume Down**: Point your index finger **down** and hold
5. **Neutral / Hold**: Show an **open palm** (hand open) to hold volume steady

Notes:
- The dashboard includes an **audio test tone** so you can hear/see volume changes immediately.
- Browsers can’t reliably change your OS-wide system volume; this app changes volume through Web Audio for the demo audio output.

The interface will show:
- Cyan skeleton overlay of your hand
- Real-time volume bar that responds to your gestures
- Visual feedback indicators

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── CameraView.tsx      # Webcam and canvas overlay
│   ├── VolumeControl.tsx   # Volume visualization
│   ├── VideoPlayer.tsx     # Audio test tone
│   └── HowToUseModal.tsx   # Instructions modal
├── hooks/
│   └── useHandTracking.ts  # MediaPipe hand tracking logic
└── package.json
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (may have limited support)

## Troubleshooting

### Camera not working
- Make sure you've granted camera permissions
- Check if another application is using your camera
- Try refreshing the page

### Gestures feel inconsistent
- Improve lighting and keep your hand centered
- Keep your hand 1–2 feet from the camera
- Use Chrome/Edge for best MediaPipe performance

### MediaPipe not loading
- Check your internet connection (model files are loaded from CDN)
- Ensure your browser supports WebAssembly
- Try clearing browser cache

### Performance issues
- Close other applications using the camera
- Reduce browser tab count
- Use a modern browser with hardware acceleration

## Development

### Build for production
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

## License

MIT

