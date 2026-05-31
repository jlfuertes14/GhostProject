import { fetchProjects } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import MapFilters from "@/components/MapFilters";

export const dynamic = "force-dynamic";

export default async function MapPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const region = searchParams?.region || "";
  const province = searchParams?.province || "";
  const municipality = searchParams?.municipality || "";
  
  // Fetch a larger limit for the map view to show all dots, optionally filtered by region/province/muni
  const projects = await fetchProjects(0, 10000, "", "all", region, province, municipality);

  const ghostCount = projects.filter(p => !p.ActualCompletionDate).length;

  const locationParts = [municipality, province, region].filter(Boolean);
  const locationText = locationParts.length > 0 ? `in ${locationParts.join(", ")}` : "nationwide";

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-slate-200 p-4 sm:px-6 flex items-center justify-between shrink-0 z-10 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Nationwide Watch Map
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Tracking {projects.length} recent projects {locationText}.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <MapFilters />
          <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-[#0047AB]">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Active Anomalies</span>
            </div>
            <div className="text-2xl font-black text-[#0047AB]">{ghostCount}</div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative z-0">
        <MapWrapper projects={projects} />
      </main>
    </div>
  );
}
