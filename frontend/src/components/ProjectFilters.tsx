"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Combobox } from "./Combobox";
import { fetchFilterOptions } from "@/lib/api";

interface FilterOptions {
  regions?: string[];
  provinces?: string[];
  municipalities?: string[];
  offices?: string[];
}

export default function ProjectFilters({ options }: { options?: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [province, setProvince] = useState(searchParams.get("province") || "");
  const [municipality, setMunicipality] = useState(searchParams.get("municipality") || "");
  const [office, setOffice] = useState(searchParams.get("office") || "");

  const [dynamicOptions, setDynamicOptions] = useState<FilterOptions | undefined>(options);

  // Fetch new options when region or province changes for cascading
  useEffect(() => {
    let active = true;
    fetchFilterOptions(region, province, municipality).then((newOptions) => {
      if (active) setDynamicOptions(newOptions);
    });
    return () => { active = false; };
  }, [region, province, municipality]);

  // Automatically trigger search when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(status, search, region, province, municipality, office);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, region, province, municipality, office]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(status, search, region, province, municipality, office);
  };

  const updateUrl = (
    newStatus: string, 
    newSearch: string, 
    newRegion: string, 
    newProvince: string, 
    newMunicipality: string, 
    newOffice: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter
    
    if (newSearch.trim()) params.set("search", newSearch.trim());
    else params.delete("search");

    if (newStatus && newStatus !== "all") params.set("status", newStatus);
    else params.delete("status");

    if (newRegion.trim()) params.set("region", newRegion.trim());
    else params.delete("region");

    if (newProvince.trim()) params.set("province", newProvince.trim());
    else params.delete("province");

    if (newMunicipality.trim()) params.set("municipality", newMunicipality.trim());
    else params.delete("municipality");

    if (newOffice.trim()) params.set("office", newOffice.trim());
    else params.delete("office");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, contractor, ID, or province..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active (Ghost Watch)</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Region</label>
          <Combobox
            options={dynamicOptions?.regions || []}
            value={region}
            onChange={(val) => {
              setRegion(val);
              // Clear child filters if parent changes
              if (val !== region) {
                setProvince("");
                setMunicipality("");
                setOffice("");
              }
            }}
            placeholder="Type or select region"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Province</label>
          <Combobox
            options={dynamicOptions?.provinces || []}
            value={province}
            onChange={(val) => {
              setProvince(val);
              if (val !== province) {
                setMunicipality("");
                setOffice("");
              }
            }}
            placeholder="Type or select province"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Municipality</label>
          <Combobox
            options={dynamicOptions?.municipalities || []}
            value={municipality}
            onChange={(val) => {
              setMunicipality(val);
              if (val !== municipality) {
                setOffice("");
              }
            }}
            placeholder="Type or select municipality"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Implementing Office</label>
          <Combobox
            options={dynamicOptions?.offices || []}
            value={office}
            onChange={setOffice}
            placeholder="Type or select office"
          />
        </div>
      </div>
    </div>
  );
}
