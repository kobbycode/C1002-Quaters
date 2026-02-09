import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center: [number, number]; // [lat, lng]
    zoom?: number;
    title?: string;
    address?: string;
    className?: string;
}

// Component to handle recentering if coordinates change
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const CustomMap: React.FC<MapProps> = ({
    center,
    zoom = 15,
    title = "C1002 Quarters",
    address = "Spintex, Accra",
    className = "h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100"
}) => {
    return (
        <div className={className}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <ChangeView center={center} zoom={zoom} />
                <Marker position={center}>
                    <Popup className="luxury-popup">
                        <div className="p-2">
                            <h4 className="font-serif font-black text-charcoal text-sm mb-1">{title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{address}</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
            <style>{`
                .leaflet-container {
                    background: #f8f9fa;
                }
                .luxury-popup .leaflet-popup-content-wrapper {
                    border-radius: 1rem;
                    border: 1px solid rgba(139, 0, 139, 0.1);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .luxury-popup .leaflet-popup-tip {
                    background: white;
                }
                .luxury-popup .leaflet-popup-content {
                    margin: 8px;
                }
            `}</style>
        </div>
    );
};

export default CustomMap;
