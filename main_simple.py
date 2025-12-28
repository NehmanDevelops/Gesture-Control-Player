import cv2
import mediapipe as mp
import math

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Initialize hands with detection confidence of 0.7
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# Try to open any available camera
print("Looking for available camera...")
cap = None

# Try camera indices 0-3
for idx in range(4):
    print(f"Trying camera index {idx}...")
    test_cap = cv2.VideoCapture(idx)
    if test_cap.isOpened():
        ret, frame = test_cap.read()
        if ret and frame is not None:
            # Accept any camera that gives us frames (even if green initially)
            cap = test_cap
            print(f"Using camera index {idx}")
            # Set camera properties for better performance
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            break
        else:
            test_cap.release()
    else:
        test_cap.release()

if cap is None or not cap.isOpened():
    print("ERROR: No camera found!")
    print("Make sure you have a webcam connected or DroidCam virtual camera enabled")
    exit()

print("Camera opened! Press 'q' to quit.")

while True:
    # Read frame from webcam
    ret, frame = cap.read()
    if not ret:
        print("Error: Could not read frame")
        break
    
    # Flip frame horizontally for mirror effect
    frame = cv2.flip(frame, 1)
    
    # Convert BGR to RGB (MediaPipe requires RGB)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process the frame to find hand landmarks
    results = hands.process(rgb_frame)
    
    # If hands are detected
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw landmarks and connections using mp_drawing
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )
            
            # Get image dimensions
            h, w, c = frame.shape
            
            # Get thumb tip (landmark 4) coordinates
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
            thumb_x = int(thumb_tip.x * w)
            thumb_y = int(thumb_tip.y * h)
            
            # Get index finger tip (landmark 8) coordinates
            index_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            index_x = int(index_tip.x * w)
            index_y = int(index_tip.y * h)
            
            # Draw circle on thumb tip
            cv2.circle(frame, (thumb_x, thumb_y), 15, (0, 255, 0), cv2.FILLED)
            
            # Draw circle on index finger tip
            cv2.circle(frame, (index_x, index_y), 15, (0, 255, 0), cv2.FILLED)
            
            # Draw line connecting thumb tip and index tip
            cv2.line(frame, (thumb_x, thumb_y), (index_x, index_y), (255, 0, 0), 3)
            
            # Calculate Euclidean distance between thumb tip and index tip
            distance = math.sqrt((thumb_x - index_x)**2 + (thumb_y - index_y)**2)
            
            # Display the distance on the frame
            cv2.putText(frame, f'Distance: {int(distance)}', (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
    
    # Show the image in a window named 'Hand Controller'
    cv2.imshow('Hand Controller', frame)
    
    # Allow exiting the loop by pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all windows
cap.release()
cv2.destroyAllWindows()
print("Done!")

