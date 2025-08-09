import React, { useState, useRef } from 'react'

const Recorder = ({ onSoundClassified }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [location, setLocation] = useState(null)
  const [audioURL, setAudioURL] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)

        // Send audio + location to backend
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
        formData.append('lat', location?.lat)
        formData.append('lng', location?.lng)

        fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        })
          .then(res => res.json())
          .then(data => {
            alert(`Detected Sound: ${data.label}`)
            console.log('Response from server:', data)

            // ✅ Notify parent map component
            if (onSoundClassified) {
                console.log('Calling onSoundClassified with:', data.lat, data.lng, data.label)
              onSoundClassified(data.lat, data.lng, data.label)
            }
          })
          .catch(err => console.error('Upload failed', err))
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)

      // Stop recording after 5 seconds
      setTimeout(() => {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }, 5000)

      // Get location
      navigator.geolocation.getCurrentPosition(pos => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      })
    } catch (err) {
      console.error("Error accessing mic or location", err)
      alert("Please allow microphone and location access.")
    }
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={startRecording}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={isRecording}
      >
        {isRecording ? 'Recording...' : 'Start Recording'}
      </button>

      {audioURL && (
        <div>
          <p className="text-green-600">Recording Complete:</p>
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {location && (
        <p className="text-sm text-gray-600">
          Location: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
        </p>
      )}
    </div>
  )
}

export default Recorder
