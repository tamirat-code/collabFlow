import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, User, Shield, LogOut,
  HelpCircle, Info, Edit2, Camera, Loader2, AlertTriangle, X, Key, Trash2,
} from 'lucide-react';
import {
  useMe, useLogout, useUpdateProfile, useUploadAvatar,
  useChangePassword, useDeleteAccount,
} from '../hooks/useAuth';
import { useBillingInfo } from '../hooks/useBilling';
import useWorkspaceStore from '../store/workspaceStore';
import useToastStore from '../store/toastStore';
import Spinner from '../components/Spinner';


const S = {
  page:        { minHeight: '100vh', background: '#020f18' },
  topBar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #0e3347' },
  topTitle:    { fontSize: '20px', fontWeight: 600, color: '#e0f5f2' },
  backBtn:     { background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontFamily: 'inherit' },
  inner:       { maxWidth: '480px', margin: '0 auto', padding: '0 0 3rem' },
  heroCard:    { margin: '1.25rem', background: 'linear-gradient(135deg, #0a3347 0%, #051e2e 100%)', border: '1px solid #00c8b4', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '14px' },
  avatarWrap:  { position: 'relative', width: '52px', height: '52px', flexShrink: 0 },
  avatarImg:   { width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00c8b4' },
  avatarFall:  { width: '52px', height: '52px', borderRadius: '50%', background: '#0a3347', border: '2px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#00c8b4' },
  heroName:    { fontSize: '15px', fontWeight: 600, color: '#e0f5f2' },
  heroSub:     { fontSize: '12px', color: '#3a7080', marginTop: '2px' },
  editHeroBtn: { marginLeft: 'auto', background: '#0a2535', border: '1px solid #0e3347', borderRadius: '8px', padding: '7px', display: 'flex', cursor: 'pointer', color: '#00c8b4', flexShrink: 0 },
  section:     { margin: '0 1.25rem 1.25rem' },
  sectionLbl:  { fontSize: '11px', fontWeight: 600, color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '4px' },
  menuCard:    { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '14px', overflow: 'hidden' },
  menuItem:    { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #0a2535', background: 'none', border_bottom: '1px solid #0a2535', width: '100%', textAlign: 'left', fontFamily: 'inherit' },
  menuItemLast:{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer', background: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' },
  menuIcon:    { width: '36px', height: '36px', borderRadius: '10px', background: '#0a2535', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuIconRed: { width: '36px', height: '36px', borderRadius: '10px', background: '#2d0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuLabel:   { fontSize: '14px', fontWeight: 500, color: '#c0e8e4', flex: 1 },
  menuLabelRed:{ fontSize: '14px', fontWeight: 500, color: '#f87171', flex: 1 },
  menuSub:     { fontSize: '11px', color: '#3a7080', marginTop: '2px' },
  chevron:     { color: '#2a6070', flexShrink: 0 },
  // bio-data panel (slides over)
  panel:       { position: 'fixed', inset: 0, background: '#020f18', zIndex: 40, overflowY: 'auto', transform: 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.77,0,0.18,1)' },
  panelOpen:   { position: 'fixed', inset: 0, background: '#020f18', zIndex: 40, overflowY: 'auto', transform: 'translateX(0)', transition: 'transform 0.3s cubic-bezier(0.77,0,0.18,1)' },
  panelInner:  { maxWidth: '480px', margin: '0 auto', padding: '0 0 3rem' },
  panelHero:   { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.25rem 1.5rem', borderBottom: '1px solid #0e3347' },
  panelName:   { fontSize: '16px', fontWeight: 600, color: '#e0f5f2', marginTop: '12px' },
  panelEmail:  { fontSize: '12px', color: '#3a7080', marginTop: '3px' },
  panelBody:   { padding: '1.5rem 1.25rem' },
  fieldWrap:   { marginBottom: '1.25rem' },
  fieldLabel:  { display: 'block', fontSize: '12px', color: '#3a7080', marginBottom: '6px' },
  fieldInput:  { width: '100%', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  fieldInputErr:{ width: '100%', background: '#051e2e', border: '1px solid #f87171', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  fieldSelect: { width: '100%', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  fieldErr:    { fontSize: '11px', color: '#f87171', marginTop: '4px' },
  updateBtn:   { width: '100%', padding: '13px', background: '#00c8b4', border: 'none', borderRadius: '12px', color: '#020f18', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  // password panel
  pwPanel:     { position: 'fixed', inset: 0, background: '#020f18', zIndex: 40, overflowY: 'auto', transform: 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.77,0,0.18,1)' },
  pwPanelOpen: { position: 'fixed', inset: 0, background: '#020f18', zIndex: 40, overflowY: 'auto', transform: 'translateX(0)', transition: 'transform 0.3s cubic-bezier(0.77,0,0.18,1)' },
  successBox:  { background: '#061f18', border: '1px solid #00c8b4', color: '#34d399', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem' },
  errorBox:    { background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#f87171', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem' },
  // delete modal
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' },
  modal:       { background: '#051e2e', border: '1px solid #7f1d1d', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '1.5rem' },
  modalHead:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  modalTitle:  { fontSize: '16px', fontWeight: 600, color: '#f87171' },
  closeBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' },
  btnDanger:   { padding: '9px 20px', background: 'transparent', border: '1.5px solid #7f1d1d', borderRadius: '20px', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost:    { padding: '9px 20px', background: 'transparent', border: '1.5px solid #0e3347', borderRadius: '20px', color: '#a0cdd8', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
  btnRow:      { display: 'flex', gap: '10px', marginTop: '1.25rem' },
  avatarCamBtn:{ position: 'absolute', bottom: '-2px', right: '-2px', width: '28px', height: '28px', borderRadius: '50%', background: '#00c8b4', border: '2px solid #020f18', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
};

function AvatarDisplay({ user, size = 52, showBorder = true }) {
  const borderStyle = showBorder ? '2px solid #00c8b4' : '2px solid #0e3347';
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: borderStyle }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#0a3347', border: borderStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#00c8b4' }}>
      {user?.name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const { activeWorkspaceId } = useWorkspaceStore();
  const addToast = useToastStore.getState().addToast;

  const { data: user, isLoading } = useMe();
  const { data: billing } = useBillingInfo(activeWorkspaceId);
  const { mutate: logout } = useLogout();
  const { mutate: updateProfile, isPending: saving, error: saveError, reset: resetSave } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar();
  const { mutate: changePassword, isPending: savingPw, error: pwError, isSuccess: pwSuccess, reset: resetPw } = useChangePassword();
  const { mutate: deleteAccount, isPending: deleting, error: deleteError } = useDeleteAccount();

  // panels
  const [showBio, setShowBio]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // bio form state
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob]       = useState('');
  const [nameErr, setNameErr] = useState('');
  const [bioSuccess, setBioSuccess] = useState(false);

  // password form state
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwErrors, setPwErrors]     = useState({});

  // delete state
  const [deletePw, setDeletePw] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setGender(user.gender || '');
      setDob(user.dob ? new Date(user.dob).toISOString().split('T')[0] : '');
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { addToast('Only JPG, PNG, or WEBP allowed'); return; }
    if (file.size > 3 * 1024 * 1024) { addToast('Image must be under 3MB'); return; }
    uploadAvatar(file, {
      onSuccess: () => addToast('Avatar updated.'),
      onError: (err) => addToast(err.message),
    });
    e.target.value = '';
  };

  const handleBioSave = (e) => {
    e.preventDefault();
    setNameErr(''); setBioSuccess(false); resetSave();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) { setNameErr('Name must be at least 2 characters'); return; }
    if (trimmed.length > 50) { setNameErr('Name must be under 50 characters'); return; }
    updateProfile({ name: trimmed, phone, gender, dob }, {
      onSuccess: () => { setBioSuccess(true); },
      onError: (err) => addToast(err.message),
    });
  };

  const handlePwSave = (e) => {
    e.preventDefault();
    resetPw();
    const errs = {};
    if (user?.hasPassword && !currentPw) errs.currentPw = 'Current password required';
    if (!newPw || newPw.length < 6) errs.newPw = 'Must be at least 6 characters';
    if (!confirmPw) errs.confirmPw = 'Please confirm your password';
    else if (newPw !== confirmPw) errs.confirmPw = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    changePassword({ currentPassword: currentPw, newPassword: newPw }, {
      onSuccess: () => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); },
    });
  };

  const handleDelete = () => {
    deleteAccount(deletePw, {
      onSuccess: () => navigate('/login'),
    });
  };

  const handleLogout = () => {
    logout(undefined, { onSuccess: () => navigate('/login') });
  };

  if (isLoading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} color="#00c8b4" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={S.page}>

    
      <div style={{ opacity: showBio || showPw ? 0 : 1, transition: 'opacity 0.2s' }}>
       
        <div style={S.topBar}>
         
          <span style={S.topTitle}>Profile</span>
          <div style={{ width: '40px' }} />
        </div>

        <div style={S.inner}>
          {/* Hero card */}
          <div style={S.heroCard}>
            <div style={S.avatarWrap}>
              <AvatarDisplay user={user} size={52} />
            </div>
            <div>
              <p style={S.heroName}>{user?.name}</p>
              <p style={S.heroSub}>@{user?.email?.split('@')[0]}</p>
            </div>
            <button style={S.editHeroBtn} onClick={() => setShowBio(true)}>
              <Edit2 size={15} />
            </button>
          </div>

          {/* Account section */}
          <div style={S.section}>
            <p style={S.sectionLbl}></p>
            <div style={S.menuCard}>

              <button
                style={{ ...S.menuItem, borderBottom: '1px solid #0a2535', background: 'none', border: 'none', borderBottom: '1px solid #0a2535', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setShowBio(true)}
              >
                <div style={S.menuIcon}><User size={16} color="#00c8b4" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabel}>My Account</p>
                  <p style={S.menuSub}>Make changes to your account</p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

              <button
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #0a2535', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setShowPw(true)}
              >
                <div style={S.menuIcon}><Key size={16} color="#00c8b4" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabel}>{user?.hasPassword ? 'Change Password' : 'Set Password'}</p>
                  <p style={S.menuSub}>Update your login password</p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

              <button
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #0a2535', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => navigate('/billing')}
              >
                <div style={S.menuIcon}><Shield size={16} color="#00c8b4" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabel}>Plan & Billing</p>
                  <p style={S.menuSub}>
                    <span style={{ background: 'rgba(0,200,180,0.1)', color: '#00c8b4', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', textTransform: 'capitalize' }}>
                      {billing?.plan || 'free'}
                    </span>
                  </p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

              <button
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <div style={S.menuIconRed}><LogOut size={16} color="#f87171" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabelRed}>Log out</p>
                  <p style={S.menuSub}>Sign out of your account</p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

            </div>
          </div>

          {/* More section */}
          <div style={S.section}>
            <p style={S.sectionLbl}>More</p>
            <div style={S.menuCard}>

              <button
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #0a2535', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => {}}
              >
                <div style={S.menuIcon}><HelpCircle size={16} color="#3a7080" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabel}>Help & Support</p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

              <button
                style={{ background: 'none', border: 'none', borderBottom: '1px solid #0a2535', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => {}}
              >
                <div style={S.menuIcon}><Info size={16} color="#3a7080" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabel}>About App</p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

              <button
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setShowDelete(true)}
              >
                <div style={S.menuIconRed}><Trash2 size={16} color="#f87171" /></div>
                <div style={{ flex: 1 }}>
                  <p style={S.menuLabelRed}>Delete Account</p>
                  <p style={S.menuSub}>Permanently remove your account</p>
                </div>
                <ChevronRight size={16} color="#2a6070" />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ── BIO-DATA PANEL ── */}
      <div style={showBio ? S.panelOpen : S.panel}>
        <div style={S.panelInner}>
          {/* Top bar */}
          <div style={S.topBar}>
            <button style={S.backBtn} onClick={() => { setShowBio(false); setBioSuccess(false); resetSave(); }}>
              <ArrowLeft size={16} />
            </button>
            <span style={S.topTitle}>Bio-data</span>
            <div style={{ width: '40px' }} />
          </div>

          {/* Avatar hero */}
          <div style={S.panelHero}>
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <AvatarDisplay user={user} size={72} />
              <button style={S.avatarCamBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading
                  ? <Loader2 size={13} color="#020f18" className="animate-spin" />
                  : <Camera size={13} color="#020f18" />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <p style={S.panelName}>{user?.name}</p>
            <p style={S.panelEmail}>{user?.email}</p>
          </div>

          {/* Bio form */}
          <form onSubmit={handleBioSave} style={S.panelBody}>
            {bioSuccess && <div style={S.successBox}>Profile updated successfully.</div>}
            {saveError && <div style={S.errorBox}>{saveError.message}</div>}

            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>What's your name?</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setNameErr(''); setBioSuccess(false); }}
                style={nameErr ? S.fieldInputErr : S.fieldInput}
                placeholder="Full name"
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = nameErr ? '#f87171' : '#0e3347'}
              />
              {nameErr && <p style={S.fieldErr}>{nameErr}</p>}
            </div>

            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>Phone number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={S.fieldInput}
                placeholder="e.g. +251 91 234 5678"
                type="tel"
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = '#0e3347'}
              />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>Select your gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={S.fieldSelect}
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = '#0e3347'}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>What is your date of birth?</label>
              <input
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={S.fieldInput}
                type="date"
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = '#0e3347'}
              />
            </div>

           <button type="submit" disabled={saving} style={{ ...S.updateBtn, opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
  {saving ? (<><Spinner size={14} color="#020f18" /> Updating...</>) : 'Update Profile'}
</button>
          </form>
        </div>
      </div>

      {/* ── PASSWORD PANEL ── */}
      <div style={showPw ? S.pwPanelOpen : S.pwPanel}>
        <div style={S.panelInner}>
          <div style={S.topBar}>
            <button style={S.backBtn} onClick={() => { setShowPw(false); resetPw(); setPwErrors({}); }}>
              <ArrowLeft size={16} />
            </button>
            <span style={S.topTitle}>{user?.hasPassword ? 'Change Password' : 'Set Password'}</span>
            <div style={{ width: '40px' }} />
          </div>

          <form onSubmit={handlePwSave} style={S.panelBody}>
            {pwSuccess && <div style={S.successBox}>Password updated successfully.</div>}
            {pwError && <div style={S.errorBox}>{pwError.message}</div>}

            {user?.hasPassword && (
              <div style={S.fieldWrap}>
                <label style={S.fieldLabel}>Current password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwErrors(p => ({ ...p, currentPw: '' })); }}
                  style={pwErrors.currentPw ? S.fieldInputErr : S.fieldInput}
                  placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = '#00c8b4'}
                  onBlur={e => e.target.style.borderColor = pwErrors.currentPw ? '#f87171' : '#0e3347'}
                />
                {pwErrors.currentPw && <p style={S.fieldErr}>{pwErrors.currentPw}</p>}
              </div>
            )}

            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>New password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwErrors(p => ({ ...p, newPw: '' })); }}
                style={pwErrors.newPw ? S.fieldInputErr : S.fieldInput}
                placeholder="At least 6 characters"
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = pwErrors.newPw ? '#f87171' : '#0e3347'}
              />
              {pwErrors.newPw && <p style={S.fieldErr}>{pwErrors.newPw}</p>}
            </div>

            <div style={S.fieldWrap}>
              <label style={S.fieldLabel}>Confirm new password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setPwErrors(p => ({ ...p, confirmPw: '' })); }}
                style={pwErrors.confirmPw ? S.fieldInputErr : S.fieldInput}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = '#00c8b4'}
                onBlur={e => e.target.style.borderColor = pwErrors.confirmPw ? '#f87171' : '#0e3347'}
              />
              {pwErrors.confirmPw && <p style={S.fieldErr}>{pwErrors.confirmPw}</p>}
            </div>

           <button type="submit" disabled={savingPw} style={{ ...S.updateBtn, opacity: savingPw ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
  {savingPw ? (<><Spinner size={14} color="#020f18" /> Updating...</>) : 'Update Password'}
</button>

          </form>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {showDelete && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setShowDelete(false)}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <span style={S.modalTitle}>Delete account</span>
              <button style={S.closeBtn} onClick={() => { setShowDelete(false); setDeletePw(''); }}>
                <X size={18} />
              </button>
            </div>

            {deleteError && <div style={{ ...S.errorBox, marginBottom: '1rem' }}>{deleteError.message}</div>}

            <p style={{ fontSize: '13px', color: '#7fa8b3', lineHeight: 1.6, marginBottom: '1rem' }}>
              This permanently deletes your account and all workspaces you solely own. This cannot be undone.
            </p>

            {user?.hasPassword && (
              <input
                type="password"
                value={deletePw}
                onChange={(e) => setDeletePw(e.target.value)}
                style={S.fieldInput}
                placeholder="Enter your password to confirm"
                autoFocus
              />
            )}

            <div style={S.btnRow}>
             <button style={{ ...S.btnDanger, opacity: deleting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleDelete} disabled={deleting || (user?.hasPassword && !deletePw)}>
  {deleting ? (<><Spinner size={13} color="#f87171" /> Deleting...</>) : 'Yes, delete my account'}
</button>
              <button style={S.btnGhost} onClick={() => { setShowDelete(false); setDeletePw(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}