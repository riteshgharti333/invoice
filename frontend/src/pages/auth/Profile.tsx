import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbArrowLeft, TbUser, TbMail, TbShield, TbCamera, TbCheck, TbEdit } from 'react-icons/tb';

const mockProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
  avatar: null,
  phone: '+91 98765 43210',
  joinedAt: '2024-01-15',
};

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockProfile.name,
    email: mockProfile.email,
    phone: mockProfile.phone,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 800);
  };

  const handleCancel = () => {
    setFormData({
      name: mockProfile.name,
      email: mockProfile.email,
      phone: mockProfile.phone,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
        >
          <TbArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar Card */}
        <div className="bg-white rounded-2xl border border-border p-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {mockProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-brand/25">
                <TbCamera size={16} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-text-primary mt-4">{mockProfile.name}</h2>
            <p className="text-text-secondary text-sm">{mockProfile.role}</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-light mb-5">
            <h2 className="font-semibold text-text-primary">Account Information</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-light rounded-lg transition-colors"
              >
                <TbEdit size={16} />
                Edit
              </button>
            ) : null}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Name</label>
                <div className="relative">
                  <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <div className="relative">
                  <TbMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
                <div className="relative">
                  <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand/25 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                  <TbUser size={20} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Name</p>
                  <p className="text-sm font-medium text-text-primary truncate">{mockProfile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center shrink-0">
                  <TbMail size={20} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm font-medium text-text-primary truncate">{mockProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                  <TbUser size={20} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm font-medium text-text-primary truncate">{mockProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <TbShield size={20} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Role</p>
                  <p className="text-sm font-medium text-text-primary">{mockProfile.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <TbCheck size={20} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted">Member Since</p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(mockProfile.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium animate-slide-up z-50">
            <TbCheck size={18} />
            Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}