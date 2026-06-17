import { useNavigate } from 'react-router-dom';
import { Check, Zap, Building2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useBillingInfo, useCreateCheckout, usePortal } from '../hooks/useBilling';
import useWorkspaceStore from '../store/workspaceStore';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 project', '3 members', 'Kanban board', 'Basic roles'],
    icon: null,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$10',
    period: 'per user / month',
    features: ['20 projects', '20 members', 'File attachments', 'Comments & activity', 'Notifications', 'Analytics dashboard', 'Calendar view'],
    icon: Zap,
    highlight: true,
  },
  {
    key: 'business',
    name: 'Business',
    price: '$25',
    period: 'per user / month',
    features: ['Unlimited everything', 'Custom fields', 'AI features', 'SSO / SAML', 'Audit logs', 'Public API + webhooks', 'Guest access'],
    icon: Building2,
  },
];

const S = {
  page:    { minHeight: '100vh', background: '#020f18', padding: '2rem 1rem' },
  inner:   { maxWidth: '960px', margin: '0 auto' },
  back:    { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3a7080', fontSize: '13px', cursor: 'pointer', marginBottom: '2rem', fontFamily: 'inherit' },
  heading: { fontSize: '24px', fontWeight: 600, color: '#e0f5f2', marginBottom: '6px' },
  sub:     { fontSize: '14px', color: '#3a7080', marginBottom: '2.5rem' },
  grid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' },
  card:    { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column' },
  cardHL:  { background: '#051e2e', border: '1.5px solid #00c8b4', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', position: 'relative' },
  badge:   { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#00c8b4', color: '#020f18', fontSize: '11px', fontWeight: 600, padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' },
  planName:{ fontSize: '14px', fontWeight: 500, color: '#3a7080', marginBottom: '0.5rem' },
  price:   { fontSize: '32px', fontWeight: 700, color: '#e0f5f2', lineHeight: 1 },
  period:  { fontSize: '12px', color: '#3a7080', marginBottom: '1.5rem', marginTop: '4px' },
  feats:   { listStyle: 'none', padding: 0, margin: '0 0 1.5rem', flex: 1 },
  feat:    { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#c0e8e4', marginBottom: '8px' },
  btnHL:   { width: '100%', padding: '10px', background: '#00c8b4', border: 'none', borderRadius: '20px', color: '#020f18', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btn:     { width: '100%', padding: '10px', background: 'transparent', border: '1.5px solid #0e3347', borderRadius: '20px', color: '#3a7080', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnDis:  { width: '100%', padding: '10px', background: 'transparent', border: '1.5px solid #0e3347', borderRadius: '20px', color: '#3a7080', fontSize: '13px', fontWeight: 500, cursor: 'default', fontFamily: 'inherit', opacity: 0.5 },
  infoBox: { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' },
  infoTxt: { fontSize: '13px', color: '#3a7080' },
  infoVal: { color: '#e0f5f2', fontWeight: 500 },
  portal:  { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #0e3347', borderRadius: '20px', color: '#00c8b4', fontSize: '12px', cursor: 'pointer', padding: '6px 14px', fontFamily: 'inherit' },
  success: { background: '#061f18', border: '1px solid #00c8b4', color: '#34d399', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '1.5rem' },
};

export default function Billing() {
  const { isAdmin } = useWorkspaceRole();
  const navigate = useNavigate();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: billing, isLoading } = useBillingInfo(activeWorkspaceId);
  const { mutate: checkout, isPending } = useCreateCheckout(activeWorkspaceId);
  const { mutate: portal, isPending: portalPending } = usePortal(activeWorkspaceId);

  const currentPlan = billing?.plan || 'free';

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <button style={S.back} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>

        <h1 style={S.heading}>Plans & billing</h1>
        <p style={S.sub}>Upgrade your workspace to unlock more projects, members, and features.</p>

       
        {!isLoading && (
          <div style={S.infoBox}>
            <span style={S.infoTxt}>
              Current plan: <span style={S.infoVal}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
              {billing?.stripeCurrentPeriodEnd && (
                <> &nbsp;·&nbsp; Renews <span style={S.infoVal}>{new Date(billing.stripeCurrentPeriodEnd).toLocaleDateString()}</span></>
              )}
            </span>
            {currentPlan !== 'free' && isAdmin && (
  <button style={S.portal} onClick={() => portal()} disabled={portalPending}>
    {portalPending ? 'Opening...' : <><ExternalLink size={12} /> Manage subscription</>}
  </button>
)}
          </div>
        )}

       
        <div style={S.grid}>
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.key === currentPlan;
            const isHighlight = plan.highlight;
            const cardStyle = isHighlight ? S.cardHL : S.card;
            const disabled = isCurrent || plan.key === 'free' || isPending;

            let btnStyle = disabled ? S.btnDis : (isHighlight ? S.btnHL : S.btn);
            let btnLabel = isCurrent ? '✓ Current plan' : `Upgrade to ${plan.name}`;
            if (plan.key === 'free') btnLabel = 'Free forever';
            if (isPending) btnLabel = 'Redirecting...';

            return (
              <div key={plan.key} style={cardStyle}>
                {isHighlight && <span style={S.badge}>Most popular</span>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  {Icon && <Icon size={16} color="#00c8b4" />}
                  <span style={S.planName}>{plan.name}</span>
                </div>

                <div style={S.price}>{plan.price}</div>
                <div style={S.period}>{plan.period}</div>

                <ul style={S.feats}>
                  {plan.features.map((f) => (
                    <li key={f} style={S.feat}>
                      <Check size={13} color="#00c8b4" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button style={btnStyle} disabled={disabled} onClick={() => !disabled && checkout(plan.key)}>
                  {btnLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}