"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Combobox } from "./Combobox";
import { fetchFilterOptions } from "@/lib/api";

interface FilterOptions {
  regions?: string[];
  provinces?: string[];
  municipalities?: string[];
}

export default function MapFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentRegion = searchParams.get("region") || "";
  const currentProvince = searchParams.get("province") || "";
  const currentMunicipality = searchParams.get("municipality") || "";

  const [region, setRegion] = useState(currentRegion);
  const [province, setProvince] = useState(currentProvince);
  const [municipality, setMunicipality] = useState(currentMunicipality);

  const [options, setOptions] = useState<FilterOptions>({});

  // Fetch new options when region or province changes for cascading
  useEffect(() => {
    let active = true;
    fetchFilterOptions(region, province, municipality).then((newOptions) => {
      if (active) setOptions(newOptions);
    });
    return () => { active = false; };
  }, [region, province, municipality]);

  // Update URL whenever local state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (region) params.set("region", region);
    else params.delete("region");
    
    if (province) params.set("province", province);
    else params.delete("province");
    
    if (municipality) params.set("municipality", municipality);
    else params.delete("municipality");
    
    // We add { scroll: false } so the map doesn't jump
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [region, province, municipality, pathname, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-48">
        <Combobox
          options={options.regions || []}
          value={region}
          onChange={(val) => {
            setRegion(val);
            if (val !== region) {
              setProvince("");
              setMunicipality("");
            }
          }}
          placeholder="Region"
        />
      </div>
      <div className="w-48">
        <Combobox
          options={options.provinces || []}
          value={province}
          onChange={(val) => {
            setProvince(val);
            if (val !== province) {
              setMunicipality("");
            }
          }}
          placeholder="Province"
        />
      </div>
      <div className="w-48">
        <Combobox
          options={options.municipalities || []}
          value={municipality}
          onChange={setMunicipality}
          placeholder="Municipality"
        />
      </div>
    </div>
  );
}
