const M = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' },
  card:       { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '1.5rem' },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  title:      { fontSize: '16px', fontWeight: 500, color: '#e0f5f2' },
  closeBtn:   { background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' },
  label:      { display: 'block', fontSize: '12px', color: '#3a7080', marginBottom: '6px' },
  input:      { width: '100%', background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit' },
  error:      { fontSize: '11px', color: '#f87171', marginTop: '4px' },
  btn:        { width: '100%', padding: '9px', background: 'transparent', border: '1.5px solid #00c8b4', borderRadius: '20px', color: '#00c8b4', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '0.5rem', fontFamily: 'inherit' },
  errBox:     { background: '#2d0a0a', color: '#f87171', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' },
  successBox: { background: '#061f18', color: '#34d399', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' },
};

export default M;