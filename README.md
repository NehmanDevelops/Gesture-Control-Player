# Gesture Control Player - Minority Report Style Interface

A futuristic web interface that allows you to control volume and playback using hand gestures via your webcam. Built with Next.js, TypeScript, MediaPipe, and Framer Motion.

## Features

- 🤏 **Pinch Gesture Control**: Control volume by pinching your thumb and index finger
- 🎨 **Real-time Hand Skeleton Visualization**: See your hand tracked with cyan highlights
- 🔊 **Smooth Volume Control**: Instant volume feedback with animated visualizations
- 📱 **Mobile Responsive**: Works on mobile devices with front-facing camera support
- 🎯 **Open Hand vs Closed Fist Detection**: Advanced gesture recognition

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

1. **Raise Your Hand**: Position your hand in front of the camera
2. **Pinch to Grab**: Bring your thumb and index finger together to grab the volume slider
3. **Move Fingers Apart**: Spread your thumb and index finger to increase volume
4. **Close Fist**: Make a fist to decrease volume

The interface will show:
- Cyan skeleton overlay of your hand
- Green line connecting thumb and index when pinching
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

