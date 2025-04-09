import React, { useEffect, useState, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Config';

const Marker = ({ markerType }) => {
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

const MapComponent = ({ updateData, selectedAddress  }) => {
  const inputRef = useRef(null);
  const [pins, setPins] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null); // lat/lng
  const [showDefaultMap, setShowDefaultMap] = useState(true);
  const debounceTimer = useRef(null);
  const wasFromInput = useRef(false);

  useEffect(() => {
    if (selectedAddress && window.google?.maps?.Geocoder) {
      if (inputRef.current) {
        inputRef.current.value = selectedAddress;
      }
  
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: selectedAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setSelectedLocation({ lat, lng });
          setShowDefaultMap(false);
        } else {
          console.warn("Geocode failed for saved address:", status);
        }
      });
    }
  }, [selectedAddress]);
  

  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pin_location'));
        const locations = [];
        querySnapshot.forEach((doc) => {
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

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn('Google Maps JavaScript API or Places library is not available yet.');
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'ph' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address && place.geometry) {
          console.log("Selected Address:", place.formatted_address);
          wasFromInput.current = true;
          updateData("address", place.formatted_address);
      
          // Manually update the input's value
          if (inputRef.current) {
            inputRef.current.value = place.formatted_address;
          }
      
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setSelectedLocation({ lat, lng });
          setShowDefaultMap(false);
        }
      });
      
    };

    if (typeof window !== "undefined") {
      if (window.google?.maps?.places) {
        initializeAutocomplete();
      } else {
        const intervalId = setInterval(() => {
          if (window.google?.maps?.places) {
            initializeAutocomplete();
            clearInterval(intervalId);
          }
        }, 100);
      }
    }
  }, []);

  const defaultProps = {
    center: { lat: 14.6760, lng: 121.0437 },
    zoom: 10
  };

  const reverseGeocodeLatLng = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
  
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        console.log("Reverse Geocoded Address:", address);
        
        // Update input field
        if (inputRef.current) {
          inputRef.current.value = address;
        }
  
        // Update formData
        updateData("address", address);
      } else {
        console.warn("Geocoder failed: " + status);
      }
    });
  };

  const drawMetroManilaCircle = (map, maps) => {
    const circle = new maps.Circle({
      center: { lat: 14.5995, lng: 120.9842 }, // approximate center of Metro Manila
      radius: 25000, // in meters, approx. 18km radius
      strokeColor: '#FFF085',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FFF085',
      fillOpacity: 0.15,
    });
  
    circle.setMap(map);
  };
  
  

  const handleChange = (e) => {
    const value = e.target.value;
    updateData("address", value);

    console.log("Typed Address:", value); // <-- add this
    wasFromInput.current = true;
    updateData("address", value);
    if (value.trim() === '') {
      setSelectedLocation(null);
      setShowDefaultMap(true);
    }
  };
  

  return (
    <div className="w-full max-w-10/12">
                  <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
                Solar Design Studio
            </h2>
      <h2 className="text-4xl font-medium mb-8">Tell us more about your project.</h2>

      <div className='p-2 rounded-2xl border border-gray-300 shadow-lg bg-white' style={{ height: '300px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            libraries: ['places']
          }}
          center={selectedLocation || defaultProps.center}
          zoom={selectedLocation ? 17 : defaultProps.zoom}
          options={{
            mapTypeId: 'hybrid' // 👈 this sets the satellite view
          }}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => drawMetroManilaCircle(map, maps)}
          onChange={({ center }) => {
            if (!showDefaultMap) {
              setSelectedLocation(center);
          
              // Skip reverse geocode if this was triggered from user input
              if (wasFromInput.current) {
                wasFromInput.current = false; // reset it for next drag
                return;
              }
          
              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
              }
          
              debounceTimer.current = setTimeout(() => {
                reverseGeocodeLatLng(center.lat, center.lng);
              }, 700);
            }
          }}          
          
          
        >
          {showDefaultMap &&
            pins.map((pin) => (
              <Marker
                key={pin.id}
                lat={pin.latitude}
                lng={pin.longitude}
                markerType={pin.type}
              />
            ))}
          {/* We won't put the fixed marker inside GoogleMapReact */}
        </GoogleMapReact>

        {!showDefaultMap && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
            <div className="w-5 h-5 bg-red-500 border-2 border-white rounded-full shadow-md"></div>
          </div>
        )}
      </div>

      {showDefaultMap && (
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
      )}

      <p className="mt-4 text-2xl font-medium mb-5">Address of your project</p>

      <input
        ref={inputRef}
        type="text"
        placeholder="22 Ilagan St, Quezon City"
        className="p-2 border rounded w-full"
        onChange={handleChange}
      />


      <p className="text-[0.75rem] text-gray-400 tracking-tight mb-8 mt-2 text-left w-full max-w-10/12">
        We only use your address so that we can check your roof layout & panel placements.
      </p>
    </div>
  );
};

export default MapComponent;
