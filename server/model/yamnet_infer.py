import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import librosa

# URL to class names CSV
CLASS_MAP_URL = 'https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv'

# Download and load class names
class_map_path = tf.keras.utils.get_file('yamnet_class_map.csv', CLASS_MAP_URL)
with open(class_map_path, 'r') as f:
    lines = f.readlines()[1:]  # skip header
    class_names = [line.strip().split(',')[2] for line in lines]

# Load YAMNet model from TensorFlow Hub
yamnet_model_handle = 'https://tfhub.dev/google/yamnet/1'
yamnet_model = hub.load(yamnet_model_handle)

# Function to classify an audio file
def classify_audio(file_path):
    # Load and preprocess audio to 16 kHz mono
    waveform, sr = librosa.load(file_path, sr=16000, mono=True)

    # Convert to float32 tensor
    waveform = waveform.astype(np.float32)

    # Run through YAMNet
    scores, embeddings, spectrogram = yamnet_model(waveform)

    # Average scores over time and get top class
    mean_scores = tf.reduce_mean(scores, axis=0)
    top_class = tf.argmax(mean_scores).numpy()

    return class_names[top_class]
