import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ActionButton } from '@/components/ui/Primitives';

export function AcademyUnit() {
  const { courseId, unitId } = useParams();

  // Code Workspace Shell layout
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col font-sans bg-main-bg">
      {/* Top Bar */}
      <div className="h-14 border-b brutal-border bg-surface flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/academy/course/${courseId || '1'}`} className="font-mono text-xs uppercase hover:text-primary">&larr; Exit</Link>
          <div className="w-px h-4 bg-border-main" />
          <h1 className="font-bold text-sm">Build Your First PDA</h1>
          <span className="px-2 py-0.5 border brutal-border bg-primary text-main-bg font-mono text-[10px] uppercase font-bold">Challenge</span>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton variant="secondary" className="px-3 py-1 text-xs">Run Checks</ActionButton>
          <ActionButton variant="secondary" className="px-3 py-1 text-xs opacity-50 pointer-events-none">Complete Unit</ActionButton>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Area (Left) */}
        <div className="flex-1 border-r brutal-border flex flex-col bg-navy text-gray-300">
          <div className="h-8 border-b border-gray-800 bg-[#0B0F17] flex items-center px-4 font-mono text-[10px] text-gray-500">
            lib.rs
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto">
            <pre><code>{`use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod pda_example {
    use super::*;
    pub fn create_user_stats(ctx: Context<CreateUserStats>, name: String) -> Result<()> {
        let user_stats = &mut ctx.accounts.user_stats;
        // TO DO: Set the user stats name
        
        Ok(())
    }
}`}</code></pre>
          </div>
        </div>

        {/* Instructions/Tests Area (Right) */}
        <div className="flex-1/2 min-w-[300px] md:max-w-sm flex flex-col bg-surface">
          <div className="flex border-b brutal-border font-mono text-xs uppercase font-bold">
             <button className="flex-1 py-3 bg-surface border-r brutal-border text-primary">Instructions</button>
             <button className="flex-1 py-3 bg-main-bg text-text-muted hover:bg-surface">Tests</button>
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
             <h2 className="font-heading font-bold text-xl uppercase mb-4">Task</h2>
             <div className="prose prose-sm font-sans text-text-muted mb-6 max-w-none">
                <p>Complete the instruction by setting the <code>name</code> field on the <code>user_stats</code> account.</p>
                <p>Make sure you assign the incoming method parameter successfully.</p>
             </div>
             
             <div className="p-4 border border-dashed brutal-border bg-main-bg text-xs font-mono mb-4 text-center">
                Run the challenge and pass all required checks before completing this unit.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
