"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Crosshair, AlertTriangle, Activity } from "lucide-react";
import { predictProject, PredictionResult, fetchFilterOptions } from "@/lib/api";
import { Combobox } from "@/components/Combobox";

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<any>(null);

  const [formData, setFormData] = useState({
    region: "Region I",
    province: "Ilocos Norte",
    municipality: "Laoag City",
    contract_cost: 50000000,
    approved_budget: 52000000,
    target_duration: 120,
    implementing_office: "DPWH - Ilocos Norte 1st DEO",
  });

  useEffect(() => {
    let active = true;
    fetchFilterOptions(formData.region, formData.province, formData.municipality).then((newOptions) => {
      if (active) setOptions(newOptions);
    });
    return () => { active = false; };
  }, [formData.region, formData.province, formData.municipality]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await predictProject(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to run prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("cost") || name.includes("budget") || name.includes("duration") ? Number(value) : value,
    }));
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full stagger-enter" suppressHydrationWarning>
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Prediction Engine</h1>
        <p className="text-slate-500 mt-1">Estimate project delays and cost overruns using historical infrastructure telemetry.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Form */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Input Parameters</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</label>
                <Combobox
                  options={options?.regions || []}
                  value={formData.region}
                  onChange={(val) => {
                    setFormData((prev) => ({ 
                      ...prev, 
                      region: val,
                      province: val !== prev.region ? "" : prev.province,
                      municipality: val !== prev.region ? "" : prev.municipality,
                      implementing_office: val !== prev.region ? "" : prev.implementing_office
                    }));
                  }}
                  name="region"
                  placeholder="Type or select region"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Province</label>
                <Combobox
                  options={options?.provinces || []}
                  value={formData.province}
                  onChange={(val) => {
                    setFormData((prev) => ({ 
                      ...prev, 
                      province: val,
                      municipality: val !== prev.province ? "" : prev.municipality,
                      implementing_office: val !== prev.province ? "" : prev.implementing_office
                    }));
                  }}
                  name="province"
                  placeholder="Type or select province"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Municipality</label>
              <Combobox
                options={options?.municipalities || []}
                value={formData.municipality}
                onChange={(val) => {
                  setFormData((prev) => ({ 
                    ...prev, 
                    municipality: val,
                    implementing_office: val !== prev.municipality ? "" : prev.implementing_office
                  }));
                }}
                name="municipality"
                placeholder="Type or select municipality"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Implementing Office</label>
              <Combobox
                options={options?.offices || []}
                value={formData.implementing_office}
                onChange={(val) => {
                  setFormData((prev) => ({ ...prev, implementing_office: val }));
                }}
                name="implementing_office"
                placeholder="Type or select office"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contract Cost (PHP)</label>
                <input required type="number" name="contract_cost" value={formData.contract_cost} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all text-slate-800 font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Budget (PHP)</label>
                <input required type="number" name="approved_budget" value={formData.approved_budget} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all text-slate-800 font-medium" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Duration (Days)</label>
              <input required type="number" name="target_duration" value={formData.target_duration} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all text-slate-800 font-medium" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-[#0047AB] text-white font-bold text-base rounded-lg p-3.5 hover:bg-[#0035c4] pressable disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Processing...
                </>
              ) : "Run Model"}
            </button>
          </form>
        </section>

        {/* Output Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Prediction Output</h2>
          </div>

          <div className="flex-1 flex flex-col justify-center p-8 relative">
            {!result && !error && !loading && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-500">Ready for Input</h3>
                <p className="text-sm text-slate-400 mt-1">Enter project details and click "Run Model" to generate a prediction.</p>
              </div>
            )}

            {loading && (
              <div className="text-center stagger-enter">
                <span className="w-12 h-12 border-4 border-slate-200 border-t-[#0047AB] rounded-full animate-spin inline-block mb-4" />
                <div className="text-[#0047AB] font-bold">Calculating vectors...</div>
                <div className="text-slate-400 text-sm mt-1">Running XGBoost inference model</div>
              </div>
            )}

            {error && (
              <div className="text-center text-red-600 flex flex-col items-center gap-3 stagger-enter">
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <span className="font-semibold">Error: {error}</span>
              </div>
            )}

            {result && (
              <div className="w-full space-y-8 stagger-enter">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Predicted Delay</h3>
                  <div className={`text-5xl font-black tracking-tight ${result.delay_days > 30 ? 'text-red-600' : 'text-slate-900'}`}>
                    {Math.round(result.delay_days)} <span className="text-xl font-bold opacity-70">Days</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Projected Final Budget</h3>
                  <div className="text-4xl font-black tracking-tight text-slate-900">
                    ₱{(result.projected_budget / 1000000).toFixed(2)}<span className="text-xl opacity-70">M</span>
                  </div>
                  <div className="text-sm font-medium text-slate-500 mt-2">
                    Variance: ₱{((result.projected_budget - formData.contract_cost) / 1000000).toFixed(2)}M
                  </div>
                </div>

                {result.cost_overrun_risk && (
                  <div className="border border-red-200 bg-red-50 p-5 rounded-xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800">High Overrun Risk</h4>
                      <p className="text-sm text-red-600 mt-1 leading-relaxed">
                        Based on historical telemetry, this project configuration has a significant risk of exceeding its approved budget and timeline constraints.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
