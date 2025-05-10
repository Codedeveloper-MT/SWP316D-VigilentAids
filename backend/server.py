from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from the frontend

# Load YOLOv8 Nano model
try:
    model = YOLO("yolov8m.pt")
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    try:
        # Read image from request
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Failed to decode image"}), 400

        print("Image decoded successfully.")

        # Ensure the model is loaded
        if model is None:
            return jsonify({"error": "YOLO model not loaded"}), 500

        # Run YOLO detection with a confidence threshold
        print(f"Running YOLO detection with confidence threshold: 0.5")
        results = model.predict(img, conf=0.5)
        print("YOLO detection completed.")

        # Format detections
        detections = []
        for box in results[0].boxes:
            cls_id = int(box.cls)
            conf = float(box.conf)
            label = model.names[cls_id]

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            detections.append({
                "class": label,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })

        print(f"Detections: {detections}")

        return jsonify({"detections": detections})
    except Exception as e:
        print(f"Detection failed: {e}")
        return jsonify({"error": f"Detection failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
