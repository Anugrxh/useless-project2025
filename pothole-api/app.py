import os
import uuid
import random
import cv2
import numpy as np
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from ultralytics import YOLO

# Create folders if not exists
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# Load YOLO model
model = YOLO("best.pt")  # your trained model

# Flask app setup
app = Flask(__name__)
CORS(app)  # allow frontend requests

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filename = f"{uuid.uuid4()}.jpg"
    input_path = os.path.join("uploads", filename)
    file.save(input_path)

    # ---------- 1. YOLO detection ----------
    results = model.predict(input_path, save=False)

    # ---------- 2. Load image ----------
    image = cv2.imread(input_path)

    # ---------- 3. Create obstacle mask ----------
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    margin = 15  # safe distance around potholes

    for box in results[0].boxes.xyxy:
        x1, y1, x2, y2 = map(int, box[:4])
        x1 = max(0, x1 - margin)
        y1 = max(0, y1 - margin)
        x2 = min(image.shape[1] - 1, x2 + margin)
        y2 = min(image.shape[0] - 1, y2 + margin)
        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)  # mark as obstacle

        # Draw red pothole box
        cv2.rectangle(image, (x1 + margin, y1 + margin), (x2 - margin, y2 - margin), (0, 0, 255), 2)

    # ---------- 4. Random path generation ----------
    start = (0, image.shape[1] // 2)                 # top middle
    end = (image.shape[0] - 1, image.shape[1] // 2)  # bottom middle

    current = start
    path_points = [current]

    while current[0] < end[0]:
        y, x = current
        moves = [
            (y + 1, x),      # down
            (y + 1, x + 1),  # down-right
            (y + 1, x - 1),  # down-left
            (y, x + 1),      # right
            (y, x - 1)       # left
        ]
        random.shuffle(moves)

        for ny, nx in moves:
            if 0 <= ny < image.shape[0] and 0 <= nx < image.shape[1]:
                if mask[ny, nx] == 0:  # free space
                    current = (ny, nx)
                    path_points.append(current)
                    break
        else:
            break  # no move possible

    # ---------- 5. Draw thick green path ----------
    for i in range(len(path_points) - 1):
        y1, x1 = path_points[i]
        y2, x2 = path_points[i + 1]
        cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 4)

    # ---------- 6. Save output ----------
    final_output = os.path.join("outputs", filename)
    cv2.imwrite(final_output, image)

    return send_file(final_output, mimetype="image/jpeg")

if __name__ == "__main__":
    app.run(debug=True)
