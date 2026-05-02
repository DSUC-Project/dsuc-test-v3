const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const sectionsHTML = `
        {/* Academy Section */}
        <section>
          <SectionHeader title="Academy Architecture" subtitle="Learn the stack" number="01" showNumber />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredUnits.map(unit => (
              <SoftBrutalCard key={unit.id} className="flex flex-col min-h-[220px]">
                 <div className="flex-1">
                   <h3 className="font-heading font-bold text-xl uppercase mb-3 text-text-main">{unit.title}</h3>
                   <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">{unit.description}</p>
                 </div>
                 <Link to={'/academy'} className="mt-auto inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 group">
                   Initialize Module 
                   <span className="transform group-hover:translate-x-1 transition-transform ml-1">-&gt;</span>
                 </Link>
              </SoftBrutalCard>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section>
          <SectionHeader title="Active Builders" subtitle="The human nodes" number="02" showNumber />
          <div className="flex flex-wrap gap-4">
            {recentMembers.map(m => (
              <Link to={\`/members/\${m.id}\`} key={m.id} className="group border border-border-main p-1.5 pr-6 bg-white shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md transition-all w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(25%-12px)]">
                <img src={m.avatarUrl || 'https://via.placeholder.com/40'} alt={m.displayName} className="w-12 h-12 object-cover grayscale group-hover:grayscale-0 transition-all border border-border-main bg-gray-100" />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase truncate text-text-main">{m.displayName}</div>
                  <div className="text-[10px] font-mono text-gray-500 truncate mt-0.5">{m.role || 'Member'}</div>
                </div>
              </Link>
            ))}
            <div className="w-full mt-4">
              <Link to="/members" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-text-main">
                View Network Topology -&gt;
              </Link>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section>
          <SectionHeader title="System Events" subtitle="Incoming transmissions" number="03" showNumber />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentEvents.map(event => (
              <div key={event.id} className="border border-border-main bg-[#0f172a] text-white p-6 relative overflow-hidden group hover:-translate-y-1 transition-all shadow-sm flex flex-col">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Incoming</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl uppercase mb-2 truncate" title={event.title}>{event.title}</h3>
                  <div className="text-xs font-mono text-gray-400 mb-6 flex flex-col gap-1.5">
                    <p>DATE: {event.date}</p>
                    <p>TIME: {event.time || 'TBA'}</p>
                  </div>
                </div>
                <Link to={\`/events/\${event.id}\`} className="mt-auto border border-gray-700 hover:border-gray-500 bg-gray-800/50 py-2 px-4 text-center text-xs font-bold uppercase tracking-widest transition-colors">
                   Acknowledge
                </Link>
              </div>
            ))}
          </div>
        </section>
`;

c = c.replace(/\{\/\* Removed Academy\/Community\/Recent Events sections \*\/\}/, sectionsHTML);

fs.writeFileSync('src/pages/Home.tsx', c);
