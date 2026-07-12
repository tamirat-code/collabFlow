import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, MessageSquare, Bell, Paperclip, Zap, ArrowRight, Check,
  Users, History, Rewind, Sparkles, BarChart2, Shield,
} from 'lucide-react';
import Strands from '../components/effects/strands';
import useAuthStore from '../store/authStore';

const S = {
  page:        { background: '#020f18', minHeight: '100vh', color: '#e0f5f2', overflowX: 'hidden' },

  nav:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 5%', position: 'relative', zIndex: 10 },
  logo:        { fontSize: '20px', fontWeight: 700, color: '#00c8b4', letterSpacing: '0.3px' },
  navRight:    { display: 'flex', alignItems: 'center', gap: '12px' },
  navLink:     { background: 'none', border: 'none', color: '#a0cdd8', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', padding: '8px 16px' },
  navCta:      { background: '#00c8b4', border: 'none', color: '#020f18', fontSize: '13px', fontWeight: 600, padding: '9px 20px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit' },

  hero:        { position: 'relative', minHeight: '640px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 5%' },
  heroBg:      { position: 'absolute', inset: 0, zIndex: 0 },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: '720px' },
  badge:       { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,200,180,0.08)', border: '1px solid rgba(0,200,180,0.25)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', color: '#00c8b4', marginBottom: '24px' },
  h1:          { fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 20px', color: '#f0fbfa' },
  h1Accent:    { color: '#00c8b4' },
  sub:         { fontSize: 'clamp(15px, 2vw, 18px)', color: '#7fa8b3', lineHeight: 1.6, margin: '0 0 36px', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' },
  heroActions: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn:  { display: 'flex', alignItems: 'center', gap: '8px', background: '#00c8b4', border: 'none', color: '#020f18', fontSize: '14px', fontWeight: 600, padding: '13px 28px', borderRadius: '24px', cursor: 'pointer', fontFamily: 'inherit' },
  secondaryBtn:{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1.5px solid #1e4a5a', color: '#c0e8e4', fontSize: '14px', fontWeight: 500, padding: '12px 28px', borderRadius: '24px', cursor: 'pointer', fontFamily: 'inherit' },

  section:     { padding: '90px 5%', maxWidth: '1100px', margin: '0 auto' },
  sectionHead: { textAlign: 'center', marginBottom: '56px' },
  sectionTag:  { fontSize: '12px', fontWeight: 600, color: '#00c8b4', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' },
  sectionTitle:{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, color: '#f0fbfa', margin: 0 },

  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  card:        { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', padding: '28px 24px' },
  cardIcon:    { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,200,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
  cardTitle:   { fontSize: '16px', fontWeight: 600, color: '#e0f5f2', margin: '0 0 8px' },
  cardText:    { fontSize: '13px', color: '#5a8a99', lineHeight: 1.6, margin: 0 },

  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '940px', margin: '0 auto' },
  priceCard:   { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column' },
  priceCardHL: { background: '#051e2e', border: '1.5px solid #00c8b4', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', position: 'relative' },
  priceBadge:  { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#00c8b4', color: '#020f18', fontSize: '11px', fontWeight: 600, padding: '3px 14px', borderRadius: '20px', whiteSpace: 'nowrap' },
  planName:    { fontSize: '13px', color: '#5a8a99', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
  price:       { fontSize: '34px', fontWeight: 700, color: '#f0fbfa' },
  pricePeriod: { fontSize: '12px', color: '#5a8a99', marginBottom: '20px' },
  featList:    { listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 },
  feat:        { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a0cdd8', marginBottom: '10px' },


highlightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' },
highlightCard: { background: 'linear-gradient(135deg, rgba(0,200,180,0.06), rgba(0,158,142,0.02))', border: '1px solid rgba(0,200,180,0.2)', borderRadius: '16px', padding: '28px 24px' },
highlightIcon: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,200,180,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' },
highlightTag:  { display: 'inline-block', fontSize: '10px', fontWeight: 700, color: '#00c8b4', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },

  footer:      { borderTop: '1px solid #0e3347', padding: '32px 5%', textAlign: 'center' },
  footerText:  { fontSize: '12px', color: '#2a6070', margin: 0 },
};

const HIGHLIGHTS = [
  { icon: Users,    title: 'Live presence',    text: 'See exactly who\'s viewing the same task as you, in real time — like Figma, but for project management.' },
  { icon: History,  title: 'Decision history', text: 'Moving a task backward or deleting it requires a reason, building a searchable record of every "why."' },
  { icon: Rewind,   title: 'Ghost Mode',       text: 'Scrub through your project\'s entire history and watch it replay like a time-lapse.' },
  { icon: Sparkles, title: 'AI Assistant',     text: 'A context-aware chat assistant that knows your projects and can create, move, or assign tasks for you.' },
];

const FEATURES = [
  { icon: LayoutGrid,    title: 'Kanban boards',           text: 'Drag-and-drop task management across To Do, In Progress, and Done.' },
  { icon: MessageSquare, title: 'Comments & activity',     text: 'Discuss tasks in context and track every change with a full audit trail.' },
  { icon: Paperclip,     title: 'File attachments',        text: 'Upload images, PDFs, docs, and more directly onto any task.' },
  { icon: BarChart2,     title: 'Analytics dashboard',     text: 'Track completion rates, overdue tasks, and team workload at a glance.' },
  { icon: Bell,          title: 'Real-time notifications', text: 'In-app and email alerts the moment something needs your attention.' },
  { icon: Shield,        title: 'Role-based access',       text: 'Admin, member, and viewer roles keep the right people in control.' },
];
const PLANS = [
  { name: 'Free',     price: '$0',  period: 'forever',         features: ['1 project', '3 members', 'Kanban board'] },
  { name: 'Pro',      price: '$10', period: 'per user / month', features: ['20 projects', '20 members', 'Comments & files', 'Notifications'], popular: true },
  { name: 'Business', price: '$25', period: 'per user / month', features: ['Unlimited everything', 'SSO & audit logs', 'API & webhooks'] },
];

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const goApp = () => navigate(isAuthenticated ? '/dashboard' : '/login', { state: { mode: 'register' } });

  return (
    <div style={S.page}>
      {/* Nav */}
      <nav style={S.nav}>
        <span style={S.logo}>CollabFlow</span>
        <div style={S.navRight}>
          {isAuthenticated ? (
            <button style={S.navCta} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          ) : (
            <>
              <button style={S.navLink} onClick={() => navigate('/login')}>Log in</button>
              <button style={S.navCta} onClick={goApp}>Get started</button>
            </>
          )}
        </div>
      </nav>

      
      <section style={S.hero}>
        <div style={S.heroBg}>
          <Strands
            colors={['#00c8b4', '#0e7fa3', '#7C3AED']}
            count={4}
            speed={0.4}
            amplitude={1}
            waviness={1}
            thickness={0.6}
            glow={2.2}
            taper={3}
            spread={1.1}
            intensity={0.55}
            saturation={1.3}
            opacity={0.85}
            scale={1.6}
          />
        </div>
        <div style={S.heroContent}>
          <span style={S.badge}><Zap size={12} /> Built for fast-moving teams</span>
          <h1 style={S.h1}>
            Project management <span style={S.h1Accent}>that keeps up</span> with your team
          </h1>
          <p style={S.sub}>
            Boards, comments, files, and notifications in one place. CollabFlow gives your team a single source of truth — no more lost updates in chat.
          </p>
          <div style={S.heroActions}>
            <button style={S.primaryBtn} onClick={goApp}>
              {isAuthenticated ? 'Go to Dashboard' : 'Start for free'} <ArrowRight size={15} />
            </button>
            <button style={S.secondaryBtn} onClick={() => navigate('/login')}>
              {isAuthenticated ? 'Switch account' : 'Log in'}
            </button>
          </div>
        </div>
      </section>

   
<section style={S.section}>
  <div style={S.sectionHead}>
    <p style={S.sectionTag}>Why CollabFlow</p>
    <h2 style={S.sectionTitle}>Not just another Kanban board</h2>
  </div>
  <div style={S.highlightGrid}>
    {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
      <div key={title} style={S.highlightCard}>
        <div style={S.highlightIcon}><Icon size={20} color="#00c8b4" /></div>
        <h3 style={S.cardTitle}>{title}</h3>
        <p style={S.cardText}>{text}</p>
      </div>
    ))}
  </div>
</section>


<section style={S.section}>
  <div style={S.sectionHead}>
    <p style={S.sectionTag}>Features</p>
    <h2 style={S.sectionTitle}>Everything your team needs</h2>
  </div>
  <div style={S.grid}>
    {FEATURES.map(({ icon: Icon, title, text }) => (
      <div key={title} style={S.card}>
        <div style={S.cardIcon}><Icon size={20} color="#00c8b4" /></div>
        <h3 style={S.cardTitle}>{title}</h3>
        <p style={S.cardText}>{text}</p>
      </div>
    ))}
  </div>
</section>

      <section style={S.section}>
        <div style={S.sectionHead}>
          <p style={S.sectionTag}>Pricing</p>
          <h2 style={S.sectionTitle}>Simple plans that grow with you</h2>
        </div>
        <div style={S.pricingGrid}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={plan.popular ? S.priceCardHL : S.priceCard}>
              {plan.popular && <span style={S.priceBadge}>Most popular</span>}
              <p style={S.planName}>{plan.name}</p>
              <p style={S.price}>{plan.price}</p>
              <p style={S.pricePeriod}>{plan.period}</p>
              <ul style={S.featList}>
                {plan.features.map((f) => (
                  <li key={f} style={S.feat}><Check size={13} color="#00c8b4" /> {f}</li>
                ))}
              </ul>
              <button style={plan.popular ? S.primaryBtn : S.secondaryBtn} onClick={goApp}>
                Get started
              </button>
            </div>
          ))}
        </div>
      </section>

 
      <footer style={S.footer}>
        <p style={S.footerText}>© {new Date().getFullYear()} CollabFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}