import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFooter,
  IonText,
  IonButtons,
  IonButton,
  IonIcon,
  IonAvatar,
  IonBadge,
  IonItem,
  IonLabel,
  IonRippleEffect,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { locationOutline, settingsOutline, homeOutline, searchOutline, bookmarkOutline, personOutline, notificationsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getTopRated, getMostSearched } from '../../services/businessService';
import './Home.css';

const categories = [
  { name: 'Cafe', icon: '/public/assets/icons/cafe.png' },
  { name: 'Restaurant', icon: '/public/assets/icons/restaurant.png' },
  { name: 'Salon', icon: '/public/assets/icons/salon.png' },
  { name: 'Grocery', icon: '/public/assets/icons/grocery.png' },
  { name: 'Electronics', icon: '/public/assets/icons/electronics.png' },
  { name: 'Mobile Repair', icon: '/public/assets/icons/repair.png' },
  { name: 'Pharmacy', icon: '/public/assets/icons/pharmacy.png' },
  { name: 'Tailor', icon: '/public/assets/icons/tailor.png' },
  { name: 'Fitness', icon: '/public/assets/icons/fitness.png' },
  { name: 'Books', icon: '/public/assets/icons/books.png' }
];

const Home: React.FC = () => {
  const history = useHistory();
  const [topRated, setTopRated] = useState<any[]>([]);
  const [mostSearched, setMostSearched] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState('explore');

  useEffect(() => {
    getTopRated().then(setTopRated);
    getMostSearched().then(setMostSearched);
  }, []);

  const goToCategory = (name: string) => {
    history.push(`/category/${name}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="main-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="#FF5722" d="M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zM12,11.5c-1.38,0 -2.5,-1.12 -2.5,-2.5s1.12,-2.5 2.5,-2.5 2.5,1.12 2.5,2.5 -1.12,2.5 -2.5,2.5z" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">BusinessDart</span>
              <span className="logo-location">
                <IonIcon icon={locationOutline} size="small" />
                Prayagraj
              </span>
            </div>
          </div>
          
          <IonButtons slot="end">
            <IonButton className="notification-btn">
              <IonIcon icon={notificationsOutline} />
              <IonBadge color="danger" className="notification-badge">2</IonBadge>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="search-container">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchText.trim()) {
                history.push(`/search?query=${encodeURIComponent(searchText.trim())}`);
              }
            }}
            placeholder="Search for places or businesses"
            className="custom-searchbar"
          />
        </div>

        <h2 className="section-title">Categories</h2>
        <IonGrid className="categories-grid">
          <IonRow>
            {categories.map((cat, index) => (
              <IonCol size="6" size-md="3" key={index} className="category-col" onClick={() => goToCategory(cat.name)}>
                <div className="category-item ion-activatable">
                  <div className="category-icon-container">
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      className="category-icon"
                    />
                  </div>
                  <div className="category-name">{cat.name}</div>
                  <IonRippleEffect />
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <h2 className="section-title">Top Rated</h2>
        <div className="card-container">
          {topRated.map((item, index) => (
            <IonCard key={index} className="business-card">
              <IonCardHeader>
                <IonCardTitle className="card-title">{item.name}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="card-content">
                  <div className="card-description">{item.description}</div>
                  <div className="card-rating">⭐ {item.rating}</div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <h2 className="section-title">Most Searched</h2>
        <div className="card-container">
          {mostSearched.map((item, index) => (
            <IonCard key={index} className="business-card">
              <IonCardHeader>
                <IonCardTitle className="card-title">{item.name}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="card-content">
                  <div className="card-search-count">🔍 {item.searchCount} searches</div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>

      <IonFooter>
        <IonToolbar className="bottom-tabs">
          <IonSegment value={activeTab} onIonChange={e => setActiveTab(e.detail.value as string)}>
            <IonSegmentButton value="explore" className="tab-button">
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
    </IonPage>
  );
};

export default Home;