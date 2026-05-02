const fs = require('fs');
let s = fs.readFileSync('src/pages/AcademyHome.tsx', 'utf8');

const t = `        )}
      </section>
    </div>
  );
}`;

const r = `        )}
      </section>

      {/* Community Tracks Section */}
      <section>
        <SectionHeader 
          title="Community Extensions" 
          subtitle="Additional topics curated by the DSUC community." 
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={\`comm-skel-\${index}\`} className="h-48 animate-pulse bg-surface border border-border-main" />
            ))}
          </div>
        ) : communityTracks.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border-main border-dashed font-mono text-sm text-text-muted">
            No community tracks available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityTracks.map((track) => (
              <Link
                key={track.id}
                to={\`/academy/community/\${track.id}\`}
                className="group flex flex-col bg-surface border border-border-main p-6 text-left transition-all hover:border-primary focus:outline-none"
              >
                <div className="flex items-start justify-between gap-4 mb-4 border-b border-border-main pb-4">
                  <StatusBadge status="Community" className="bg-main-bg" />
                  <Boxes className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                
                <h3 className="font-heading text-lg font-bold mb-3 uppercase tracking-tight group-hover:text-primary transition-colors">
                  {track.title}
                </h3>
                
                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed mb-6 flex-1 font-mono">
                  {track.subtitle || track.description || 'Community contributed curriculum.'}
                </p>

                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border-main">
                  <div className="flex gap-3 items-center font-mono text-[10px] text-text-muted uppercase">
                    <span>{track.lesson_count} Lessons</span>
                    <span>•</span>
                    <span>~\${Math.max(1, Math.round(track.total_minutes / 60))} hr</span>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}`;

s = s.replace(t, r);
fs.writeFileSync('src/pages/AcademyHome.tsx', s);
