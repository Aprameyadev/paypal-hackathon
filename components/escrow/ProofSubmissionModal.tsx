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

export default function ProofSubmissionModal({ isOpen, onClose, milestone, onSuccess }: ProofSubmissionModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="proof-title" className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <button type="button" onClick={onClose} disabled={loading} aria-label="Close dialog" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"><X className="h-5 w-5" /></button>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-600/10 p-2.5 text-blue-400"><Sparkles className="h-6 w-6" /></div>
          <div><h2 id="proof-title" className="text-xl font-bold text-white">Submit milestone proof</h2><p className="text-xs text-slate-400">AI will compare your submission with the agreed criteria.</p></div>
        </div>

        <div className="mb-6 space-y-2 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-semibold text-blue-400">Milestone {milestone.id}</span><span className="shrink-0 text-sm font-bold text-emerald-400">{currency.format(milestone.amount)}</span></div>
          <p className="text-sm font-medium text-slate-200">{milestone.description}</p>
          {milestone.verificationCriteria && <p className="text-xs text-slate-500">Criteria: {milestone.verificationCriteria}</p>}
        </div>

        {!result ? <form onSubmit={handleSubmitProof} className="space-y-4">
          <div><label htmlFor="proof-text" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Deliverable proof</label><textarea id="proof-text" value={proofText} onChange={(event) => setProofText(event.target.value)} rows={4} maxLength={10000} placeholder="Share a URL, pull request, or concise work summary." className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 transition-colors placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" required /></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-300"><input type="checkbox" checked={autoCapture} onChange={(event) => setAutoCapture(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500" /><span>Allow automatic PayPal capture if the proof is verified with at least 75% confidence.</span></label>
          {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-200">Cancel</button><button type="submit" disabled={loading || !proofText.trim()} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:bg-slate-800">{loading ? <><RefreshCw className="h-4 w-4 animate-spin" />Evaluating…</> : <><Sparkles className="h-4 w-4" />Evaluate proof</>}</button></div>
        </form> : <div className="space-y-4">
          <div className={`rounded-xl border p-4 ${verified ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-amber-500/20 bg-amber-500/10'}`}>
            <div className="mb-2 flex items-center justify-between gap-3"><div className={`flex items-center gap-2 font-bold uppercase ${verified ? 'text-emerald-400' : 'text-amber-400'}`}><CheckCircle2 className="h-5 w-5" /><span>{result.verification.verdict.replaceAll('_', ' ')}</span></div><span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs">Confidence: {Math.round(Math.min(1, Math.max(0, result.verification.confidence_score)) * 100)}%</span></div>
            <p className="text-xs text-slate-300">{result.verification.reasoning}</p>
          </div>
          {result.autoCaptured && result.captureData && <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-300"><ShieldCheck className="h-5 w-5" /><span>PayPal released this milestone. Capture: {result.captureData.id}</span></div>}
          <div className="flex justify-end"><button type="button" onClick={onClose} className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Done</button></div>
        </div>}
      </section>
    </div>
  );
}
