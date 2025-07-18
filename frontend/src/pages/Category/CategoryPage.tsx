import React, { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonFooter,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToast
} from '@ionic/react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { getBusinessesByCategory } from '../../services/businessService';
import { 
  arrowBackOutline, 
  locationOutline, 
  starOutline,
  homeOutline, 
  searchOutline, 
  bookmarkOutline, 
  personOutline,
  notificationsOutline,
  locateOutline
} from 'ionicons/icons';
import './CategoryPage.css';

const containerStyle = {
  width: '100%',
  height: '220px',
  borderRadius: '12px',
  overflow: 'hidden',
};

const defaultCenter = {
  lat: 25.430484,
  lng: 81.767569
};
const libraries: ('places')[] = ['places'];

const CategoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [activeTab, setActiveTab] = useState('search');
  const [currentLocation, setCurrentLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [showLocationError, setShowLocationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const history = useHistory();
  const contentRef = useRef<HTMLIonContentElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCTiRPlMIfN1RO0qDjvJOO7W1QYjh0TWnU',
    libraries
  });

  useEffect(() => {
    getBusinessesByCategory(name).then(data => {
      setBusinesses(data);
      setFiltered(data);

      if (data.length > 0) {
        setMapCenter({
          lat: data[0].location.lat,
          lng: data[0].location.lng
        });
      }
    });
    
    // Try to get current location when component mounts
    getCurrentLocation();
  }, [name]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(userLocation);
          
          // Optionally center the map on user's location
          setMapCenter(userLocation);
          
          // If map is already loaded, we can pan to the location
          if (mapRef.current) {
            mapRef.current.panTo(userLocation);
          }
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

  const handleSearch = async (e: CustomEvent) => {
    const query = e.detail.value?.toLowerCase() || '';
    setSearchText(query);

    if (!query) {
      setFiltered(businesses);
      return;
    }

    const results = businesses.filter(biz =>
      biz.name.toLowerCase().includes(query) ||
      biz.description.toLowerCase().includes(query)
    );
    setFiltered(results);
  };

  const centerOnUserLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
      mapRef.current.setZoom(15); // Zoom in closer to user location
    } else {
      setCurrentLocation(defaultCenter);
    }
  };
  
  // Function to focus map on a specific business
  const focusOnBusiness = (business: any) => {
    if (mapRef.current) {
      // Set the selected business ID
      setSelectedBusiness(business._id);
      
      // Center the map on the business location
      const businessLocation = {
        lat: business.location.lat,
        lng: business.location.lng
      };
      
      mapRef.current.panTo(businessLocation);
      mapRef.current.setZoom(16); // Zoom in closer
      
      // Scroll to map if it's out of view
      if (contentRef.current) {
        contentRef.current.scrollToPoint(0, 0, 500);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="main-header">
          <IonButtons slot="start">
            <IonButton onClick={() => history.push('/')} className="back-button">
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          
          <div className="category-title-container">
            <div className="category-icon-wrapper">
              <img 
                src={`/public/assets/icons/${name.toLowerCase()}.png`} 
                alt={name} 
                className="category-header-icon"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = '/public/assets/icons/default.png';
                }}
              />
            </div>
            <div className="category-title-text">{name}</div>
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
        <div className="search-container">
          <IonSearchbar
            value={searchText}
            debounce={300}
            onIonInput={handleSearch}
            placeholder={`Search in ${name}`}
            className="custom-searchbar"
          />
        </div>

        {isLoaded && (
          <div className="map-container">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={map => {
                mapRef.current = map;
              }}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false
              }}
            >
              {/* Render business markers */}
              {filtered.map((biz) => (
                <Marker
                  key={biz._id}
                  position={{ lat: biz.location.lat, lng: biz.location.lng }}
                  title={biz.name}
                  animation={selectedBusiness === biz._id ? google.maps.Animation.BOUNCE : undefined}
                  icon={selectedBusiness === biz._id ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#FF5722",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 2,
                  } : undefined}
                />
              ))}
              
              {/* Render current location marker with a different icon */}
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
        )}

        <h2 className="section-title">Available {name} Places</h2>
        <div className="card-container">
          {filtered.map((biz) => (
            <IonCard 
              key={biz._id} 
              className={`business-card ${selectedBusiness === biz._id ? 'selected-business' : ''}`}
              onClick={() => focusOnBusiness(biz)}
            >
              <IonCardHeader>
                <IonCardTitle className="card-title">{biz.name}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <div className="card-description">{biz.description}</div>
                
                <div className="card-info">
                  <div className="card-location">
                    <IonIcon icon={locationOutline} />
                    <span>{biz.address || "Prayagraj"}</span>
                  </div>
                  
                  <div className="card-rating">
                    <IonIcon icon={starOutline} />
                    <span>{biz.rating}</span>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
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

export default CategoryPage;