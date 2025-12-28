# Hand Tracking Test - MacBook Setup

## Quick Setup Instructions

### Step 1: Install Python (if not already installed)
Open Terminal and check if Python is installed:
```bash
python3 --version
```

If not installed, install it from python.org or using Homebrew.

### Step 2: Install Required Packages
In Terminal, run:
```bash
pip3 install opencv-python mediapipe
```

### Step 3: Copy the Test Script
Copy the file `test_hand_tracking.py` to the MacBook.

### Step 4: Run the Script
In Terminal, navigate to where you saved the file, then run:
```bash
python3 test_hand_tracking.py
```

### Step 5: Test It!
- Show your hand to the camera
- You should see skeleton lines on your hand
- Green circles on thumb and index finger tips
- Blue line connecting them
- Distance displayed on screen
- "PINCHED!" appears when fingers are close together

Press 'q' to quit.

## Troubleshooting

**If camera doesn't open:**
- Make sure no other app is using the camera
- Try changing `cv2.VideoCapture(0)` to `cv2.VideoCapture(1)` in the script

**If you get import errors:**
- Make sure you used `pip3` not `pip`
- Try: `python3 -m pip install opencv-python mediapipe`

