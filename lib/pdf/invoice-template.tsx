/**
 * PayPilot AI — PDF Invoice Template
 * Uses @react-pdf/renderer to generate a professional downloadable invoice.
 * Runs entirely on the server inside a Next.js API Route (Node.js runtime).
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { Invoice } from '@/types';

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontSize: 10,
    color: '#1e293b',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  brandBlock: { flexDirection: 'column', gap: 2 },
  brandName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#3b82f6' },
  brandTagline: { fontSize: 8, color: '#64748b' },
  invoiceMeta: { flexDirection: 'column', alignItems: 'flex-end', gap: 3 },
  invoiceTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#0f172a', letterSpacing: 1 },
  invoiceNumber: { fontSize: 10, color: '#3b82f6', fontFamily: 'Helvetica-Bold' },

  // Status badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 20 },

  // Parties section
  parties: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  partyBlock: { flexDirection: 'column', gap: 2, maxWidth: '45%' },
  partyLabel: { fontSize: 8, color: '#94a3b8', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  partyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  partyDetail: { fontSize: 9, color: '#475569' },

  // Dates row
  datesRow: { flexDirection: 'row', gap: 24, marginBottom: 28 },
  dateBlock: { flexDirection: 'column', gap: 2 },
  dateLabel: { fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica-Bold' },

  // Line items table
  table: { marginBottom: 24 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  colDescription: { flex: 1 },
  colQty: { width: 40, textAlign: 'center' },
  colRate: { width: 70, textAlign: 'right' },
  colAmount: { width: 70, textAlign: 'right' },
  colHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase' },
  colText: { fontSize: 10, color: '#1e293b' },

  // Totals
  totalsBlock: { flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginBottom: 28 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  totalLabel: { fontSize: 10, color: '#475569', width: 90, textAlign: 'right' },
  totalValue: { fontSize: 10, color: '#1e293b', width: 80, textAlign: 'right' },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginTop: 4,
  },
  grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', width: 90, textAlign: 'right' },
  grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', width: 80, textAlign: 'right' },

  // Notes / Footer
  notesBlock: { marginBottom: 24 },
  notesLabel: { fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  notesText: { fontSize: 9, color: '#475569', lineHeight: 1.5 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  footerText: { fontSize: 8, color: '#94a3b8' },
  footerBrand: { fontSize: 8, color: '#3b82f6', fontFamily: 'Helvetica-Bold' },

  // Payment note (for PAID invoices)
  paidStamp: {
    position: 'absolute',
    top: 60,
    right: 48,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: '#22c55e',
    borderRadius: 6,
    transform: 'rotate(-8deg)',
  },
  paidStampText: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#22c55e', opacity: 0.6, letterSpacing: 2 },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getStatusColors(status: string): { bg: string; text: string } {
  switch (status?.toUpperCase()) {
    case 'PAID':    return { bg: '#dcfce7', text: '#16a34a' };
    case 'OVERDUE': return { bg: '#fee2e2', text: '#dc2626' };
    case 'PENDING': return { bg: '#fef9c3', text: '#ca8a04' };
    case 'DRAFT':   return { bg: '#f1f5f9', text: '#64748b' };
    default:        return { bg: '#f1f5f9', text: '#64748b' };
  }
}

// ── Invoice PDF Document ──────────────────────────────────────────────────────
interface InvoicePDFProps {
  invoice: Invoice;
  businessName?: string;
  businessEmail?: string;
  businessAddress?: string;
}

export function InvoicePDFDocument({ invoice, businessName, businessEmail, businessAddress }: InvoicePDFProps) {
  const statusColors = getStatusColors(invoice.status);
  const subtotal = invoice.amount;
  const tax = 0; // No tax in MVP
  const total = subtotal + tax;

  return (
    <Document
      title={`Invoice ${invoice.invoiceNumber}`}
      author="PayPilot AI"
      subject={`Invoice for ${invoice.customerName}`}
      keywords="invoice, payment, paypilot"
    >
      <Page size="A4" style={styles.page}>
        {/* PAID stamp (watermark) */}
        {invoice.status === 'PAID' && (
          <View style={styles.paidStamp}>
            <Text style={styles.paidStampText}>PAID</Text>
          </View>
        )}

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>PayPilot AI</Text>
            <Text style={styles.brandTagline}>Autonomous Cashflow Copilot</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Parties ── */}
        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{businessName || 'Your Business'}</Text>
            {businessEmail && <Text style={styles.partyDetail}>{businessEmail}</Text>}
            {businessAddress && <Text style={styles.partyDetail}>{businessAddress}</Text>}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{invoice.customerName || 'Client'}</Text>
            {invoice.customerEmail && <Text style={styles.partyDetail}>{invoice.customerEmail}</Text>}
          </View>
        </View>

        {/* ── Dates ── */}
        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Issue Date</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          {invoice.paypalOrderId && (
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>PayPal Order</Text>
              <Text style={styles.dateValue}>{invoice.paypalOrderId}</Text>
            </View>
          )}
        </View>

        {/* ── Line Items Table ── */}
        <View style={styles.table}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <View style={styles.colDescription}><Text style={styles.colHeaderText}>Description</Text></View>
            <View style={styles.colQty}><Text style={styles.colHeaderText}>Qty</Text></View>
            <View style={styles.colRate}><Text style={styles.colHeaderText}>Rate</Text></View>
            <View style={styles.colAmount}><Text style={styles.colHeaderText}>Amount</Text></View>
          </View>
          {/* Single line item */}
          <View style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text style={styles.colText}>{invoice.description}</Text>
            </View>
            <View style={styles.colQty}><Text style={styles.colText}>1</Text></View>
            <View style={styles.colRate}><Text style={styles.colText}>{formatCurrency(invoice.amount, invoice.currency)}</Text></View>
            <View style={styles.colAmount}><Text style={styles.colText}>{formatCurrency(invoice.amount, invoice.currency)}</Text></View>
          </View>
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (0%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax, invoice.currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total, invoice.currency)}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Payment Instructions</Text>
          <Text style={styles.notesText}>
            {invoice.status === 'PAID'
              ? `Payment received via PayPal. Thank you for your business!`
              : `Please complete payment via PayPal by ${formatDate(invoice.dueDate)}. If you have any questions, please contact us.`}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by PayPilot AI · paypilot.ai</Text>
          <Text style={styles.footerBrand}>PayPilot AI — Autonomous Cashflow Copilot</Text>
        </View>
      </Page>
    </Document>
  );
}

