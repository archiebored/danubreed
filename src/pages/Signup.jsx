import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    parent_guardian_name: '',
    parent_guardian_contact: '',
  });
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [status, setStatus] = useState('idle');
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase
      .from('departments')
      .select('id, name')
      .order('name')
      .then(({ data }) => setDepartments(data || []));
  }, []);

  function toggleDepartment(id) {
    setSelectedDepartments((curr) =>
      curr.includes(id) ? curr.filter((d) => d !== id) : [...curr, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const { data, error } = await supabase.rpc('signup_member', {
      p_full_name: form.full_name,
      p_date_of_birth: form.date_of_birth,
      p_phone_number: form.phone_number || null,
      p_parent_guardian_name: form.parent_guardian_name,
      p_parent_guardian_contact: form.parent_guardian_contact,
      p_department_ids: selectedDepartments,
    });

    if (error) {
      setStatus('error');
      return;
    }

    setCode(data);
    setStatus('sent');
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — fail silently, code is still visible to copy manually
    }
  }

  if (status === 'sent') {
    return (
      <div className="max-w-lg mx-auto pt-2 text-center">
        <div className="rounded-2xl border border-accent/30 bg-surface-light dark:bg-surface-dark p-8">
          <p className="text-sm mb-4">You're signed up! Save this code — it's how you'll log in later.</p>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-5 py-4 mb-2">
            <span className="font-display text-3xl tracking-widest text-accent">{code}</span>
            <button
              onClick={handleCopy}
              aria-label="Copy code"
              className="flex-shrink-0 w-9 h-9 rounded-full bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 flex items-center justify-center text-accent"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          {copied && <p className="text-xs text-accent font-medium mb-2">Copied!</p>}

          <p className="text-xs text-muted-light dark:text-muted-dark">
            A coordinator will assign your tribe soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-3">
        Join Da Nu Breed
      </p>
      <h1 className="font-display text-5xl tracking-wide mb-7">Sign up</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="text"
          required
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
        />
        <label className="text-xs text-muted-light dark:text-muted-dark -mb-1.5 ml-1">
          Date of birth
        </label>
        <input
          type="date"
          required
          value={form.date_of_birth}
          onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
          className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={form.phone_number}
          onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
          className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
        />
        <input
          type="text"
          required
          placeholder="Parent / guardian name"
          value={form.parent_guardian_name}
          onChange={(e) => setForm((f) => ({ ...f, parent_guardian_name: e.target.value }))}
          className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
        />
        <input
          type="tel"
          required
          placeholder="Parent / guardian contact"
          value={form.parent_guardian_contact}
          onChange={(e) => setForm((f) => ({ ...f, parent_guardian_contact: e.target.value }))}
          className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
        />

        <p className="text-xs text-muted-light dark:text-muted-dark mt-3 mb-1">
          Departments you're interested in (pick any)
        </p>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDepartment(d.id)}
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

        <p className="text-xs text-muted-light dark:text-muted-dark mt-3">
          Your tribe will be assigned by a coordinator after sign-up.
        </p>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-accent text-[#1a0a00] rounded-xl py-3.5 text-sm font-bold mt-3 disabled:opacity-60"
        >
          {status === 'sending' ? 'Signing up...' : 'Sign up'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-500">Something went wrong — please try again.</p>
        )}
      </form>
    </div>
  );
}