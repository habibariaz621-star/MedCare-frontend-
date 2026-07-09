'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, User } from 'lucide-react';
import { getInitials, readImageAsDataUrl } from '@/lib/profileImage';
import { toast } from '@/lib/toast';

interface ProfileAvatarUploadProps {
  name: string;
  avatarUrl?: string;
  onChange: (url: string) => void;
  editable?: boolean;
  size?: 'md' | 'lg';
}

export default function ProfileAvatarUpload({
  name,
  avatarUrl,
  onChange,
  editable = true,
  size = 'lg',
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dimensions = size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-lg';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid image');
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${dimensions} rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg shadow-violet-500/20 bg-gradient-to-br from-violet-500 to-fuchsia-500`}>
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} fill className="object-cover" unoptimized />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-white font-bold ${textSize}`}>
            {getInitials(name) || <User className="w-8 h-8" />}
          </div>
        )}
        {editable && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Change profile photo"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
          >
            {avatarUrl ? 'Change photo' : 'Upload photo'}
          </button>
        </>
      )}
    </div>
  );
}
