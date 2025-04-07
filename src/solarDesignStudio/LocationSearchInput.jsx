import React, { useEffect, useRef } from 'react';

const LocationSearchInput = ({ onPlaceChanged }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps API with Places library is not loaded");
      return;
    }
    
    // Initialize the autocomplete widget
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'], // restrict to addresses; use ['(cities)'] for cities, etc.
      componentRestrictions: { country: 'ph' } // restrict to Philippines; change if needed
    });
    
    // Add listener for place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (onPlaceChanged) {
        onPlaceChanged(place);
      }
    });
  }, [onPlaceChanged]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter a location"
      className="p-2 border rounded w-full"
    />
  );
};

export default LocationSearchInput;
