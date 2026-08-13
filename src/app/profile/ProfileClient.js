"use client";

import { useState, useRef, useEffect } from "react";
import { updateProfile, toggleNotifications, requestChangeEmailOtp, verifyChangeEmailOtp, requestDeleteAccountOtp, verifyDeleteAccountOtp } from "./actions";
import { User, Trash2, Bell, Shield, Mail, Upload, Loader2, KeyRound, Paintbrush } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useColorTheme } from "@/components/ThemeProvider";

export default function ProfileClient({ user }) {
  const router = useRouter();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const fileInputRef = useRef(null);
  const [deviceInfo, setDeviceInfo] = useState({ os: 'Current Device' });

  // Email Change State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState(1); // 1: Enter new email, 2: Enter OTP
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const emailInputRefs = useRef([]);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1: Confirm intent, 2: Enter OTP
  const [deleteOtp, setDeleteOtp] = useState(["", "", "", "", "", ""]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const deleteInputRefs = useRef([]);

  // Sound Settings State
  const [taskDoneSound, setTaskDoneSound] = useState('sound-1');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('task_done_sound');
      if (saved) setTaskDoneSound(saved);
    }
  }, []);

  const handleSoundChange = (val) => {
    setTaskDoneSound(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('task_done_sound', val);
      if (val !== 'none') {
        const audio = new Audio(`/Sounds/MarkAsRead/${val}.mp3`);
        audio.play().catch(e => console.error(e));
      }
    }
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    let os = 'Unknown Device';
    if (ua.indexOf('Win') !== -1) os = 'Windows PC';
    else if (ua.indexOf('Mac') !== -1) os = 'Mac / MacBook';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux Device';
    else if (ua.indexOf('iPhone') !== -1) os = 'iPhone';
    else if (ua.indexOf('Android') !== -1) os = 'Android Device';

    let browser = 'Browser';
    if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';

    setDeviceInfo({ os: `${os} • ${browser}` });
  }, []);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setAvatarPreview(dataUrl);
          
          // Automatically save the avatar when it's changed
          setTimeout(() => {
            if (e.target.form) {
              e.target.form.requestSubmit();
            }
          }, 100);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // OTP Input Handlers (reusable)
  const handleOtpChange = (index, value, state, setState, refs) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...state];
    newCode[index] = value;
    setState(newCode);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e, state, refs) => {
    if (e.key === "Backspace" && !state[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  // Email Change Logic
  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) {
      setEmailError("Please enter a different valid email.");
      return;
    }
    setEmailLoading(true);
    setEmailError(null);
    const formData = new FormData();
    formData.append("newEmail", newEmail);
    const res = await requestChangeEmailOtp(formData);
    setEmailLoading(false);
    if (res?.error) {
      setEmailError(res.error);
    } else {
      setEmailStep(2);
      setTimeout(() => emailInputRefs.current[0]?.focus(), 100);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    const fullCode = emailOtp.join("");
    if (fullCode.length !== 6) return;
    
    setEmailLoading(true);
    setEmailError(null);
    const formData = new FormData();
    formData.append("newEmail", newEmail);
    formData.append("code", fullCode);
    const res = await verifyChangeEmailOtp(formData);
    setEmailLoading(false);
    
    if (res?.error) {
      setEmailError(res.error);
    } else if (res?.redirect) {
      router.push(res.redirect);
    }
  };

  // Delete Account Logic
  const handleRequestDeleteOtp = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    const res = await requestDeleteAccountOtp();
    setDeleteLoading(false);
    if (res?.error) {
      setDeleteError(res.error);
    } else {
      setDeleteStep(2);
      setTimeout(() => deleteInputRefs.current[0]?.focus(), 100);
    }
  };

  const handleVerifyDeleteOtp = async (e) => {
    e.preventDefault();
    const fullCode = deleteOtp.join("");
    if (fullCode.length !== 6) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("code", fullCode);
    const res = await verifyDeleteAccountOtp(formData);
    setDeleteLoading(false);
    
    if (res?.error) {
      setDeleteError(res.error);
    } else if (res?.redirect) {
      router.push(res.redirect);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-8 pb-32">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-1 md:mb-2">Settings</h1>
          <p className="text-sm md:text-lg text-muted-foreground">Manage your account preferences and security.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Account Details - Spans 12 columns */}
        <section className="md:col-span-12 bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(var(--color-primary-rgb),0.15),transparent_50%)] pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 md:mb-8 relative z-10">
            <div className="p-2 md:p-2.5 bg-primary/10 rounded-2xl">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">Profile Details</h2>
          </div>
          
          <form action={updateProfile} className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 md:gap-8 h-auto">
            <div className="flex justify-center shrink-0">
              <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-primary/20 border-4 border-background/50 flex items-center justify-center shadow-xl transition-transform group-hover/avatar:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-primary">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <input type="hidden" name="avatar" value={avatarPreview || ''} />
              </div>
            </div>

            <div className="flex-1 flex flex-col xl:flex-row items-end gap-4 w-full">
              <div className="flex-1 w-full xl:w-auto">
                <label className="block text-sm font-semibold mb-2 text-foreground/80">Display Name</label>
                <input type="text" name="name" defaultValue={user.name} className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl px-5 h-[58px] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="Your name" />
              </div>
              
              <div className="flex-1 w-full xl:w-auto">
                <label className="block text-sm font-semibold mb-2 text-foreground/80">Email Address</label>
                <div className="flex gap-2 w-full">
                  <input type="email" value={user.email} disabled className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl px-5 h-[58px] font-medium opacity-70 cursor-not-allowed" />
                  <button type="button" onClick={() => setShowEmailModal(true)} className="shrink-0 px-5 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-sm h-[58px]">
                    Change
                  </button>
                </div>
              </div>
              
              <button type="submit" className="w-full xl:w-auto shrink-0 bg-primary text-primary-foreground font-bold px-8 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 h-[58px]">
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Notifications */}
        <section className="md:col-span-6 bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg border border-border flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
              <div className="p-2 md:p-2.5 bg-blue-500/10 rounded-2xl">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Notifications</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 relative z-10">Receive push notifications when you arrive at your monitored geofences.</p>
          </div>
          <form action={toggleNotifications} className="relative z-10 mt-auto">
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/50">
              <span className="font-semibold text-sm">Geofence Alerts</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="enabled" value="true" defaultChecked={user.notificationsEnabled} onChange={(e) => e.target.form.requestSubmit()} className="sr-only peer" />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </form>
        </section>

        {/* Appearance (Theme Picker) */}
        <section className="md:col-span-6 bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg border border-border flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
              <div className="p-2 md:p-2.5 bg-primary/10 rounded-2xl">
                <Paintbrush className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Appearance</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 relative z-10">Customize your primary accent color across the app.</p>
          </div>
          <div className="relative z-10 mt-auto flex flex-wrap gap-4 pt-4 border-t border-border/50 justify-center">
            {[
              { name: 'Emerald', id: 'theme-emerald', color: 'bg-[#10b981]' },
              { name: 'Blue', id: 'theme-blue', color: 'bg-[#3b82f6]' },
              { name: 'Purple', id: 'theme-purple', color: 'bg-[#a855f7]' },
              { name: 'Rose', id: 'theme-rose', color: 'bg-[#f43f5e]' },
              { name: 'Orange', id: 'theme-orange', color: 'bg-[#f97316]' },
            ].map(theme => (
              <button
                key={theme.id}
                onClick={(e) => { e.preventDefault(); setColorTheme(theme.id); }}
                title={theme.name}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full transition-all flex items-center justify-center relative overflow-hidden focus:outline-none ${colorTheme === theme.id ? 'scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100 hover:shadow-md'}`}
              >
                <div className={`absolute inset-0 ${theme.color}`} />
                {colorTheme === theme.id && (
                  <div className="absolute inset-0 border-[3px] border-background rounded-full pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Sound Settings */}
        <section className="md:col-span-6 bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg border border-border flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
              <div className="p-2 md:p-2.5 bg-indigo-500/10 rounded-2xl">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Sounds</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 relative z-10">Choose the sound that plays when you mark a task as done.</p>
          </div>
          <div className="relative z-10 mt-auto">
            <select
              value={taskDoneSound}
              onChange={(e) => handleSoundChange(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-semibold text-sm cursor-pointer"
            >
              <option value="sound-1">Sound 1 (Default)</option>
              <option value="sound-2">Sound 2</option>
              <option value="sound-3">Sound 3</option>
              <option value="none">None</option>
            </select>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="md:col-span-6 bg-red-500/5 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg border border-red-500/10 flex flex-col justify-between overflow-hidden relative gap-6 group">
           <div className="absolute -right-10 -top-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/10 transition-colors" />
           <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="p-2 md:p-2.5 bg-red-500/10 rounded-2xl text-red-500">
                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-red-500">Danger Zone</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-6">
              Permanently delete your account and all associated data. This action requires OTP verification and is irreversible.
            </p>
          </div>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="relative z-10 w-full mt-auto bg-red-500/10 text-red-500 font-bold px-8 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
            Delete Account
          </button>
        </section>

        {/* Active Sessions */}
        <section className="md:col-span-6 bg-white/70 dark:bg-black/50 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-lg border border-border flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
          <div>
            <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
              <div className="p-2 md:p-2.5 bg-primary/10 rounded-2xl">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Active Sessions</h2>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 relative z-10">Manage devices currently logged into your account.</p>
          </div>
          <div className="p-4 bg-background/50 rounded-2xl border border-border/50 flex items-center justify-between relative z-10 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-semibold">{deviceInfo.os}</p>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Active Now</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Info Links */}
        <section className="md:col-span-12 flex flex-wrap justify-center gap-4 md:gap-8 pt-8">
          <Link href="#" className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors px-4 py-2 bg-white/40 dark:bg-black/40 rounded-full backdrop-blur-md">
            <Mail className="w-4 h-4" /> Privacy Policy
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors px-4 py-2 bg-white/40 dark:bg-black/40 rounded-full backdrop-blur-md">
            <Mail className="w-4 h-4" /> Terms of Service
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground text-sm font-semibold flex items-center gap-2 transition-colors px-4 py-2 bg-white/40 dark:bg-black/40 rounded-full backdrop-blur-md">
            <Mail className="w-4 h-4" /> Contact Support
          </Link>
        </section>
      </div>

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowEmailModal(false)}>
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] p-6 md:p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">Change Email</h3>
            {emailError && <div className="text-destructive text-sm mb-4 bg-destructive/10 p-2 rounded-lg">{emailError}</div>}
            
            {emailStep === 1 ? (
              <form onSubmit={handleRequestEmailOtp} className="space-y-4">
                <p className="text-muted-foreground text-sm mb-4">Enter your new email address. We'll send a code to verify it.</p>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="new@example.com" />
                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setShowEmailModal(false)} className="px-4 py-2 font-medium hover:bg-accent rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={emailLoading} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center">
                    {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Code"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                <p className="text-muted-foreground text-sm mb-4">Enter the 6-digit code sent to <strong>{newEmail}</strong>.</p>
                <div className="flex justify-between gap-1">
                  {emailOtp.map((digit, index) => (
                    <input key={index} ref={el => emailInputRefs.current[index] = el} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(index, e.target.value, emailOtp, setEmailOtp, emailInputRefs)} onKeyDown={e => handleOtpKeyDown(index, e, emailOtp, emailInputRefs)} className="w-10 h-12 text-center text-xl font-bold rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50" />
                  ))}
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setShowEmailModal(false)} className="px-4 py-2 font-medium hover:bg-accent rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={emailLoading || emailOtp.join("").length !== 6} className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl flex items-center">
                    {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card border border-destructive/30 shadow-2xl rounded-[2rem] p-6 md:p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-red-500 mb-2">Delete Account</h3>
            {deleteError && <div className="text-destructive text-sm mb-4 bg-destructive/10 p-2 rounded-lg">{deleteError}</div>}
            
            {deleteStep === 1 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm mb-4">This action is permanent. To confirm, we will send a verification code to <strong>{user.email}</strong>.</p>
                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2 font-medium hover:bg-accent rounded-xl transition-colors">Cancel</button>
                  <button type="button" onClick={handleRequestDeleteOtp} disabled={deleteLoading} className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl flex items-center hover:bg-red-600 transition-colors">
                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Code"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyDeleteOtp} className="space-y-4">
                <p className="text-muted-foreground text-sm mb-4">Enter the 6-digit code sent to your email to permanently delete your account.</p>
                <div className="flex justify-between gap-1">
                  {deleteOtp.map((digit, index) => (
                    <input key={index} ref={el => deleteInputRefs.current[index] = el} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(index, e.target.value, deleteOtp, setDeleteOtp, deleteInputRefs)} onKeyDown={e => handleOtpKeyDown(index, e, deleteOtp, deleteInputRefs)} className="w-10 h-12 text-center text-xl font-bold rounded-lg border border-red-500/30 bg-background focus:ring-2 focus:ring-red-500/50" />
                  ))}
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2 font-medium hover:bg-accent rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={deleteLoading || deleteOtp.join("").length !== 6} className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl flex items-center hover:bg-red-600 transition-colors">
                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Forever"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
