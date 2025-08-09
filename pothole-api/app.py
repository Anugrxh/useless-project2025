import os
import uuid
import cv2
import numpy as np
import heapq
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from ultralytics import YOLO

# --- Setup ---
# Create folders if they don't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

# Load your trained YOLO model once when the application starts.
# This is much more efficient than loading it for each request.
print("Loading YOLO model...")
try:
    model = YOLO("best.pt")
    print("YOLO model loaded successfully.")
except Exception as e:
    print(f"FATAL: Error loading YOLO model: {e}")
    # If the model can't be loaded, the app is useless.
    # In a real production environment, you might want to exit.
    model = None

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow frontend requests

def a_star_pathfinding(mask, start, end):
    """
    Finds the shortest path from start to end using the A* algorithm, avoiding obstacles in the mask.

    Args:
        mask (np.array): A 2D numpy array where 0 is free space and 255 is an obstacle.
        start (tuple): The (y, x) starting coordinates.
        end (tuple): The (y, x) ending coordinates.

    Returns:
        list: A list of (y, x) tuples representing the path, or an empty list if no path is found.
    """
    # The priority queue for nodes to visit. Stores (f_score, y, x).
    open_set = [(0, start[0], start[1])]
    
    # came_from[node] will be the node that came before it on the cheapest path.
    came_from = {}

    # g_score[node] is the cost of the cheapest path from start to the node.
    g_score = { (r, c): float('inf') for r in range(mask.shape[0]) for c in range(mask.shape[1]) }
    g_score[start] = 0

    # f_score[node] = g_score[node] + heuristic(node, end).
    f_score = { (r, c): float('inf') for r in range(mask.shape[0]) for c in range(mask.shape[1]) }
    f_score[start] = np.sqrt((start[0] - end[0])**2 + (start[1] - end[1])**2)

    while open_set:
        # Get the node in open_set with the lowest f_score
        _, current_y, current_x = heapq.heappop(open_set)
        current_pos = (current_y, current_x)

        # If we've reached the end row, reconstruct and return the path
        if current_pos[0] >= end[0]:
            path = []
            while current_pos in came_from:
                path.append(current_pos)
                current_pos = came_from[current_pos]
            path.append(start)
            return path[::-1] # Return reversed path

        # Explore neighbors
        for dy, dx in [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]:
            neighbor_y, neighbor_x = current_y + dy, current_x + dx
            neighbor_pos = (neighbor_y, neighbor_x)

            # Check if neighbor is within bounds
            if not (0 <= neighbor_y < mask.shape[0] and 0 <= neighbor_x < mask.shape[1]):
                continue

            # Check if neighbor is an obstacle
            if mask[neighbor_y, neighbor_x] != 0:
                continue

            # Calculate tentative g_score
            tentative_g_score = g_score[current_pos] + np.sqrt(dy**2 + dx**2)

            if tentative_g_score < g_score.get(neighbor_pos, float('inf')):
                # This path to neighbor is better than any previous one. Record it!
                came_from[neighbor_pos] = current_pos
                g_score[neighbor_pos] = tentative_g_score
                h_score = np.sqrt((neighbor_y - end[0])**2 + (neighbor_x - end[1])**2)
                f_score[neighbor_pos] = g_score[neighbor_pos] + h_score
                heapq.heappush(open_set, (f_score[neighbor_pos], neighbor_y, neighbor_x))

    return [] # Return empty list if no path was found

@app.route("/predict", methods=["POST"])
def predict():
    """
    This API endpoint accepts an uploaded image, detects potholes,
    calculates a safe path around them using A*, and returns the resulting image.
    """
    if model is None:
        return jsonify({"error": "Model is not loaded, cannot process request."}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Generate a unique filename and save the uploaded file
    base_filename = str(uuid.uuid4())
    filename = f"{base_filename}.jpg"
    input_path = os.path.join("uploads", filename)
    file.save(input_path)

    # ---------- 1. YOLO detection ----------
    try:
        results = model.predict(input_path, save=False, verbose=False)
    except Exception as e:
        return jsonify({"error": f"An error occurred during model prediction: {e}"}), 500

    # ---------- 2. Load image ----------
    image = cv2.imread(input_path)
    if image is None:
        return jsonify({"error": "Failed to read the uploaded image file."}), 500
        
    img_height, img_width = image.shape[:2]

    # ---------- 3. Create obstacle mask and draw pothole boxes ----------
    mask = np.zeros((img_height, img_width), dtype=np.uint8)
    margin = 25  # Increased margin for safer pathing

    for box in results[0].boxes.xyxy:
        x1, y1, x2, y2 = map(int, box[:4])
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)
        
        mask_x1 = max(0, x1 - margin)
        mask_y1 = max(0, y1 - margin)
        mask_x2 = min(img_width - 1, x2 + margin)
        mask_y2 = min(img_height - 1, y2 + margin)
        cv2.rectangle(mask, (mask_x1, mask_y1), (mask_x2, mask_y2), 255, -1)

    # ---------- 4. A* Path Generation ----------
    start_point = (0, img_width // 2)
    end_point = (img_height - 1, img_width // 2)
    
    # --- DEBUGGING: Check if start/end points are blocked ---
    if mask[start_point] == 255:
        print("Warning: Start point is inside an obstacle. No path is possible.")
        path_points = []
    elif mask[end_point] == 255:
        print("Warning: End point is inside an obstacle. Path may not reach the exact end.")
        path_points = a_star_pathfinding(mask, start_point, end_point)
    else:
        print("Calculating path...")
        path_points = a_star_pathfinding(mask, start_point, end_point)
    
    print(f"Path found with {len(path_points)} points.")

    # ---------- 5. Draw the calculated path ----------
    if path_points:
        for i in range(len(path_points) - 1):
            # Points are (y, x), but cv2.line needs (x, y)
            p1_cv = (path_points[i][1], path_points[i][0])
            p2_cv = (path_points[i+1][1], path_points[i+1][0])
            cv2.line(image, p1_cv, p2_cv, (0, 255, 0), 4)
    else:
        print("Warning: No path could be found. The obstacles may be blocking the way.")

    # ---------- 6. Save output and debug mask ----------
    final_output_path = os.path.join("outputs", filename)
    cv2.imwrite(final_output_path, image)
    
    # --- DEBUGGING: Save the obstacle mask image ---
    mask_filename = f"mask_{base_filename}.jpg"
    mask_output_path = os.path.join("outputs", mask_filename)
    cv2.imwrite(mask_output_path, mask)
    print(f"Debug mask saved to: {mask_output_path}")

    # Clean up the uploaded file
    os.remove(input_path)

    return send_file(final_output_path, mimetype="image/jpeg")

if __name__ == "__main__":
    # Ensure you have the required packages:
    # pip install flask flask-cors opencv-python ultralytics numpy
    app.run(debug=True, port=5000)
