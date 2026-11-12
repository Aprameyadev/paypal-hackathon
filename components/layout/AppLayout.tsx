'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  LayoutDashboard,
  Bot,
  FileText,
  ClipboardCheck,
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
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'AI Assistant', href: '/assistant', icon: Bot, badge: 'Copilot' },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Milestones', href: '/milestones', icon: ClipboardCheck, badge: 'Escrow' },
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

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PP';

  return (
    <div className="flex min-h-screen bg-[#F4F4F0] text-[#1C1C19] font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r-2 border-[#1C1C19] bg-[#FBFBF9] px-4 py-6 justify-between select-none shrink-0">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-[#1C1C19] bg-[#1C1C19] text-[#FBFBF9] font-bold shadow-[2px_2px_0px_0px_#1C1C19]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-[#1C1C19]">PayPilot</span>
                <span className="border border-[#1C1C19] bg-[#1C1C19] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white">AI</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Autonomous Cashflow</p>
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
                  className={`flex items-center justify-between border-2 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'border-[#1C1C19] bg-[#1C1C19] text-[#FBFBF9] shadow-[3px_3px_0px_0px_#1C1C19]'
                      : 'border-transparent text-stone-600 hover:border-[#1C1C19] hover:bg-white hover:text-[#1C1C19]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-stone-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'border-white bg-white/20 text-white'
                          : 'border-[#1C1C19] bg-stone-100 text-[#1C1C19]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / PayPal Sandbox Status */}
        <div className="pt-4 border-t-2 border-[#1C1C19] space-y-3">
          <div className="border-2 border-[#1C1C19] bg-white p-3 text-xs shadow-[3px_3px_0px_0px_#1C1C19]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#1C1C19] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#14532D]" />
                PayPal Sandbox
              </span>
              <span className="border border-[#1C1C19] bg-[#14532D] text-white px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Autonomous invoice capture &amp; verified escrow settlement.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            disabled={resetting}
            className="flex w-full items-center justify-center gap-2 border-2 border-[#1C1C19] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#1C1C19] shadow-[3px_3px_0px_0px_#1C1C19] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-[#1C1C19] bg-[#FBFBF9]/95 px-4 sm:px-8 backdrop-blur-md">
          {/* Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-2 border-[#1C1C19] bg-white p-2 text-[#1C1C19] md:hidden shadow-[2px_2px_0px_0px_#1C1C19]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600">
              <span className="text-[#1C1C19]">PayPal AI Hackathon 2026</span>
              <span>•</span>
              <span className="text-[#14532D] flex items-center gap-1.5">
                <span className="h-2 w-2 border border-[#1C1C19] bg-[#14532D]"></span>
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
                className="relative border-2 border-[#1C1C19] bg-white p-2 text-[#1C1C19] shadow-[2px_2px_0px_0px_#1C1C19] hover:-translate-y-0.5 transition-transform"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 border border-[#1C1C19] bg-[#B45309]"></span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 border-2 border-[#1C1C19] bg-[#FBFBF9] p-4 shadow-[4px_4px_0px_0px_#1C1C19] z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-stone-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1C1C19]">Live Activity</span>
                    <span className="border border-[#1C1C19] bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold uppercase text-[#1C1C19]">
                      {user?.isDemo ? 'Demo Mode' : 'Live Mode'}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="border-2 border-[#1C1C19] bg-white p-2.5 text-stone-700">
                      <p className="font-bold text-[#1C1C19]">Invoice INV-2026-001 Pending</p>
                      <p className="text-[11px] text-stone-600">Alex Johnson was sent website dev invoice ($150.00)</p>
                    </div>
                    <div className="border-2 border-[#1C1C19] bg-white p-2.5 text-stone-700">
                      <p className="font-bold text-[#991B1B]">Invoice INV-2026-002 Overdue</p>
                      <p className="text-[11px] text-stone-600">Sarah Miller has an overdue invoice ($250.00)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Capsule & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 border-2 border-[#1C1C19] bg-white px-3 py-1.5 shadow-[2px_2px_0px_0px_#1C1C19] hover:-translate-y-0.5 transition-transform"
              >
                <div className="h-6 w-6 border border-[#1C1C19] bg-[#1C1C19] flex items-center justify-center text-[10px] font-bold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#1C1C19] leading-tight">
                    {user?.fullName || 'Demo Founder'}
                  </p>
                  <p className="text-[10px] font-mono text-stone-500 leading-tight">
                    {user?.isDemo ? 'Demo Mode' : user?.email || 'Verified User'}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#1C1C19]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 border-2 border-[#1C1C19] bg-[#FBFBF9] p-2 shadow-[4px_4px_0px_0px_#1C1C19] z-50">
                  <div className="px-3 py-2 border-b-2 border-stone-200 mb-1">
                    <p className="text-xs font-bold text-[#1C1C19]">{user?.fullName || 'User'}</p>
                    <p className="text-[11px] font-mono text-stone-600 truncate">{user?.email || 'demo@paypilot.ai'}</p>
                    <span className="mt-1 inline-block border border-[#1C1C19] bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1C1C19]">
                      {user?.isDemo ? '⚡ Demo Sandbox' : '🛡️ Private Workspace'}
                    </span>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-[#1C1C19]" />
                    <span>Workspace Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#991B1B] hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 h-full border-r-2 border-[#1C1C19] bg-[#FBFBF9] p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center border-2 border-[#1C1C19] bg-[#1C1C19] text-white font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-serif text-xl font-bold text-[#1C1C19]">PayPilot AI</span>
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 border-2 border-transparent px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:border-[#1C1C19] hover:bg-white"
                  >
                    <item.icon className="h-4 w-4 text-[#1C1C19]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="pt-4 border-t-2 border-[#1C1C19]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#991B1B] hover:underline"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#F4F4F0] p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
