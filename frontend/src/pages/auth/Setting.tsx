import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TbCheck } from 'react-icons/tb';
import { toast } from '../../utils/toast';

import av1 from "../../../public/avatars/av1.png"
import av2 from "../../../public/avatars/av2.png"
import av3 from "../../../public/avatars/av3.png"
import av4 from "../../../public/avatars/av4.png"
import av5 from "../../../public/avatars/av5.png"
import av6 from "../../../public/avatars/av6.png"

const avatarOptions = [
  { id: 'av1', name: 'Avatar 1', src: av1 },
  { id: 'av2', name: 'Avatar 2', src: av2 },
  { id: 'av3', name: 'Avatar 3', src: av3 },
  { id: 'av4', name: 'Avatar 4', src: av4 },
  { id: 'av5', name: 'Avatar 5', src: av5 },
  { id: 'av6', name: 'Avatar 6', src: av6 },
];

const Setting = () => {
  const [selectedAvatar, setSelectedAvatar] = useState('av1');

  useEffect(() => {
    const saved = localStorage.getItem('userAvatar');
    if (saved) {
      const { avatarId } = JSON.parse(saved);
      setSelectedAvatar(avatarId || 'av1');
    }
  }, []);

  const saveAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem('userAvatar', JSON.stringify({ avatarId }));
    toast.success('Avatar updated!');
  };

  const currentAvatar = avatarOptions.find(a => a.id === selectedAvatar);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">Choose your profile avatar</p>
      </div>

      <div className="space-y-8">
        {/* Current Avatar Preview */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Current Avatar</h2>
          
          <div className="flex items-center gap-6">
            <img
              src={currentAvatar?.src}
              alt={currentAvatar?.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            />
            <div>
              <p className="text-sm font-medium text-text-primary">{currentAvatar?.name}</p>
              <p className="text-xs text-text-muted mt-1">This appears on your profile</p>
            </div>
          </div>
        </div>

        {/* Choose Avatar */}
        <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Choose Avatar</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {avatarOptions.map((avatar) => (
              <motion.button
                key={avatar.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveAvatar(avatar.id)}
                className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedAvatar === avatar.id
                    ? 'border-brand bg-brand-light/10 shadow-md'
                    : 'border-border hover:border-brand/50 hover:bg-surface-hover'
                }`}
              >
                <img
                  src={avatar.src}
                  alt={avatar.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <span className="text-xs font-medium text-text-secondary">{avatar.name}</span>
                {selectedAvatar === avatar.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                    <TbCheck size={12} className="text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => toast.success('Settings saved!')}
          className="w-full py-3.5 bg-brand text-white rounded-2xl font-semibold hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
        >
          <TbCheck size={20} />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Setting;