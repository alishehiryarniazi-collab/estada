/**
 * Admin panel. Three tabs: document Verifications, reported-listing Moderation,
 * and Users (with dealer identity verification). Admin-only.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Flag, Users, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as admin from '../services/adminService';
import type { Verification, Report, AdminUser } from '../services/adminService';
import { useAuthStore } from '../store/authStore';

type Tab = 'verifications' | 'reports' | 'users';

export default function AdminPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('verifications');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const reload = () => {
    admin.getVerifications().then(setVerifications).catch(() => undefined);
    admin.getReports().then(setReports).catch(() => undefined);
    admin.getUsers().then(setUsers).catch(() => undefined);
  };
  useEffect(() => {
    if (user?.role === 'admin') reload();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <Navbar />
        <main className="mx-auto flex flex-1 items-center justify-center px-6 text-center text-ink-muted">
          {t('admin.adminOnly')}
        </main>
        <Footer />
      </div>
    );
  }

  const TABS: { key: Tab; label: string; Icon: typeof ShieldCheck; count: number }[] = [
    { key: 'verifications', label: t('admin.verifications'), Icon: ShieldCheck, count: verifications.length },
    { key: 'reports', label: t('admin.reports'), Icon: Flag, count: reports.length },
    { key: 'users', label: t('admin.users'), Icon: Users, count: users.length },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">{t('admin.title')}</h1>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-hairline">
          {TABS.map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Icon size={15} /> {label}
              {count > 0 && <span className="rounded-full bg-hairline px-1.5 text-xs">{count}</span>}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {/* Verifications */}
          {tab === 'verifications' &&
            (verifications.length === 0 ? (
              <Empty>{t('admin.noVerifications')}</Empty>
            ) : (
              verifications.map((v) => (
                <Row key={v.id}>
                  <a href={v.documentUrl} target="_blank" rel="noreferrer" className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-hairline">
                    <img src={v.documentUrl} alt="document" className="h-full w-full object-cover" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <Link to={`/listings/${v.property.id}`} className="line-clamp-1 font-medium text-ink hover:text-primary">
                      {v.property.title}
                    </Link>
                    <p className="text-xs text-ink-muted">{v.property.dealer.name} · {v.property.city}</p>
                  </div>
                  <Actions
                    onApprove={() => admin.reviewVerification(v.id, 'verified').then(reload)}
                    onReject={() => admin.reviewVerification(v.id, 'rejected').then(reload)}
                  />
                </Row>
              ))
            ))}

          {/* Reports */}
          {tab === 'reports' &&
            (reports.length === 0 ? (
              <Empty>{t('admin.noReports')}</Empty>
            ) : (
              reports.map((r) => (
                <Row key={r.id}>
                  <div className="min-w-0 flex-1">
                    <Link to={`/listings/${r.property.id}`} className="line-clamp-1 font-medium text-ink hover:text-primary">
                      {r.property.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-ink">{r.reason}</p>
                    <p className="text-xs text-ink-muted">{t('admin.reportedBy', { name: r.reportedBy.name })}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => admin.reviewReport(r.id, 'dismissed').then(reload)} className="rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
                      {t('admin.dismiss')}
                    </button>
                    <button onClick={() => admin.reviewReport(r.id, 'reviewed', true).then(reload)} className="rounded-lg bg-cta px-3 py-1.5 text-xs font-medium text-white hover:bg-cta-hover">
                      {t('admin.takeDown')}
                    </button>
                  </div>
                </Row>
              ))
            ))}

          {/* Users */}
          {tab === 'users' &&
            users.map((u) => (
              <Row key={u.id}>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">
                    {u.name} <span className="text-xs font-normal text-ink-muted">· {u.role}</span>
                  </p>
                  <p className="text-xs text-ink-muted">{u.email} · {t('admin.listings', { n: u._count.properties })}</p>
                  {u.dealerProfile && (
                    <p className="text-xs text-ink-muted">
                      {u.dealerProfile.businessName} — {t('admin.identity', { status: u.dealerProfile.verificationStatus })}
                    </p>
                  )}
                </div>
                {u.dealerProfile && u.dealerProfile.verificationStatus !== 'verified' && (
                  <Actions
                    onApprove={() => admin.verifyDealer(u.id, 'verified').then(reload)}
                    onReject={() => admin.verifyDealer(u.id, 'rejected').then(reload)}
                  />
                )}
              </Row>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-card border border-hairline bg-surface p-3">{children}</div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card border border-hairline bg-surface p-8 text-center text-ink-muted">{children}</div>;
}
function Actions({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 gap-2">
      <button onClick={onApprove} className="inline-flex items-center gap-1 rounded-lg bg-verify px-3 py-1.5 text-xs font-medium text-white">
        <Check size={13} /> {t('admin.approve')}
      </button>
      <button onClick={onReject} className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
        <X size={13} /> {t('admin.reject')}
      </button>
    </div>
  );
}
