'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';

interface ProofSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: {
    id: string;
    contractId: string;
    description: string;
    amount: number;
    currency: string;
    verificationCriteria?: string;
  } | null;
  onSuccess?: () => void;
  previewMode?: boolean;
}

interface VerificationResponse {
  success: boolean;
  verification: {
    is_valid: boolean;
    confidence_score: number;
    verdict: 'VERIFIED' | 'REJECTED' | 'NEEDS_CLARIFICATION';
    reasoning: string;
  };
  autoCaptured: boolean;
  captureData: { id: string; status: string } | null;
}

export default function ProofSubmissionModal({ isOpen, onClose, milestone, onSuccess, previewMode = false }: ProofSubmissionModalProps) {
  const [proofText, setProofText] = useState('');
  const [autoCapture, setAutoCapture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResponse | null>(null);

  const [prevKey, setPrevKey] = useState<string | null>(null);
  const currentKey = isOpen && milestone ? `${milestone.id}-${isOpen}` : null;

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (isOpen) {
      setProofText('');
      setAutoCapture(false);
      setError(null);
      setResult(null);
    }
  }

  if (!isOpen || !milestone) return null;

  async function handleSubmitProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!proofText.trim() || !milestone || loading) return;
    if (previewMode) {
      setError('This is a UI preview. Submissions are not connected yet.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: milestone.id,
          contractId: milestone.contractId,
          proofSubmitted: proofText.trim(),
          autoCapture,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Proof verification failed');
      setResult(data as VerificationResponse);
      onSuccess?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  const verified = result?.verification.is_valid ?? false;
  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: milestone.currency || 'USD' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="proof-title" className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border-2 border-stone-900 bg-[#FBFBF9] p-6 text-stone-900 shadow-[4px_4px_0px_0px_rgba(28,28,25,1)]">
        <button type="button" onClick={onClose} disabled={loading} aria-label="Close dialog" className="absolute right-4 top-4 p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 disabled:opacity-50"><X className="h-5 w-5" /></button>
        <div className="mb-6 pr-10">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-stone-500">Deliverable review</div>
          <h2 id="proof-title" className="font-serif text-2xl text-stone-900">Submit milestone proof</h2>
          <p className="mt-2 text-sm text-stone-600">AI will compare your submission with the agreed criteria.</p>
        </div>

        <div className="mb-6 border-2 border-stone-900 bg-[#FBFBF9] p-6 text-stone-900 shadow-[4px_4px_0px_0px_rgba(28,28,25,1)]">
          <div className="mb-2 flex items-center justify-between gap-3"><span className="truncate text-xs font-bold uppercase tracking-widest text-stone-500">Milestone {milestone.id}</span><span className="shrink-0 text-sm font-bold">{currency.format(milestone.amount)}</span></div>
          <h3 className="mb-4 font-serif text-2xl text-stone-900">{milestone.description}</h3>
          {milestone.verificationCriteria && <p className="border-t border-stone-300 pt-3 text-sm text-stone-600">Criteria: {milestone.verificationCriteria}</p>}
        </div>

        {!result ? <form onSubmit={handleSubmitProof} className="space-y-4">
          <div><label htmlFor="proof-text" className="mb-2 block text-xs font-bold uppercase tracking-widest text-stone-600">Deliverable proof</label><textarea id="proof-text" value={proofText} onChange={(event) => setProofText(event.target.value)} rows={4} maxLength={10000} placeholder="Share a URL, pull request, or concise work summary." className="w-full rounded-none border-2 border-stone-300 bg-white p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none" required /></div>
          <label className="flex cursor-pointer items-start gap-3 border border-stone-300 bg-white p-3 text-xs text-stone-700"><input type="checkbox" checked={autoCapture} onChange={(event) => setAutoCapture(event.target.checked)} className="mt-0.5 h-4 w-4 accent-stone-900" /><span>Allow automatic PayPal capture if the proof is verified with at least 75% confidence.</span></label>
          {error && <div role="alert" className="flex items-center gap-2 border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-stone-500 transition-colors hover:text-stone-900">Cancel</button><button type="submit" disabled={loading || !proofText.trim()} className="flex items-center gap-2 rounded-none border-2 border-[#1C1C19] bg-[#1C1C19] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-[#FBFBF9] transition-colors hover:bg-[#FBFBF9] hover:text-[#1C1C19] disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><RefreshCw className="h-4 w-4 animate-spin" />Evaluating…</> : <><Sparkles className="h-4 w-4" />Submit Deliverable</>}</button></div>
        </form> : <div className="space-y-4">
          <div className={`border-2 p-4 ${verified ? 'border-emerald-800 bg-emerald-50' : 'border-amber-800 bg-amber-50'}`}>
            <div className={`mb-2 flex items-center justify-between gap-3 ${verified ? 'text-emerald-800' : 'text-amber-800'}`}><div className="flex items-center gap-2 font-bold uppercase"><CheckCircle2 className="h-5 w-5" /><span>{result.verification.verdict.replaceAll('_', ' ')}</span></div><span className="border border-stone-300 bg-white px-2 py-0.5 font-mono text-xs">Confidence: {Math.round(Math.min(1, Math.max(0, result.verification.confidence_score)) * 100)}%</span></div>
            <p className="text-sm text-stone-700">{result.verification.reasoning}</p>
          </div>
          {result.autoCaptured && result.captureData && <div className="flex items-center gap-2 border-2 border-blue-800 bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck className="h-5 w-5" /><span>PayPal released this milestone. Capture: {result.captureData.id}</span></div>}
          <div className="flex justify-end"><button type="button" onClick={onClose} className="rounded-none border-2 border-[#1C1C19] bg-[#1C1C19] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-[#FBFBF9] hover:bg-[#FBFBF9] hover:text-[#1C1C19]">Done</button></div>
        </div>}
      </section>
    </div>
  );
}
