"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Project } from "@/lib/api";

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapViewer({ projects }: { projects: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-500 animate-pulse">Initializing Map...</div>;

  // Center on Philippines
  const center: [number, number] = [12.8797, 121.7740];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {projects.map((p, idx) => {
          if (!p.ProjectLatitude || !p.ProjectLongitude) return null;
          
          const lat = parseFloat(p.ProjectLatitude);
          const lng = parseFloat(p.ProjectLongitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          // Logic for a "Ghost Project" (Active & potentially delayed)
          const isCompleted = !!p.ActualCompletionDate;
          const isGhost = !isCompleted; 

          const color = isGhost ? "#0047AB" : "#3B82F6"; // Royal Blue for ghost, Sky Blue for completed
          
          return (
            <CircleMarker 
              key={`${p.ContractId || p.ProjectId || 'proj'}-${idx}`}
              center={[lat, lng]}
              radius={isGhost ? 10 : 7}
              pathOptions={{ 
                color: "#FFFFFF", 
                fillColor: color, 
                fillOpacity: isGhost ? 0.9 : 0.6,
                weight: 2
              }}
            >
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-slate-900 mb-1 leading-tight">{p.ProjectName}</h3>
                  <div className="text-sm text-slate-600 mb-2">{p.Region} - {p.Province}</div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Contractor:</span>
                      <span className="font-medium text-slate-900 text-right max-w-[120px] truncate" title={p.Contractor}>{p.Contractor}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Budget:</span>
                      <span className="font-medium text-slate-900">₱{(parseFloat(p.ApprovedBudgetForContract.toString().replace(/,/g, '')) / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Status:</span>
                      {isCompleted ? (
                        <span className="font-bold text-slate-500">Completed</span>
                      ) : (
                        <span className="font-bold text-[#0047AB] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0047AB] animate-pulse"></span>
                          Ghost Watch
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  );
}
