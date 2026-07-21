import { useState, useEffect } from "react";
import {
  TbUser,
  TbMail,
  TbShield,
  TbCamera,
  TbEdit,
  TbLoader,
  TbLock,
  TbEye,
  TbEyeOff,
} from "react-icons/tb";
import { useAuthStore } from "../../store/authStore";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";
import { FormField } from "../../components/ui/FormField";
import { Button } from "../../components/ui/ButtonProps";
import { useUpdateUser } from "../../features/hooks/useUser";
import { toast } from "../../utils/toast";

export default function Profile() {
  const { user } = useAuthStore();
  const { mutate: updateUser, isPending } = useUpdateUser();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ id: user?.id!, data: formData });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    updateUser(
      { id: user?.id!, data: { password: passwordData.newPassword } },
      {
        onSuccess: () => {
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setIsChangingPassword(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || "", email: user?.email || "" });
    setIsEditing(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <TbLoader size={40} className="text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FormLayout
        title="Profile"
        subtitle="Manage your account information"
        icon={TbUser}
        onSubmit={isEditing ? handleSave : isChangingPassword ? handlePasswordChange : (e) => e.preventDefault()}
        onCancel={isEditing ? handleCancel : isChangingPassword ? () => { setIsChangingPassword(false); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); } : undefined}
        isPending={isPending}
        submitLabel={isChangingPassword ? "Update Password" : "Save Changes"}
        cancelLabel="Cancel"
      >
        {/* Avatar Section */}
        {/* <div className="flex flex-col items-center py-2">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-brand to-purple-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand/20">
              {getInitials(formData.name)}
            </div>
            <button className="absolute -bottom-2 -right-2 w-9 h-9 bg-white border-2 border-border rounded-xl flex items-center justify-center hover:bg-surface-hover transition-all shadow-sm">
              <TbCamera size={16} className="text-text-secondary" />
            </button>
          </div>
          {!isEditing && !isChangingPassword && (
            <>
              <h2 className="text-xl font-bold text-text-primary mt-4">{formData.name}</h2>
              <p className="text-text-muted text-sm">{user.role || "Admin"}</p>
            </>
          )}
        </div> */}

        {/* Account Information */}
        {!isChangingPassword && (
          <FormSection
            icon={TbUser}
            title="Account Information"
            subtitle={isEditing ? "Edit your details below" : "Your personal details"}
            variant={isEditing ? "brand" : "muted"}
            action={
              !isEditing ? (
                <Button variant="secondary" size="sm" icon={TbEdit} onClick={() => setIsEditing(true)} type="button">
                  Edit
                </Button>
              ) : undefined
            }
          >
            {isEditing ? (
              <div className="space-y-4">
                <FormField label="Full Name" icon={TbUser} required>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </FormField>

                <FormField label="Email Address" icon={TbMail} required>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </FormField>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-surface-hover rounded-2xl">
                  <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                    <TbUser size={20} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">Full Name</p>
                    <p className="text-sm font-semibold text-text-primary">{formData.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-surface-hover rounded-2xl">
                  <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center shrink-0">
                    <TbMail size={20} className="text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">Email Address</p>
                    <p className="text-sm font-semibold text-text-primary">{formData.email}</p>
                  </div>
                </div>
              </div>
            )}
          </FormSection>
        )}

        {/* Change Password */}
        {isChangingPassword && (
          <FormSection icon={TbLock} title="Change Password" subtitle="Enter your current and new password">
            <div className="space-y-4">
              <FormField label="Current Password" icon={TbLock} required>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full pl-11 pr-12 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showPassword ? <TbEyeOff size={16} /> : <TbEye size={16} />}
                  </button>
                </div>
              </FormField>

              <FormField label="New Password" icon={TbLock} required>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-12 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                </div>
              </FormField>

              <FormField label="Confirm New Password" icon={TbLock} required>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-12 py-3 bg-surface-hover rounded-2xl text-sm text-text-primary placeholder:text-text-muted border-2 border-transparent focus:border-brand/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showConfirmPassword ? <TbEyeOff size={16} /> : <TbEye size={16} />}
                  </button>
                </div>
              </FormField>
            </div>
          </FormSection>
        )}

        {/* Role & Actions */}
        {!isEditing && !isChangingPassword && (
          <>
            <FormSection icon={TbShield} title="Account Details" variant="muted">
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-surface-hover rounded-2xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <TbShield size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">Role</p>
                    <p className="text-sm font-semibold text-text-primary">{user.role || "Admin"}</p>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Change Password Button */}
            <div className="flex justify-center">
              <Button variant="secondary" icon={TbLock} onClick={() => setIsChangingPassword(true)} type="button">
                Change Password
              </Button>
            </div>
          </>
        )}
      </FormLayout>
    </div>
  );
}