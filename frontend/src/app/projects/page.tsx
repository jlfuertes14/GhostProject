import { fetchProjects, fetchAnalytics, fetchFilterOptions } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react";
import ProjectFilters from "@/components/ProjectFilters";

function getPaginationRange(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({length: totalPages}, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
  if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string, search?: string, status?: string, region?: string, province?: string, municipality?: string, office?: string, sort?: string, order?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "";
  const region = resolvedParams.region || "";
  const province = resolvedParams.province || "";
  const municipality = resolvedParams.municipality || "";
  const office = resolvedParams.office || "";
  const sort = resolvedParams.sort || "";
  const order = resolvedParams.order || "desc";
  
  const limit = 15;
  const skip = (page - 1) * limit;
  
  const [projects, analytics, filterOptions] = await Promise.all([
    fetchProjects(skip, limit, search, status, region, province, municipality, office, sort, order),
    fetchAnalytics(),
    fetchFilterOptions()
  ]);

  const totalProjects = analytics?.total_projects || 0;
  const totalPages = Math.max(1, Math.ceil(totalProjects / limit));
  const pages = getPaginationRange(page, totalPages);
  
  const startItem = totalProjects > 0 ? skip + 1 : 0;
  const endItem = Math.min(skip + limit, totalProjects);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Database</h1>
        <p className="text-slate-500 mt-1">Browse all infrastructure projects across regions.</p>
      </header>

      <ProjectFilters options={filterOptions} />

      {/* Main Grid */}
      <main className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden stagger-enter">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Province</th>
                <th className="px-6 py-4">
                  <Link 
                    href={`/projects?page=1${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${region ? `&region=${region}` : ''}${province ? `&province=${province}` : ''}${municipality ? `&municipality=${municipality}` : ''}${office ? `&office=${office}` : ''}&sort=budget&order=${order === 'desc' ? 'asc' : 'desc'}`} 
                    className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                    Budget <ArrowUpDown className="w-3.5 h-3.5" />
                  </Link>
                </th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.length > 0 ? projects.map((p: any, idx: number) => {
                const budgetRaw = p.ApprovedBudgetForContract;
                const budgetNum = typeof budgetRaw === 'string' ? parseFloat(budgetRaw.replace(/,/g, '')) : (budgetRaw || 0);

                return (
                <tr key={`${p.ContractId || p.ProjectId || 'proj'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{p.ContractId || p.ProjectId || "UNK"}</td>
                  <td className="px-6 py-4 text-slate-600">{p.Region}</td>
                  <td className="px-6 py-4 text-slate-600">{p.Province}</td>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No data available or API offline.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <Link 
              href={`/projects?page=${page > 1 ? page - 1 : 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${region ? `&region=${region}` : ''}${province ? `&province=${province}` : ''}${municipality ? `&municipality=${municipality}` : ''}${office ? `&office=${office}` : ''}${sort ? `&sort=${sort}` : ''}${order ? `&order=${order}` : ''}`} 
              className={`flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Link>
            
            <div className="hidden sm:flex items-center gap-1.5">
              {pages.map((p, i) => (
                p === '...' ? (
                  <span key={`dots-${i}`} className="flex items-center justify-center px-2 py-2 text-slate-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                ) : (
                  <Link 
                    key={p} 
                    href={`/projects?page=${p}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${region ? `&region=${region}` : ''}${province ? `&province=${province}` : ''}${municipality ? `&municipality=${municipality}` : ''}${office ? `&office=${office}` : ''}${sort ? `&sort=${sort}` : ''}${order ? `&order=${order}` : ''}`} 
                    className={`flex items-center justify-center min-w-[36px] h-9 px-3 border rounded-md text-sm font-medium transition-colors ${
                      page === p 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </Link>
                )
              ))}
            </div>

            <Link 
              href={`/projects?page=${page < totalPages ? page + 1 : totalPages}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${region ? `&region=${region}` : ''}${province ? `&province=${province}` : ''}${municipality ? `&municipality=${municipality}` : ''}${office ? `&office=${office}` : ''}${sort ? `&sort=${sort}` : ''}${order ? `&order=${order}` : ''}`} 
              className={`flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
