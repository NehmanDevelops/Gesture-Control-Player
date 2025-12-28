import cv2
import time

print("Detecting available cameras...")
print("=" * 50)

working_cameras = []

for idx in range(10):
    print(f"\nTesting camera index {idx}...")
    cap = cv2.VideoCapture(idx)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print(f"  [FAIL] Could not open camera {idx}")
        continue
    
    time.sleep(0.5)  # Wait for camera to initialize
    
    # Try to read a few frames
    frame_count = 0
    has_variation = False
    
    for i in range(5):
        ret, frame = cap.read()
        if ret and frame is not None:
            frame_count += 1
            # Check if frame has variation (not just solid color)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            std_dev = gray.std()
            
            # Check frame color
            b_mean = frame[:, :, 0].mean()
            g_mean = frame[:, :, 1].mean()
            r_mean = frame[:, :, 2].mean()
            
            if std_dev > 15:  # Has some variation
                has_variation = True
            
            print(f"  Frame {i+1}: std={std_dev:.1f}, RGB=({int(b_mean)},{int(g_mean)},{int(r_mean)})")
    
    cap.release()
    
    if frame_count > 0:
        if has_variation:
            print(f"  [OK] Camera {idx}: WORKING - Has video content!")
            working_cameras.append(idx)
        else:
            print(f"  [WARN] Camera {idx}: Opens but shows solid color (likely wrong camera)")
    else:
        print(f"  [FAIL] Camera {idx}: Opens but no frames")

print("\n" + "=" * 50)
print(f"\nSummary:")
if working_cameras:
    print(f"[SUCCESS] Working cameras found: {working_cameras}")
    print(f"Use camera index {working_cameras[0]} in main.py")
else:
    print("[FAIL] No working cameras found")
    print("\nTips:")
    print("1. Close OBS Studio if it's open (it may have exclusive camera access)")
    print("2. Close DroidCam Client and reopen it")
    print("3. Make sure DroidCam is set as a virtual camera in DroidCam settings")

