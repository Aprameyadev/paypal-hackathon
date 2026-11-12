'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProofSubmissionModal from '@/components/escrow/ProofSubmissionModal';

const previewMilestone = {
  id: '01',
  contractId: 'preview-contract-01',
  description: 'Brand Identity System',
  amount: 750,
  currency: 'USD',
  verificationCriteria: 'Logo files, color palette, typography guide, and brand usage examples.',
};

export default function MilestonesPage() {
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Project delivery</p>
            <h1 className="text-3xl font-serif text-white">Milestones</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Review deliverables and submit work for verification.</p>
          </div>
          <span className="w-fit border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-200">UI preview</span>
        </header>

        <div className="max-w-md bg-[#FBFBF9] border-2 border-stone-900 rounded-none p-6 text-stone-900 shadow-[4px_4px_0px_0px_rgba(28,28,25,1)]">
          <div className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-2">Milestone 01</div>
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Brand Identity System</h2>
          <p className="mb-6 text-sm leading-relaxed text-stone-600">Logo files, color palette, typography guide, and brand usage examples.</p>
          <button
            type="button"
            onClick={() => setIsProofModalOpen(true)}
            className="bg-[#1C1C19] text-[#FBFBF9] border-2 border-[#1C1C19] hover:bg-[#FBFBF9] hover:text-[#1C1C19] transition-colors rounded-none px-6 py-2.5 font-bold tracking-wide uppercase text-sm"
          >
            Submit Deliverable
          </button>
        </div>

        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          This sample is for previewing the milestone UI. Deliverable submissions require milestone records and backend wiring.
        </p>
      </div>

      <ProofSubmissionModal
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        milestone={previewMilestone}
        previewMode
      />
    </AppLayout>
  );
}
