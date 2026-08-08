import React, { useState } from 'react';
import { UserCheck, Plus, Trash2, Save, Shield, CheckCircle2 } from 'lucide-react';
import { TrustedContact } from '../types.js';

interface Props {
  user: any;
  token: string;
  onUserUpdate: (user: any) => void;
}

export const SettingsPage: React.FC<Props> = ({ user, token, onUserUpdate }) => {
  const [contacts, setContacts] = useState<TrustedContact[]>(user?.trusted_contacts || []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact: TrustedContact = {
      id: `contact_${Date.now()}`,
      name,
      phone,
      email,
      relationship: relationship || 'Trusted Friend'
    };

    setContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setEmail('');
    setRelationship('');
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ trusted_contacts: contacts })
      });
      const data = await res.json();
      if (res.ok) {
        onUserUpdate(data.user);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Trusted Contacts & Safety Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure emergency alert recipients and account parameters
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Trusted contacts and safety configuration updated successfully.</span>
        </div>
      )}

      {/* Add New Contact Card */}
      <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <UserCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Add Trusted Emergency Contact</h2>
        </div>

        <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300">Contact Full Name</label>
            <input
              id="contact-name-input"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Sarah Jenkins"
              className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Phone Number (SMS Alert)</label>
            <input
              id="contact-phone-input"
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <input
              id="contact-email-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="sarah.j@example.com"
              className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Relationship</label>
            <input
              id="contact-relationship-input"
              type="text"
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="Family / Sister / Lawyer"
              className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              id="add-contact-btn"
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Contact to Dispatch List
            </button>
          </div>
        </form>
      </div>

      {/* Configured Contacts List */}
      <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Active Trusted Contact List ({contacts.length})</h2>

        {contacts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No trusted contacts added yet.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map(c => (
              <div key={c.id} className="p-3.5 rounded-md bg-[#09090b] border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white">{c.name}</h3>
                  <p className="text-[11px] text-slate-400">{c.relationship}</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{c.phone} {c.email ? `• ${c.email}` : ''}</p>
                </div>

                <button
                  onClick={() => handleRemoveContact(c.id)}
                  title="Remove contact"
                  className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            id="save-settings-btn"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
