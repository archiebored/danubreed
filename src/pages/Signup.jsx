import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SCHOOL_LEVELS = [
  { value: 'in_secondary', label: 'In Secondary School' },
  { value: 'finished_secondary', label: 'Finished Secondary School' },
  { value: 'in_university', label: 'In University' },
  { value: 'finished_university', label: 'Finished University' },
];

export default function Signup() {
  const [departments, setDepartments] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    parent_guardian_name: '',
    parent_guardian_contact: '',
    school_level: '',
    completed_membership_class: false,
  });
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [knowsTribe, setKnowsTribe] = useState(false);
  const [tribeId, setTribeId] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    supabase.from('departments').select('id, name').order('name').then(({ data }) => setDepartments(data || []));
    supabase.from('tribes').select('id, name').order('name').then(({ data }) => setTribes(data || []));
  }, []);

  function toggleDepartment(id) {
    setSelectedDepartments((curr) => (curr.includes(id) ? curr.filter((d) => d !== id) : [...curr, id]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const { error } = await supabase.rpc('signup_member', {
      p_full_name: form.full_name,
      p_date_of_birth: form.date_of_birth,
      p_phone_number: form.phone_number || null,
      p_parent_guardian_name: form.parent_guardian_name,
      p_parent_guardian_contact: form.parent_guardian_contact,
      p_department_ids: selectedDepartments,
      p_tribe_id: knowsTribe && tribeId ? tribeId : null,
      p_school_level: form.school_level || null,
      p_completed_membership_class: form.completed_membership_class,
    });

    if (error) {
      setStatus('error');
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="max-w-lg mx-auto pt-2 text-center">
        <div className="rounded-2xl border border-accent/30 bg-surface-light dark:bg-surface-dark p-8">
          <p className="font-display text-3xl tracking-wide mb-2">You're signed up!</p>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {knowsTribe && tribeId
              ? "Your tribe is set. A coordinator will confirm your other details soon."
              : "A coordinator will assign your tribe soon."}
            {' '}Log in anytime with your full name.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">Join Da Nu Breed</p>
      <h1 className="font-display text-5xl tracking-wide mb-7">Sign up</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Personal Info */}
        <section className="flex flex-col gap-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">Personal info</p>
          <input
            type="text" required placeholder="Full name" value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
          />
          <label className="text-xs text-muted-light dark:text-muted-dark -mb-1.5 ml-1">Date of birth</label>
          <input
            type="date" required value={form.date_of_birth}
            onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
            className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
          />
          <input
            type="tel" placeholder="WhatsApp number" value={form.phone_number}
            onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
            className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
          />
          <select
            value={form.school_level}
            onChange={(e) => setForm((f) => ({ ...f, school_level: e.target.value }))}
            className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
          >
            <option value="">School level</option>
            {SCHOOL_LEVELS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input
            type="text" required placeholder="Parent / guardian name" value={form.parent_guardian_name}
            onChange={(e) => setForm((f) => ({ ...f, parent_guardian_name: e.target.value }))}
            className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
          />
          <input
            type="tel" required placeholder="Parent / guardian contact" value={form.parent_guardian_contact}
            onChange={(e) => setForm((f) => ({ ...f, parent_guardian_contact: e.target.value }))}
            className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
          />
        </section>

        {/* Tribe & Service */}
        <section className="flex flex-col gap-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">Tribe &amp; service</p>

          <p className="text-sm">Do you know your current tribe?</p>
          <div className="flex gap-2">
            {[['yes', true], ['no', false]].map(([label, val]) => (
              <button
                key={label} type="button" onClick={() => setKnowsTribe(val)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border ${
                  knowsTribe === val
                    ? 'bg-accent/15 text-accent border-accent/30'
                    : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-black/10 dark:border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {knowsTribe && (
            <select
              value={tribeId} onChange={(e) => setTribeId(e.target.value)}
              className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
            >
              <option value="">Select your tribe</option>
              {tribes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          {!knowsTribe && (
            <p className="text-xs text-muted-light dark:text-muted-dark">
              No worries — a coordinator will assign your tribe after sign-up.
            </p>
          )}

          <p className="text-sm mt-2">Departments you're interested in (pick any)</p>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <button
                key={d.id} type="button" onClick={() => toggleDepartment(d.id)}
                className={`text-xs font-medium px-3.5 py-2 rounded-full border ${
                  selectedDepartments.includes(d.id)
                    ? 'bg-accent/15 text-accent border-accent/30'
                    : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-black/10 dark:border-white/10'
                }`}
              >
                {d.name.replace(' Department', '')}
              </button>
            ))}
          </div>
        </section>

        {/* Membership */}
        <section className="flex flex-col gap-2.5">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">Membership</p>
          <label className="flex items-center gap-3 rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.completed_membership_class}
              onChange={(e) => setForm((f) => ({ ...f, completed_membership_class: e.target.checked }))}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm">I've completed membership class</span>
          </label>
        </section>

        <button
          type="submit" disabled={status === 'sending'}
          className="bg-accent text-[#1a0a00] rounded-xl py-3.5 text-sm font-bold disabled:opacity-60"
        >
          {status === 'sending' ? 'Signing up...' : 'Sign up'}
        </button>
        {status === 'error' && <p className="text-xs text-red-500">Something went wrong — please try again.</p>}
      </form>
    </div>
  );
}