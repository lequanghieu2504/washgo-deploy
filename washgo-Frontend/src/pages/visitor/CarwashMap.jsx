import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  CircleMarker,
} from "react-leaflet";
import { useTranslation } from "react-i18next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import BottomSheet from "@/components/ui/BottomSheet";
import CarwashDetail from "@/pages/visitor/CarwashDetail";
import { useLocation } from "@/hooks/useLocation";
import LocationControl from "@/components/common/LocationControl";
import { useFilterCarwash } from "@/hooks/useFilterCarwash";
import { useNearbyPublicCarwashes } from "@/hooks/useNearbyPublicCarwashes";
import { useShowGlobalFilterState } from "@/hooks/useShowGlobalFilterState";
import {
  useControlBottomSheet,
  SHEET_HEIGHTS,
} from "@/hooks/useControlBottomSheet";
import MyLocationButton from "@/components/common/MyLocationButton";
import PublicCarwashDetail from "@/pages/visitor/PuplicCarwashDetail";
import SearchResultList from "@/pages/visitor/SearchResultList";
import { useCarwashRouteToMap } from "@/hooks/useCarwashRouteToMap";
import { set } from "date-fns";

delete L.Icon.Default.prototype._getIconUrl;

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// New highlighted icon
const highlightedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [30, 50], // bigger size
  iconAnchor: [15, 50],
  popupAnchor: [1, -40],
  shadowSize: [50, 50],
});

function CarwashMap() {
  const { t } = useTranslation();
  const [selectedCarwash, setSelectedCarwash] = useState(null);
  const [selectedPublicCarwash, setSelectedPublicCarwash] = useState(null);
  const [filteredListCarwash, setFilteredListCarwash] = useState([]);
  const bottomSheetContainerRef = useRef(null);
  const mapRef = useRef();

  const {
    latitude,
    longitude,
    requestLocationChange,
    clearLocationChangeRequest,
  } = useLocation();
  const currentUserLocation = useMemo(
    () => [latitude, longitude],
    [latitude, longitude]
  );

  const { closeAll, showFilter } = useShowGlobalFilterState();
  const { sheetHeight, sheetTop, setSheetHeight, isDragging } =
    useControlBottomSheet();

  const {
    carwashList: filteredCarwash,
    isLoading: isFilterLoading,
    applyFilters,
  } = useFilterCarwash();

  const { routeCarwash, clearCarwashForMap } = useCarwashRouteToMap();

  const { data: publicCarwashes } = useNearbyPublicCarwashes({
    latitude: currentUserLocation[0],
    longitude: currentUserLocation[1],
  });

  useEffect(() => {
    if (showFilter) {
      console.log("showFilter is true, cleared location change request");

      clearLocationChangeRequest();
    }
  }, [showFilter]);

  useEffect(() => {
    if (mapRef.current && currentUserLocation) {
      mapRef.current.setView(currentUserLocation, 12);
    }
    applyFilters({
      latitude: currentUserLocation[0],
      longitude: currentUserLocation[1],
    });
  }, [latitude, longitude]);

  const centerIfBelowHalf = useCallback((lat, lon) => {
    const map = mapRef.current;
    if (!map) return;
    const latlng = L.latLng(lat, lon);
    const pt = map.latLngToContainerPoint(latlng);
    const height = map.getSize().y;
    if (pt.y > height * 0.5) {
      map.panTo(latlng, { animate: true });
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isFilterLoading) return;

    if (routeCarwash) {
      setSelectedCarwash(routeCarwash);
      setSheetHeight(SHEET_HEIGHTS.MID);
      const lat = parseFloat(routeCarwash.latitude);
      const lon = parseFloat(routeCarwash.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        map.setView([lat, lon], 15, { animate: true });
      }
    } else if (filteredCarwash && filteredCarwash.length === 1) {
      setSelectedCarwash(filteredCarwash[0]);
      setSheetHeight(SHEET_HEIGHTS.MID);
      const carwash = filteredCarwash[0];
      const lat = parseFloat(carwash.latitude);
      const lon = parseFloat(carwash.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        map.setView([lat, lon], 15, { animate: true });
      }
    } else if (filteredCarwash && filteredCarwash.length > 1) {
      setSelectedCarwash(null);
      setFilteredListCarwash(filteredCarwash);
      const bounds = L.latLngBounds();
      filteredCarwash.forEach((cw) => {
        const lat = parseFloat(cw.latitude);
        const lon = parseFloat(cw.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          bounds.extend([lat, lon]);
        }
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    } else {
      setSelectedCarwash(null);
      setFilteredListCarwash([]);
      setSheetHeight(SHEET_HEIGHTS.HIDE);
    }
  }, [filteredCarwash, isFilterLoading, routeCarwash, mapRef.current]);

  useEffect(() => {
    return () => {
      setSheetHeight(SHEET_HEIGHTS.HIDE);
      setSelectedCarwash(null);
      setSelectedPublicCarwash(null);
      setFilteredListCarwash([]);
      closeAll();
    };
  }, [setSheetHeight]);

  const buttonBottom = useMemo(() => {
    if (sheetHeight === SHEET_HEIGHTS.HIDE) {
      return 24;
    }
    const sheetVisibleHeight = sheetTop;
    return sheetVisibleHeight + 16;
  }, [sheetHeight, sheetTop]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        ref={mapRef}
        center={currentUserLocation}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        {currentUserLocation && (
          <>
            <CircleMarker
              center={currentUserLocation}
              radius={8}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#2563eb",
                fillOpacity: 1,
                weight: 2,
              }}
            />
            <Circle
              center={currentUserLocation}
              radius={2000}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#60a5fa",
                fillOpacity: 0.2,
              }}
            />
          </>
        )}

        {/* Carwashes */}
        {Array.isArray(filteredCarwash) &&
          filteredCarwash.map((carwash) => {
            const lat = parseFloat(carwash.latitude);
            const lon = parseFloat(carwash.longitude);

            if (!isNaN(lat) && !isNaN(lon)) {
              return (
                <Marker
                  key={carwash.id}
                  position={[lat, lon]}
                  icon={
                    selectedCarwash && selectedCarwash.id === carwash.id
                      ? highlightedIcon
                      : redIcon
                  }
                  eventHandlers={{
                    click: () => {
                      setSelectedCarwash(carwash);
                      setSheetHeight(SHEET_HEIGHTS.MID);
                      setSelectedPublicCarwash(null);
                      centerIfBelowHalf(lat, lon);
                    },
                  }}
                />
              );
            }
            return null;
          })}

        {/* Public carwashes */}
        {Array.isArray(publicCarwashes) &&
          publicCarwashes.map((carwash) => {
            const lat = parseFloat(carwash.latitude);
            const lon = parseFloat(carwash.longitude);

            if (!isNaN(lat) && !isNaN(lon)) {
              return (
                <Marker
                  key={carwash.id}
                  position={[lat, lon]}
                  icon={
                    selectedPublicCarwash &&
                    selectedPublicCarwash.id === carwash.id
                      ? highlightedIcon
                      : greyIcon
                  }
                  eventHandlers={{
                    click: () => {
                      setSelectedPublicCarwash(carwash);
                      setSheetHeight(SHEET_HEIGHTS.MID);
                      setSelectedCarwash(null);
                      centerIfBelowHalf(lat, lon);
                    },
                  }}
                />
              );
            }
            return null;
          })}
      </MapContainer>

      <LocationControl mapRef={mapRef} />

      {/* My Location Button */}
      <div
        className={`absolute right-4 z-[1000] ${
          !isDragging ? "transition-all duration-300" : ""
        }`}
        style={{ bottom: `${buttonBottom}px` }}
      >
        <MyLocationButton
          mapRef={mapRef}
          location={currentUserLocation}
          onLongPress={() => requestLocationChange()}
        />
      </div>

      {/* Bottom Sheet */}
      <div
        ref={bottomSheetContainerRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        <BottomSheet
          onClose={() => {
            setSheetHeight(SHEET_HEIGHTS.HIDE);
            setSelectedCarwash(null);
            setSelectedPublicCarwash(null);
            setFilteredListCarwash([]);
            clearCarwashForMap();
            applyFilters({ carwashName: "" });
            closeAll();
          }}
        >
          {selectedCarwash ? (
            <CarwashDetail carwash={selectedCarwash} />
          ) : selectedPublicCarwash ? (
            <PublicCarwashDetail
              lat={selectedPublicCarwash.latitude}
              lon={selectedPublicCarwash.longitude}
            />
          ) : filteredListCarwash.length > 1 ? (
            <SearchResultList
              results={filteredListCarwash}
              onResultClick={(id) => {
                setSelectedCarwash(id);
              }}
            />
          ) : null}
        </BottomSheet>
      </div>
    </div>
  );
}

export default CarwashMap;
