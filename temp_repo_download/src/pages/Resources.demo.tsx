import React, { useEffect, useState } from "react";
import {
  FileText,
  Folder,
  Link as LinkIcon,
  Video,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  SectionHeader,
  SoftBrutalCard,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useStore } from "@/store/useStore";
import { mockResources } from "@/lib/mockData";

export function Resources() {
  const { resources, fetchResources } = useStore();
  const [data, setData] = useState<any[]>(mockResources as any[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    fetchResources().catch(() => {});
  }, [fetchResources]);

  useEffect(() => {
    if (resources && resources.length > 0) {
      setData(resources);
    }
  }, [resources]);

  const categories = [
    "All",
    ...Array.from(new Set(data.map((r) => r.category || "General"))),
  ];

  const filteredResources = data.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "Doc":
      case "Document":
        return <FileText className="w-6 h-6 text-primary" />;
      case "Drive":
        return <Folder className="w-6 h-6 text-blue-500" />;
      case "Video":
        return <Video className="w-6 h-6 text-red-500" />;
      default:
        return <LinkIcon className="w-6 h-6 text-emerald-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <SectionHeader
        title="Resources"
        subtitle="Documentation, guides, and tools for the community."
      />

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest  transition-colors ${activeCategory === c ? "bg-primary text-main-bg font-bold" : "bg-surface hover:bg-main-bg text-text-muted hover:text-text-main"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border-border-main p-2 pl-9 font-mono text-xs focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <SoftBrutalCard
            key={resource.id}
            className="flex flex-col h-full group hover:bg-main-bg cursor-pointer transition-colors p-6"
            onClick={() => window.open(resource.url, "_blank")}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-surface border border-border-main group-hover:bg-primary/10 transition-colors">
                {getIcon(resource.type)}
              </div>
              {resource.type && (
                <StatusBadge
                  status={resource.type}
                  className="bg-surface group-hover:bg-main-bg"
                />
              )}
            </div>

            <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors">
              {resource.title || resource.name}
            </h3>
            <p className="text-sm text-text-muted mb-6 flex-grow">
              {resource.description}
            </p>

            <div className="flex items-center justify-between  pt-4 mt-auto">
              <div className="flex flex-wrap gap-1">
                {resource.tags?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono uppercase bg-surface px-1.5 py-0.5 border border-border-main text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </SoftBrutalCard>
        ))}
        {filteredResources.length === 0 && (
          <div className="col-span-full p-12 text-center  border-2 border-border-main text-text-muted font-mono text-xs uppercase">
            No resources found.
          </div>
        )}
      </div>
    </div>
  );
}
