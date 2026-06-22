import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, AlertTriangle, X } from 'lucide-react';
import { useMe, useUpdateProfile, useUploadAvatar, useChangePassword, useDeleteAccount } from '../hooks/useAuth';
import { useBillingInfo } from '../hooks/useBilling';
import useWorkspaceStore from '../store/workspaceStore';

const S = {
  page:       { minHeight: '100vh', background: '#020f18', padding: '2rem 1rem' },
  inner:      { maxWidth: '640px', margin: '0 auto' },
  back:       { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3a7080', fontSize: '13px', cursor: 'pointer', marginBottom: '2rem', fontFamily: 'inherit' },
  heading:    { fontSize: '24px', fontWeight: 600, color: '#e0f5f2', marginBottom: '6px' },
  sub:        { fontSize: '14px', color: '#3a7080', marginBottom: '2rem' },
  card:       { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem' },
  cardTitle:  { fontSize: '15px', fontWeight: 600, color: '#e0f5f2', marginBottom: '1.25rem' },
  avatarRow:  { display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' },
  avatarWrap: { position: 'relative', width: '72px', height: '72px', flexShrink: 0 },
  avatar:     { width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0e3347' },
  avatarFallback: { width: '72px', height: '72px', borderRadius: '50%', background: '#0a3347', border: '2px solid #00c8b4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, color: '#00c8b4' },
  avatarBtn:  { position: 'absolute', bottom: '-2px', right: '-2px', width: '28px', height: '28px', borderRadius: '50%', background: '#00c8b4', border: '2px solid #051e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  avatarMeta: { fontSize: '13px', color: '#3a7080' },
  avatarName: { fontSize: '16px', fontWeight: 600, color: '#e0f5f2', marginBottom: '2px' },
  row:        { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  infoBlock:  { flex: '1 1 140px' },
  infoLabel:  { fontSize: '11px', color: '#2a6070', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' },
  infoValue:  { fontSize: '14px', color: '#e0f5f2', fontWeight: 500 },
  planBadge:  { display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', background: 'rgba(0,200,180,0.1)', color: '#00c8b4', textTransform: 'capitalize' },
  label:      { display: 'block', fontSize: '12px', color: '#3a7080', marginBottom: '6px', marginTop: '1rem' },
  input:      { width: '100%', background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  inputErr:   { width: '100%', background: '#071520', border: '1px solid #f87171', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  inputDis:   { width: '100%', background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#3a7080', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', cursor: 'not-allowed' },
  fieldErr:   { fontSize: '11px', color: '#f87171', marginTop: '4px' },
  btn:        { padding: '9px 20px', background: '#00c8b4', border: 'none', borderRadius: '20px', color: '#020f18', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  btnGhost:   { padding: '9px 20px', background: 'transparent', border: '1.5px solid #0e3347', borderRadius: '20px', color: '#a0cdd8', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger:  { padding: '9px 20px', background: 'transparent', border: '1.5px solid #7f1d1d', borderRadius: '20px', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnRow:     { display: 'flex', gap: '10px', marginTop: '1.5rem' },
  successBox: { background: '#061f18', border: '1px solid #00c8b4', color: '#34d399', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginTop: '1rem' },
  errorBox:   { background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#f87171', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginTop: '1rem' },
  dangerCard: { background: '#051e2e', border: '1px solid #7f1d1d', borderRadius: '16px', padding: '1.75rem' },
  dangerTitle:{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 600, color: '#f87171', marginBottom: '8px' },
  dangerText: { fontSize: '13px', color: '#7fa8b3', lineHeight: 1.6, marginBottom: '1.25rem' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' },
  modal:      { background: '#051e2e', border: '1px solid #7f1d1d', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '1.5rem' },
  modalHead:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  modalTitle: { fontSize: '16px', fontWeight: 600, color: '#f87171' },
  closeBtn:   { background: 'none', border: 'none', cursor: 'pointer', color: '#3a7080', display: 'flex' },
};

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: user, isLoading: userLoading } = useMe();
  const { data: billing } = useBillingInfo(activeWorkspaceId);

  const { mutate: updateProfile, isPending: savingProfile, error: profileError, reset: resetProfile } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: uploadingAvatar, error: avatarError } = useUploadAvatar();
  const { mutate: changePassword, isPending: savingPassword, error: passwordError, isSuccess: passwordSuccess, reset: resetPasswordMutation } = useChangePassword();
  const { mutate: deleteAccount, isPending: deletingAccount, error: deleteError } = useDeleteAccount();

  
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErrors, setPwErrors] = useState({});

  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

 
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  
  const hasPassword = user?.hasPassword;

  

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG, or WEBP images are allowed');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('Image must be under 3MB');
      return;
    }
    uploadAvatar(file);
    e.target.value = '';
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setNameError('');
    setProfileSuccess(false);
    resetProfile();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 50) {
      setNameError('Name must be under 50 characters');
      return;
    }
    if (trimmed === user?.name) {
      setNameError('No changes to save');
      return;
    }

    updateProfile({ name: trimmed }, {
      onSuccess: () => setProfileSuccess(true),
    });
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    resetPasswordMutation();
    const errors = {};

    if (hasPassword && !currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Must be at least 6 characters';
    } else if (newPassword.length > 72) {
      errors.newPassword = 'Must be under 72 characters';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (hasPassword && newPassword && newPassword === currentPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setPwErrors({});
    changePassword({ currentPassword, newPassword }, {
      onSuccess: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
    });
  };

  const handleDeleteConfirm = () => {
    deleteAccount(deletePassword, {
      onSuccess: () => navigate('/'),
    });
  };

  if (userLoading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} color="#00c8b4" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <button style={S.back} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={14} /> Back to dashboard
        </button>

        <h1 style={S.heading}>Profile & Settings</h1>
        <p style={S.sub}>Manage your account information and preferences.</p>

        
        <div style={S.card}>
          <p style={S.cardTitle}>Profile</p>

          <div style={S.avatarRow}>
            <div style={S.avatarWrap}>
              {user?.avatar
                ? <img src={user.avatar} alt={user.name} style={S.avatar} />
                : <div style={S.avatarFallback}>{user?.name?.[0]?.toUpperCase()}</div>
              }
              <button style={S.avatarBtn} onClick={handleAvatarClick} disabled={uploadingAvatar} title="Change avatar">
                {uploadingAvatar
                  ? <Loader2 size={13} color="#020f18" className="animate-spin" />
                  : <Camera size={13} color="#020f18" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <div>
              <p style={S.avatarName}>{user?.name}</p>
              <p style={S.avatarMeta}>{user?.email}</p>
            </div>
          </div>

          {avatarError && <div style={S.errorBox}>{avatarError.message}</div>}

          <div style={S.row}>
            <div style={S.infoBlock}>
              <p style={S.infoLabel}>Plan</p>
              <span style={S.planBadge}>{billing?.plan || 'free'}</span>
            </div>
            <div style={S.infoBlock}>
              <p style={S.infoLabel}>Joined</p>
              <p style={S.infoValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <label style={S.label}>Name</label>
            <input
              style={nameError ? S.inputErr : S.input}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); setProfileSuccess(false); resetProfile(); }}
              placeholder="Your name"
              maxLength={50}
            />
            {nameError && <p style={S.fieldErr}>{nameError}</p>}

            <label style={S.label}>Email</label>
            <input style={S.inputDis} value={user?.email || ''} disabled />

            {profileSuccess && <div style={S.successBox}>Profile updated successfully.</div>}
            {profileError && <div style={S.errorBox}>{profileError.message}</div>}

            <div style={S.btnRow}>
              <button type="submit" style={{ ...S.btn, opacity: savingProfile ? 0.7 : 1 }} disabled={savingProfile}>
                {savingProfile && <Loader2 size={14} className="animate-spin" />}
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        
        <div style={S.card}>
          <p style={S.cardTitle}>{hasPassword ? 'Change password' : 'Set a password'}</p>
          <p style={{ fontSize: '13px', color: '#3a7080', marginBottom: '1rem' }}>
            {hasPassword
              ? 'Update your password. You\'ll need your current password to confirm.'
              : user?.googleId
                ? 'Your account uses Google sign-in. You can also set a password for email/password login.'
                : 'Set a password for your account.'}
          </p>

          {passwordSuccess && <div style={S.successBox}>Password updated successfully.</div>}
          {passwordError && <div style={S.errorBox}>{passwordError.message}</div>}

          <form onSubmit={handlePasswordSave}>
            {hasPassword && (
              <div>
                <label style={S.label}>Current password</label>
                <input
                  type="password"
                  style={pwErrors.currentPassword ? S.inputErr : S.input}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPwErrors(p => ({ ...p, currentPassword: '' })); resetPasswordMutation(); }}
                  placeholder="••••••••"
                />
                {pwErrors.currentPassword && <p style={S.fieldErr}>{pwErrors.currentPassword}</p>}
              </div>
            )}

            <div>
              <label style={S.label}>New password</label>
              <input
                type="password"
                style={pwErrors.newPassword ? S.inputErr : S.input}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwErrors(p => ({ ...p, newPassword: '' })); resetPasswordMutation(); }}
                placeholder="At least 6 characters"
              />
              {pwErrors.newPassword && <p style={S.fieldErr}>{pwErrors.newPassword}</p>}
            </div>

            <div>
              <label style={S.label}>Confirm new password</label>
              <input
                type="password"
                style={pwErrors.confirmPassword ? S.inputErr : S.input}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPwErrors(p => ({ ...p, confirmPassword: '' })); }}
                placeholder="••••••••"
              />
              {pwErrors.confirmPassword && <p style={S.fieldErr}>{pwErrors.confirmPassword}</p>}
            </div>

            <div style={S.btnRow}>
              <button
                type="submit"
                style={{ ...S.btn, opacity: savingPassword ? 0.7 : 1 }}
                disabled={savingPassword}
              >
                {savingPassword && <Loader2 size={14} className="animate-spin" />}
                {savingPassword ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

        
        <div style={S.dangerCard}>
          <p style={S.dangerTitle}><AlertTriangle size={16} /> Delete account</p>
          <p style={S.dangerText}>
            Permanently deletes your account and all workspaces you solely own (projects, tasks,
            comments, files). Workspaces you share with others stay intact — you'll just be removed
            as a member. This cannot be undone.
          </p>
          <button style={S.btnDanger} onClick={() => setShowDeleteModal(true)}>
            Delete my account
          </button>
        </div>
      </div>

     
      {showDeleteModal && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div style={S.modal}>
            <div style={S.modalHead}>
              <span style={S.modalTitle}>Confirm account deletion</span>
              <button style={S.closeBtn} onClick={() => setShowDeleteModal(false)}><X size={18} /></button>
            </div>

            {deleteError && <div style={{ ...S.errorBox, marginTop: 0, marginBottom: '1rem' }}>{deleteError.message}</div>}

            <p style={{ ...S.dangerText, marginBottom: '1rem' }}>
              {hasPassword
                ? 'Enter your password to confirm. This action is permanent and cannot be undone.'
                : 'This action is permanent and cannot be undone.'}
            </p>

            {hasPassword && (
              <input
                type="password"
                style={S.input}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your current password"
                autoFocus
              />
            )}

            <div style={{ ...S.btnRow, marginTop: '1.25rem' }}>
              <button
                style={{ ...S.btnDanger, opacity: deletingAccount ? 0.7 : 1 }}
                onClick={handleDeleteConfirm}
                disabled={deletingAccount || (hasPassword && !deletePassword)}
              >
                {deletingAccount ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button style={S.btnGhost} onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}