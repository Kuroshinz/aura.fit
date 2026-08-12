import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ShieldOff, Ban, Mail, Calendar, Activity } from 'lucide-react';
import { AdminUserRecord } from '@/repositories/users/user-repository';

interface UserDetailSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord | null;
  onUpdateRole: (id: string, role_id: string) => void;
  onSuspend: (id: string, suspend: boolean) => void;
  roles: { id: string, name: string }[];
}

export function UserDetailSlideover({ isOpen, onClose, user, onUpdateRole, onSuspend, roles }: UserDetailSlideoverProps) {
  if (!user) return null;

  const isSuspended = user.status === 'suspended';
  const roleName = user.roles?.name || 'User';
  const tierName = user.subscriptions?.tier_name || 'Free';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-300 shrink-0 border border-slate-700">
                  {user.name?.substring(0, 2).toUpperCase() || 'UN'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user.name || 'Unknown User'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold uppercase">{roleName}</span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-xs font-bold uppercase">{tierName}</span>
                    {isSuspended && <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-bold uppercase">Suspended</span>}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Workouts</div>
                  <div className="text-2xl font-black text-white">{user.workout_count || 0}</div>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined</div>
                  <div className="text-lg font-bold text-slate-300 mt-1">{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Management Actions</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase block">Change Role</label>
                    <select 
                      value={user.role_id || ''} 
                      onChange={(e) => onUpdateRole(user.id, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => onSuspend(user.id, !isSuspended)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors ${
                      isSuspended 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30' 
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                    {isSuspended ? 'Restore User Account' : 'Suspend User Account'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
