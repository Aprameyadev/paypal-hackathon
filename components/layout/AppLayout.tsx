'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'Copilot' },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Transactions', href: '/transactions', icon: CreditCard },
    { label: 'Analytics', href: '/analytics', icon: BarChart3, badge: 'AG Grid' },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  async function handleResetDemoData() {
    if (confirm('Reset all demo data back to default sandbox state?')) {
      setResetting(true);
      try {
        await fetch('/api/demo/reset', { method: 'POST' });
        window.location.reload();
      } catch (err) {
        console.error('Failed to reset demo data', err);
      } finally {
        setResetting(false);
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/80 bg-[#0a101d] px-4 py-6 justify-between select-none shrink-0">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 text-white font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">PayPilot</span>
                <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">AI</span>
              </div>
              <p className="text-[11px] text-slate-400">Autonomous Cashflow</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-950'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / PayPal Sandbox Status */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                PayPal Sandbox
              </span>
              <span className="text-[10px] rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20 font-medium">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Autonomous invoice capture & verified payment reconciliation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            disabled={resetting}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-[#0a101d]/90 px-4 sm:px-8 backdrop-blur-md">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">PayPal AI Hackathon 2026</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sandbox Ready
              </span>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-[#0e1626] p-4 shadow-2xl shadow-black/80 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-white">Live Activity</span>
                    <span className="text-[10px] text-blue-400 font-medium">Demo Mode</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-slate-300 border border-blue-500/20">
                      <p className="font-medium text-white">Invoice INV-2026-001 Pending</p>
                      <p className="text-[11px] text-slate-400">Alex Johnson was sent website dev invoice ($150.00)</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-2 text-slate-300 border border-amber-500/20">
                      <p className="font-medium text-amber-300">Invoice INV-2026-002 Overdue</p>
                      <p className="text-[11px] text-slate-400">Sarah Miller has an overdue invoice ($250.00)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                PA
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-white leading-tight">Alex Rivera</p>
                <p className="text-[10px] text-slate-400 leading-tight">Founder / Freelancer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-[#0a101d] p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-bold text-white">PayPilot AI</span>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <item.icon className="h-4 w-4 text-blue-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#070b14] p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
