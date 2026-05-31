import { fetchAnalytics, fetchProjects } from "@/lib/api";
import Link from "next/link";
import { Activity, Database, FileSpreadsheet, MapPin } from "lucide-react";

export default async function Dashboard() {
  const analytics = await fetchAnalytics();
  const projects = await fetchProjects(0, 10);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Real-time metrics for DPWH flood control infrastructure.</p>
      </header>

      {/* KPI Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPIBox title="Total Projects" value={analytics?.total_projects || "ERR"} icon={<Database className="w-5 h-5 text-slate-400" />} delayClass="stagger-delay-1" />
        <KPIBox 
          title="Total Budget" 
          value={analytics ? `₱${(analytics.total_budget / 1000000000).toFixed(2)}B` : "ERR"} 
          icon={<FileSpreadsheet className="w-5 h-5 text-slate-400" />} 
          delayClass="stagger-delay-2"
        />
        <KPIBox 
          title="Top Province" 
          value={analytics?.top_provinces?.[0]?.province || "ERR"} 
          icon={<MapPin className="w-5 h-5 text-blue-500" />} 
          delayClass="stagger-delay-3"
        />
        <Link href="/predict" className="stagger-enter stagger-delay-4 pressable bg-[#0047AB] rounded-xl p-6 flex flex-col justify-between hover:bg-[#0035c4] text-white shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium opacity-90">Quick Action</span>
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold mt-4">
            Run AI Model
          </div>
        </Link>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Projects Table */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stagger-enter stagger-delay-3">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Active Projects</h2>
            <Link href="/projects" className="text-sm text-[#0047AB] hover:text-[#0035c4] font-medium pressable inline-block">
              View All &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Project ID / Location</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.length > 0 ? projects.map((p: any, idx: number) => {
                  const budgetRaw = p.ApprovedBudgetForContract;
                  const budgetNum = typeof budgetRaw === 'string' ? parseFloat(budgetRaw.replace(/,/g, '')) : (budgetRaw || 0);

                  return (
                    <tr key={p.ContractId || p.ProjectId || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{p.ContractId || p.ProjectId || "UNK"}</div>
                        <div className="text-xs text-slate-500 mt-1">{p.Region} &bull; {p.Province}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">₱{(budgetNum / 1000000).toFixed(2)}M</td>
                      <td className="px-6 py-4">
                        {p.ActualCompletionDate ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-[#0047AB]">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No active projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Sidebar Widgets */}
        <section className="lg:col-span-1 space-y-6 stagger-enter stagger-delay-4">
          
          {/* Regional Distribution Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Regional Distribution</h3>
            <div className="space-y-4">
              {analytics?.top_provinces?.slice(0, 5).map((p: any, i: number) => (
                <div key={p.province} className="flex justify-between items-center">
                  <span className="text-sm text-slate-700 font-medium">{p.province}</span>
                  <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">{p.count}</span>
                </div>
              )) || (
                <div className="text-sm text-slate-500">Data unavailable</div>
              )}
            </div>
          </div>
          
          {/* Top Contractors Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Top Contractors</h3>
            <div className="space-y-4">
              {analytics?.top_contractors?.slice(0, 5).map((c: any, i: number) => (
                <div key={c.contractor} className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-700 font-medium line-clamp-1 pr-2" title={c.contractor}>{c.contractor}</span>
                    <span className="text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded-md shrink-0">{c.count}</span>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-slate-500">Data unavailable</div>
              )}
            </div>
          </div>

          {/* System Alert Widget */}
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
            <h3 className="text-sm font-bold text-red-800 mb-2">System Alert</h3>
            <p className="text-sm text-red-600 leading-relaxed">
              Predictive models indicate a high probability of timeline overruns in Northern regions due to seasonal weather patterns.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

function KPIBox({ title, value, icon, delayClass = "" }: { title: string, value: string | number, icon: React.ReactNode, delayClass?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between stagger-enter ${delayClass}`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-slate-900 tracking-tight mt-4">
        {value}
      </div>
    </div>
  );
}
