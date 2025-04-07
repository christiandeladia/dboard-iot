import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Config'; // adjust this import based on your project structure

// Updated Marker component that renders a circle with a color based on markerType
const Marker = ({ markerType }) => {
  // Determine the marker color: green for battery, blue for solar, default to gray
  const markerClass =
    markerType === 'battery'
      ? 'bg-green-600'
      : markerType === 'solar'
      ? 'bg-blue-600'
      : 'bg-gray-500';
  return (
    <div
      className={`w-4 h-4 rounded-full ${markerClass}`}
      style={{ border: '2px solid white' }}
    ></div>
  );
};

const MapComponent = ({ updateData }) => {
  const handleChange = (e) => updateData("address", e.target.value);
  const [selectedOption, setSelectedOption] = useState(null);
  const [pins, setPins] = useState([]);

  // Fetch location coordinates from Firestore
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pin_location'));
        const locations = [];
        querySnapshot.forEach((doc) => {
          // Expecting fields: latitude, longitude, and type ("battery" or "solar")
          const data = doc.data();
          locations.push({ id: doc.id, ...data });
        });
        setPins(locations);
      } catch (error) {
        console.error("Error fetching locations: ", error);
      }
    };

    fetchLocations();
  }, []);

  // Set default center of the map and default zoom level
  const defaultProps = {
    center: {
      lat: 14.6760,  // Quezon City latitude
      lng: 121.0437  // Quezon City longitude
    },
    zoom: 10
  };

  return (
    <div className="w-full max-w-10/12">
      <h2 className="text-4xl font-medium mb-8">Tell us more about your project.</h2>

      <div className='p-2 rounded-2xl border border-gray-300 shadow-lg bg-white' style={{ height: '300px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY }} // replace with your API key
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
        >
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              lat={pin.latitude}  // Ensure these fields match your Firestore document fields
              lng={pin.longitude}
              markerType={pin.type}  // Pass the type field ("battery" or "solar")
            />
          ))}
        </GoogleMapReact>
      </div>

      <div className="pl-5">
        <p className="text-[0.85rem] text-blue-600 tracking-tight mt-2 w-full relative pl-5">
          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
          Neighbours On Solar
        </p>

        <p className="text-[0.85rem] text-green-600 tracking-tight mb-3 w-full relative pl-5">
          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-green-600 rounded-full"></span>
          Neighbours With Batteries
        </p>
      </div>
      
      <p className="mt-4 text-2xl font-medium mb-5">Address of your project</p>

      <input
        type="text"
        onChange={handleChange}
        placeholder="22 Ilagan St, Quezon City"
        className="p-2 border rounded w-full"
      />

      <p className="text-[0.75rem] text-gray-400 tracking-tight mb-8 mt-2 text-left w-full max-w-10/12">
        We only use your address so that we can check your roof layout & panel placements.
      </p>
    </div>
  );
};

export default MapComponent;
