// MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// Fix missing marker icons (optional but often needed)
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const MapView = ({ complaints }) => {
  //   console.log(complaints[0].location.coordinates)
  const location = complaints[0].location.coordinates;
  const position = [location.latitude, location.longitude];
  const [pointMap, setPointMap] = useState("");

  useEffect(() => {
    let point = sessionStorage.getItem("adminName");
    // console.log(JSON.parse(point));
    const adminData = JSON.parse(point);
    setPointMap(adminData.municipality);
  }, []);

  return (
    <div className="h-[60vh] p-7">
      <MapContainer
        center={position}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>{pointMap}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
