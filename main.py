import cv2
import mediapipe as mp
import math
import time

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

print("=" * 60)
print("DroidCam Hand Tracking - Camera Detection")
print("=" * 60)

# Strategy: Try to find ANY camera that gives us frames
# Even if it's green initially, it might start working
cap = None
best_camera = None
best_std = 0

print("\nScanning cameras 0-5...")
for idx in range(6):
    print(f"\nTesting camera {idx}...", end=" ")
    test_cap = cv2.VideoCapture(idx)
    
    if not test_cap.isOpened():
        print("FAILED (could not open)")
        test_cap.release()
        continue
    
    # Set properties
    test_cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    test_cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    test_cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    # Wait longer for camera to initialize (especially for DroidCam)
    time.sleep(1.0)
    
    # Try reading MORE frames - DroidCam might need time to start
    total_std = 0
    frame_count = 0
    last_frame = None
    
    for i in range(15):  # Try 15 frames
        ret, frame = test_cap.read()
        if ret and frame is not None:
            frame_count += 1
            last_frame = frame
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            std = gray.std()
            total_std += std
        time.sleep(0.1)  # Small delay between reads
    
    if frame_count > 0:
        avg_std = total_std / frame_count
        print(f"OK - Frames: {frame_count}/15, Variation: {avg_std:.1f}")
        # Accept camera even with low variation (might be green screen initially but will work)
        if avg_std > best_std or best_camera is None:
            best_std = avg_std
            best_camera = idx
            # Don't release - we'll use this one
        else:
            test_cap.release()
    else:
        print("FAILED (no frames)")
        test_cap.release()

print("\n" + "=" * 60)
if best_camera is not None:
    print(f"BEST CAMERA: Index {best_camera} (variation: {best_std:.1f})")
    print(f"Opening camera {best_camera}...")
    cap = cv2.VideoCapture(best_camera)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    # Give it MORE time to stabilize (DroidCam needs this)
    print("Waiting for camera feed to stabilize (this may take a few seconds)...")
    good_frames = 0
    for i in range(30):  # Try up to 30 frames
        ret, frame = cap.read()
        if ret and frame is not None:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if gray.std() > 5:  # Has some variation
                good_frames += 1
                if good_frames >= 3:  # Got a few good frames
                    break
        time.sleep(0.2)
    
    print("Starting hand tracking...")
    print("Press 'q' to quit\n")
    print("NOTE: If you see green screen, wait a few seconds - DroidCam may need time to start streaming")
else:
    print("ERROR: No cameras found!")
    print("\nTROUBLESHOOTING:")
    print("1. Make sure DroidCam app is running on your phone")
    print("2. In DroidCam PC Client, check if 'Virtual Camera' is enabled")
    print("3. Try closing and reopening DroidCam PC Client")
    print("4. Restart DroidCam on your phone")
    exit()

frame_skip = 0
while True:
    ret, frame = cap.read()
    
    if not ret or frame is None:
        frame_skip += 1
        if frame_skip > 30:
            print("ERROR: Lost camera feed!")
            break
        continue
    
    frame_skip = 0
    
    # Flip horizontally for mirror effect
    frame = cv2.flip(frame, 1)
    
    # Convert BGR to RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process hand landmarks
    results = hands.process(rgb_frame)
    
    # Draw hand landmarks and connections
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw skeleton
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )
            
            # Get dimensions
            h, w, c = frame.shape
            
            # Get thumb tip (landmark 4) and index tip (landmark 8)
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
            index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            
            thumb_x = int(thumb_tip.x * w)
            thumb_y = int(thumb_tip.y * h)
            index_x = int(index_tip.x * w)
            index_y = int(index_tip.y * h)
            
            # Draw circles on fingertips
            cv2.circle(frame, (thumb_x, thumb_y), 15, (0, 255, 0), cv2.FILLED)
            cv2.circle(frame, (index_x, index_y), 15, (0, 255, 0), cv2.FILLED)
            
            # Draw connecting line
            cv2.line(frame, (thumb_x, thumb_y), (index_x, index_y), (255, 0, 0), 3)
            
            # Calculate distance
            distance = math.sqrt((thumb_x - index_x)**2 + (thumb_y - index_y)**2)
            
            # Display distance
            cv2.putText(frame, f'Distance: {int(distance)}', (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            
            # Visual feedback if pinched
            if distance < 50:
                cv2.circle(frame, ((thumb_x + index_x) // 2, (thumb_y + index_y) // 2), 
                          20, (0, 255, 0), cv2.FILLED)
    
    # Show frame
    cv2.imshow('Hand Controller', frame)
    
    # Exit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\nDone!")
