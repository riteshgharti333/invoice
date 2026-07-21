import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TbCheck, TbUser, TbCamera } from "react-icons/tb";
import { toast } from "../../utils/toast";
import { FormLayout } from "../../components/ui/FormLayout";
import { FormSection } from "../../components/ui/FormSection";

import av1 from "../../../public/avatars/av1.png";
import av2 from "../../../public/avatars/av2.png";
import av3 from "../../../public/avatars/av3.png";
import av4 from "../../../public/avatars/av4.png";
import av5 from "../../../public/avatars/av5.png";
import av6 from "../../../public/avatars/av6.png";

const avatarOptions = [
  { id: "av1", name: "Avatar 1", src: av1 },
  { id: "av2", name: "Avatar 2", src: av2 },
  { id: "av3", name: "Avatar 3", src: av3 },
  { id: "av4", name: "Avatar 4", src: av4 },
  { id: "av5", name: "Avatar 5", src: av5 },
  { id: "av6", name: "Avatar 6", src: av6 },
];

export default function Setting() {
  const [selectedAvatar, setSelectedAvatar] = useState("av1");

  useEffect(() => {
    const saved = localStorage.getItem("userAvatar");
    if (saved) {
      const { avatarId } = JSON.parse(saved);
      setSelectedAvatar(avatarId || "av1");
    }
  }, []);

  const saveAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem("userAvatar", JSON.stringify({ avatarId }));
    toast.success("Avatar updated!");
  };

  const currentAvatar = avatarOptions.find((a) => a.id === selectedAvatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved!");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <FormLayout
        title="Settings"
        subtitle="Choose your profile avatar"
        icon={TbUser}
        onSubmit={handleSubmit}
        submitLabel="Save Settings"
      >
        {/* Current Avatar Preview */}
        <FormSection
          icon={TbCamera}
          title="Current Avatar"
          subtitle="This appears on your profile and header"
        >
          <div className="flex items-center gap-5 p-4 bg-surface-hover rounded-2xl">
            <img
              src={currentAvatar?.src}
              alt={currentAvatar?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {currentAvatar?.name}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Click an avatar below to change
              </p>
            </div>
          </div>
        </FormSection>

        {/* Choose Avatar */}
        <FormSection
          icon={TbUser}
          title="Choose Avatar"
          subtitle="Select from available options"
          variant="muted"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {avatarOptions.map((avatar) => (
              <motion.button
                key={avatar.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => saveAvatar(avatar.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedAvatar === avatar.id
                    ? "border-brand bg-brand-light/10 shadow-md"
                    : "border-border hover:border-brand/50 hover:bg-surface-hover"
                }`}
              >
                <img
                  src={avatar.src}
                  alt={avatar.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <span className="text-xs font-medium text-text-secondary">
                  {avatar.name}
                </span>
                {selectedAvatar === avatar.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                    <TbCheck size={12} className="text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </FormSection>
      </FormLayout>
    </div>
  );
}