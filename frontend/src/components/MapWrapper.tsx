"use client";

import dynamic from "next/dynamic";

const MapViewer = dynamic(() => import("@/components/MapViewer"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-50 animate-pulse text-slate-400">Loading Map Engine...</div>
});

export default function MapWrapper({ projects }: { projects: any[] }) {
  return <MapViewer projects={projects} />;
}
