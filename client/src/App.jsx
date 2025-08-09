import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Recorder from './components/Recorder'
import Navbar from './components/Navbar'
function App() {
  const [soundMarkers, setSoundMarkers] = useState([])

  const handleNewSound = (lat, lng, label) => {
    setSoundMarkers(prev => [...prev, { lat, lng, label }])
  }

  return (
    <div className='bg-[#363636]'>
    <Navbar/>
     <Recorder onSoundClassified={handleNewSound} />

      <MapContainer center={[28.61, 77.21]} zoom={13} style={{ height: '60vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {soundMarkers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>
              <strong>Detected Sound:</strong> {marker.label}
            </Popup>
          </Marker>
        ))}
      </MapContainer> 
    </div>
  )
}

export default App
