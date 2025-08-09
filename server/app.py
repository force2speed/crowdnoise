from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from model.yamnet_infer import classify_audio  # import your classification logic

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400

    file = request.files['audio']
    lat = request.form.get('lat')
    lng = request.form.get('lng')

    # Save the uploaded file
    filename = f"{uuid.uuid4().hex}.wav"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run classification
    label = classify_audio(filepath)

    return jsonify({
        'label': label,
        'lat': lat,
        'lng': lng
    })

if __name__ == '__main__':
    app.run(debug=True)
