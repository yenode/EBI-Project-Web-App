import React, { useEffect, useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonSpinner,
  IonChip,
  IonLabel,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonFooter,
  IonToast
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { 
  arrowBackOutline, 
  locationOutline, 
  starOutline, 
  homeOutline, 
  searchOutline, 
  bookmarkOutline, 
  personOutline,
  notificationsOutline,
  locateOutline, 
  key
} from 'ionicons/icons';
import './SearchResultsPage.css';

const containerStyle = {
  width: '100%',
  height: '220px',
  borderRadius: '12px',
  overflow: 'hidden',
};

const defaultCenter = { lat: 25.4358, lng: 81.8463 };

// Interface for places
interface Place {
  id: string;
  name: string;
  vicinity: string;
  rating?: number;
  types: string[];
  geometry: {
    location: google.maps.LatLng;
  };
}

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const queryParam = new URLSearchParams(location.search).get('query') || '';
  const [query, setQuery] = useState(queryParam);
  const [center, setCenter] = useState(defaultCenter);
  const [places, setPlaces] = useState<Place[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [showLocationError, setShowLocationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const [newSearch, setNewSearch] = useState(false);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCTiRPlMIfN1RO0qDjvJOO7W1QYjh0TWnU',
    libraries: ['places'],
  });

  useEffect(() => {
    if (!isLoaded || !queryParam) return;

    setLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: queryParam }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        setCenter(location.toJSON());
      } else {
        console.error('Geocode failed: ', status);
      }
      setLoading(false);
    });
    
    // Try to get current location when component mounts
    getCurrentLocation();
  }, [isLoaded, queryParam]);

  // Effect to remove drop animation after initial render
  useEffect(() => {
    if (newSearch) {
      const timer = setTimeout(() => {
        setNewSearch(false);
      }, 1000); // Allow enough time for drop animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [newSearch]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(userLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          setErrorMessage(`Couldn't get your location: ${error.message}`);
          setShowLocationError(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setErrorMessage("Geolocation is not supported by this browser.");
      setShowLocationError(true);
    }
  };

  const centerOnUserLocation = () => {
    if (currentLocation && mapInstance) {
      mapInstance.panTo(currentLocation);
      mapInstance.setZoom(15); // Zoom in closer to user location
    } else {
      getCurrentLocation();
    }
  };

  const searchNearbyPlaces = () => {
    if (!mapInstance || !categorySearch) return;
    
    setLoading(true);
    // Clear any previously selected place
    setSelectedPlace(null);
    
    const service = new google.maps.places.PlacesService(mapInstance);
    
    const request = {
      location: new google.maps.LatLng(center.lat, center.lng),
      radius: 1500,
      keyword: categorySearch
    };
    
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results as unknown as Place[]);
        setNewSearch(true); // Set this flag to true for new search results
      } else {
        console.error('Places search failed:', status);
        setPlaces([]);
      }
      setLoading(false);
    });
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    
    const placeLocation = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    
    if (mapInstance) {
      // Smooth pan to the location without animation
      mapInstance.panTo(placeLocation);
      mapInstance.setZoom(16); // Zoom in closer for better detail
      
      // Scroll to map if it's out of view
      if (contentRef.current) {
        contentRef.current.scrollToPoint(0, 0, 500); // Smooth scroll to top with 500ms animation
      }
    }
  };

  if (!isLoaded) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="main-header">
            <IonButtons slot="start">
              <IonButton onClick={() => history.push('/')}>
                <IonIcon icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>Loading Map...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding loading-content">
          <div className="loading-container">
            <IonSpinner name="circles" />
            <p>Loading map resources...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="main-header">
          <IonButtons slot="start">
            <IonButton className="back-button" onClick={() => history.push('/')}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          
          <div className="search-title-container">
            <div className="search-icon-wrapper">
              <IonIcon icon={searchOutline} />
            </div>
            <div className="search-title-text">Search Results</div>
          </div>
          
          <IonButtons slot="end">
            <IonButton className="notification-btn">
              <IonIcon icon={notificationsOutline} />
              <IonBadge color="danger" className="notification-badge">2</IonBadge>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" ref={contentRef}>
        <div className="location-indicator">
          <IonIcon icon={locationOutline} />
          <span>{query}</span>
        </div>
        
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={map => setMapInstance(map)}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false
            }}
          >
            {/* Main location marker */}
            <Marker 
              position={center} 
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
            
            {/* Places markers */}
            {places.map(place => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <Marker 
                  key={place.id}
                  position={{
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                  }}
                  onClick={() => handlePlaceClick(place)}
                  // Only use drop animation for new search results, no bouncing
                  animation={newSearch ? google.maps.Animation.DROP : undefined}
                  icon={isSelected ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#FF5722",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2,
                  } : undefined}
                />
              );
            })}
            
            {/* Current user location marker */}
            {currentLocation && (
              <Marker
                position={currentLocation}
                title="Your Location"
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#4285F4",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
          
          {/* Add a button to center the map on current location */}
          <IonButton 
            className="locate-button" 
            size="small" 
            onClick={centerOnUserLocation}
          >
            <IonIcon icon={locateOutline} />
          </IonButton>
        </div>

        <div className="search-container">
          <IonSearchbar
            value={categorySearch}
            onIonInput={(e) => setCategorySearch(e.detail.value!)}
            placeholder="Search for businesses nearby"
            className="custom-searchbar"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && categorySearch.trim()) {
                searchNearbyPlaces();
              }
            }}
          />
          <IonButton expand="block" onClick={searchNearbyPlaces} disabled={loading} className="search-btn">
            {loading ? <IonSpinner name="dots" /> : 'Search Nearby'}
          </IonButton>
        </div>

        {places.length > 0 && (
          <div className="results-container">
            <h2 className="section-title">
              Found {places.length} places for "{categorySearch}"
            </h2>
            
            <div className="card-container">
              {places.map((place) => (
                <IonCard 
                  key={place.id} 
                  onClick={() => {handlePlaceClick(place)}}
                  className={`business-card ${selectedPlace?.id === place.id ? 'selected-card' : ''}`}
                >
                  <IonCardHeader>
                    <IonCardTitle className="card-title">{place.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="card-description">
                      <div className="place-address">
                        <IonIcon icon={locationOutline} />
                        <span>{place.vicinity}</span>
                      </div>
                      
                      {place.rating && (
                        <div className="card-rating">
                          <IonIcon icon={starOutline} />
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="place-types">
                      {place.types.slice(0, 3).map((type, idx) => (
                        <IonChip key={idx} className="type-chip">
                          <IonLabel>{type.replace(/_/g, ' ')}</IonLabel>
                        </IonChip>
                      ))}
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          </div>
        )}

        {places.length === 0 && categorySearch && !loading && (
          <div className="no-results">
            <IonText color="medium">
              <h4>No places found for "{categorySearch}"</h4>
              <p>Try different keywords or search in another area</p>
            </IonText>
          </div>
        )}
      </IonContent>

      <IonFooter>
        <IonToolbar className="bottom-tabs">
          <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as string)}>
            <IonSegmentButton value="home" className="tab-button" onClick={() => history.push('/')}>
              <div className="tab-content">
                <IonIcon icon={homeOutline} />
                <IonLabel>Home</IonLabel>
              </div>
            </IonSegmentButton>
            <IonSegmentButton value="search" className="tab-button">
              <div className="tab-content">
                <IonIcon icon={searchOutline} />
                <IonLabel>Search</IonLabel>
              </div>
            </IonSegmentButton>
            <IonSegmentButton value="saved" className="tab-button">
              <div className="tab-content">
                <IonIcon icon={bookmarkOutline} />
                <IonLabel>Saved</IonLabel>
              </div>
            </IonSegmentButton>
            <IonSegmentButton value="profile" className="tab-button">
              <div className="tab-content">
                <IonIcon icon={personOutline} />
                <IonLabel>Profile</IonLabel>
              </div>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonFooter>
      
      {/* Toast for location errors */}
      <IonToast
        isOpen={showLocationError}
        onDidDismiss={() => setShowLocationError(false)}
        message={errorMessage}
        duration={3000}
        color="danger"
      />
    </IonPage>
  );
};

export default SearchResultsPage;