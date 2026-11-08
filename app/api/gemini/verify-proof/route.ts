import { NextResponse } from 'next/server';
import { verifyDeliverableProof } from '@/lib/gemini/client';
import { getSupabase } from '@/lib/supabase/client';
import { captureAuthorization } from '@/lib/paypal/client';
import { readJsonObject } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 });
    const { milestoneId, contractId, proofSubmitted, autoCapture = false } = body;
    if (typeof milestoneId !== 'string' || typeof contractId !== 'string' || !milestoneId || !contractId || typeof proofSubmitted !== 'string' || !proofSubmitted.trim()) return NextResponse.json({ error: 'Milestone ID, Contract ID, and proof text are required' }, { status: 400 });
    if (proofSubmitted.length > 10_000) return NextResponse.json({ error: 'Proof text must be 10,000 characters or fewer' }, { status: 413 });
    if (typeof autoCapture !== 'boolean') return NextResponse.json({ error: 'autoCapture must be a boolean' }, { status: 400 });

    const db = getSupabase();
    const [{ data: milestone, error: milestoneError }, { data: contract, error: contractError }] = await Promise.all([
      db.from('milestones').select('id,contract_id,description,verification_criteria,amount,status,paypal_capture_id').eq('id', milestoneId).single(),
      db.from('contracts').select('id,status,currency,paypal_authorization_id').eq('id', contractId).single(),
    ]);
    if (milestoneError || !milestone) return NextResponse.json({ error: 'Milestone record not found' }, { status: 404 });
    if (contractError || !contract) return NextResponse.json({ error: 'Contract record not found' }, { status: 404 });
    if (milestone.contract_id !== contract.id) return NextResponse.json({ error: 'Milestone does not belong to this contract' }, { status: 409 });
    if (!['AUTHORIZED_HOLD', 'IN_PROGRESS'].includes(contract.status)) return NextResponse.json({ error: 'Contract does not have an active payment authorization' }, { status: 409 });
    if (milestone.status === 'RELEASED' || milestone.paypal_capture_id) return NextResponse.json({ error: 'This milestone has already been paid' }, { status: 409 });

    const verification = await verifyDeliverableProof(milestone.description, milestone.verification_criteria || milestone.description, proofSubmitted.trim());
    const nextStatus = verification.is_valid ? 'VERIFIED' : 'PENDING';
    const { error: saveError } = await db.from('milestones').update({ proof_submitted: proofSubmitted.trim(), ai_verification_notes: verification.reasoning, ai_confidence_score: verification.confidence_score, status: nextStatus }).eq('id', milestoneId);
    if (saveError) return NextResponse.json({ error: 'Verification completed but could not be saved' }, { status: 500 });

    let captureData: { id: string; status: string } | null = null;
    if (verification.is_valid && verification.confidence_score >= 0.75 && autoCapture) {
      if (!contract.paypal_authorization_id) return NextResponse.json({ success: true, verification, autoCaptured: false, captureData: null, warning: 'No PayPal authorization is linked to this contract.' });
      const { data: milestones, error: listError } = await db.from('milestones').select('id,status').eq('contract_id', contractId);
      if (listError || !milestones?.length) return NextResponse.json({ error: 'Verification saved, but contract milestones could not be loaded for capture' }, { status: 500 });
      const isFinalCapture = milestones.every((item: { id: string; status: string }) => item.id === milestoneId || item.status === 'RELEASED');
      const capture = await captureAuthorization(contract.paypal_authorization_id, Number(milestone.amount), contract.currency || 'USD', isFinalCapture, milestoneId);
      if (!capture?.id) return NextResponse.json({ error: 'Verification saved, but PayPal did not return a capture ID' }, { status: 502 });
      captureData = { id: capture.id, status: capture.status };
      const { error: captureSaveError } = await db.from('milestones').update({ status: 'RELEASED', paypal_capture_id: capture.id }).eq('id', milestoneId).eq('status', 'VERIFIED');
      if (captureSaveError) return NextResponse.json({ error: 'PayPal captured the funds, but the milestone record could not be updated' }, { status: 500 });
      const { error: contractSaveError } = await db.from('contracts').update({ status: isFinalCapture ? 'COMPLETED' : 'IN_PROGRESS' }).eq('id', contractId);
      if (contractSaveError) return NextResponse.json({ error: 'PayPal captured the funds, but the contract status could not be updated' }, { status: 500 });
    }

    return NextResponse.json({ success: true, verification, autoCaptured: !!captureData, captureData });
  } catch (error) {
    console.error('Error in /api/gemini/verify-proof:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Proof verification failed' }, { status: 500 });
  }
}
