import { useEffect, useState } from 'react';
import { Upload, Check, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return timeLeft;
}

export default function DanielsCamp() {
  const countdown = useCountdown('2026-08-27T00:00:00');
  const [departments, setDepartments] = useState([]);
  const [tab, setTab] = useState('register');
  const [step, setStep] = useState('form');
  const [registrationId, setRegistrationId] = useState(null);

  const [form, setForm] = useState({ full_name: '', age: '', department_id: '', phone_number: '' });
  const [paymentChoice, setPaymentChoice] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle');

  const [lookup, setLookup] = useState({ full_name: '', phone_number: '' });
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupStatus, setLookupStatus] = useState('idle');
  const [completing, setCompleting] = useState(false);
  const [completeReceipt, setCompleteReceipt] = useState(null);
  const [teamColor, setTeamColor] = useState(null);

  useEffect(() => {
    supabase.from('departments').select('id, name').order('name').then(({ data }) => setDepartments(data || []));
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    if (!form.full_name || !form.age) return;
    setStatus('saving');

   const { data, error } = await supabase
  .from('camp_registrations')
  .insert({
    full_name: form.full_name.trim(),
    age: Number(form.age),
    department_id: form.department_id || null,
    phone_number: form.phone_number.trim() || null,
    payment_status: 'unpaid',
    team_color: ['yellow', 'blue', 'red', 'green'][Math.floor(Math.random() * 4)],
  })
  .select('id, team_color')
  .single();

    if (error || !data) { setStatus('error'); return; }
    setRegistrationId(data.id);
setTeamColor(data.team_color);
    setStatus('idle');
    setStep('payment');
  }

  async function handlePaymentChoice(choice) {
    setPaymentChoice(choice);
    if (choice === 'unpaid') setStep('done');
  }

  async function handleReceiptUpload() {
    if (!receipt || !registrationId) return;
    setUploading(true);
    const ext = receipt.name.split('.').pop();
    const path = `camp/${registrationId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(path, receipt, { upsert: true });
    if (uploadError) { setUploading(false); setStatus('error'); return; }
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);
    await supabase.from('camp_registrations').update({ payment_status: 'paid', receipt_url: urlData.publicUrl }).eq('id', registrationId);
    setUploading(false);
    setStep('done');
  }

  async function handleLookup(e) {
    e.preventDefault();
    setLookupStatus('checking');
    const { data, error } = await supabase.rpc('get_camp_registration', {
      p_full_name: lookup.full_name.trim() || null,
      p_phone: lookup.phone_number.trim() || null,
    });
    if (error || !data || data.length === 0) { setLookupStatus('notfound'); setLookupResult(null); return; }
    setLookupResult(data[0]);
    setLookupStatus('found');
  }

  async function handleCompletePayment() {
    if (!completeReceipt || !lookupResult) return;
    setCompleting(true);
    const ext = completeReceipt.name.split('.').pop();
    const path = `camp/${lookupResult.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(path, completeReceipt, { upsert: true });
    if (uploadError) { setCompleting(false); return; }
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);
    await supabase.from('camp_registrations').update({ payment_status: 'paid', receipt_url: urlData.publicUrl }).eq('id', lookupResult.id);
    setLookupResult({ ...lookupResult, payment_status: 'paid' });
    setCompleting(false);
  }

  return (
    <div className="max-w-2xl mx-auto pt-2">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl p-7 mb-7" style={{ background: 'linear-gradient(135deg, #1a0800 0%, #2d0d00 100%)' }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1">Annual camp · August 27–30, 2026</p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide text-white mb-1">
            DANIEL'S <span className="text-accent">CAMP</span>
          </h1>
          <p className="font-display text-xl tracking-wide text-white/70 mb-2">MOUNT UP</p>
          <p className="text-xs italic text-white/50 mb-5 max-w-md">
            "They shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." — Isaiah 40:31
          </p>
          <div className="flex gap-4">
            {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
              <div key={unit} className="text-center">
                <div className="font-display text-2xl sm:text-3xl tracking-wide text-accent leading-none">
                  {String(countdown[unit] ?? 0).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mt-1">{unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {[['register', 'Register'], ['lookup', 'Complete payment']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${tab === key ? 'bg-accent/15 text-accent border-accent/30' : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-black/10 dark:border-white/10'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Register tab */}
      {tab === 'register' && (
        <>
          {step === 'form' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-2.5">
              <input type="text" required placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none" />
              <input type="number" required min="10" max="25" placeholder="Age" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none" />
              <select value={form.department_id} onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))} className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none">
                <option value="">Department (optional)</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name.replace(' Department', '')}</option>)}
              </select>
              <input type="tel" placeholder="Phone number (to look up later)" value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none" />
              <button type="submit" disabled={status === 'saving'} className="bg-accent text-[#1a0a00] rounded-xl py-3.5 text-sm font-bold mt-2 disabled:opacity-60">
                {status === 'saving' ? 'Saving...' : 'Continue to payment →'}
              </button>
              {status === 'error' && <p className="text-xs text-red-500">Something went wrong — please try again.</p>}
            </form>
          )}

          {step === 'payment' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium mb-1">Have you paid the camp fee?</p>
              <button onClick={() => handlePaymentChoice('paid')} className={`rounded-xl border p-4 text-left transition-colors ${paymentChoice === 'paid' ? 'border-accent/30 bg-accent/10' : 'border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark'}`}>
                <p className="text-sm font-semibold">I've paid ✓</p>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">Upload your receipt to confirm your spot</p>
              </button>
              <button onClick={() => handlePaymentChoice('unpaid')} className={`rounded-xl border p-4 text-left transition-colors ${paymentChoice === 'unpaid' ? 'border-accent/30 bg-accent/10' : 'border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark'}`}>
                <p className="text-sm font-semibold">I haven't paid yet</p>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">Save your spot now, come back once you've paid</p>
              </button>
              {paymentChoice === 'paid' && (
                <div className="mt-2 flex flex-col gap-3">
                  <label className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-5 text-center cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={20} className="text-accent" />
                    <p className="text-xs font-medium">{receipt ? receipt.name : 'Tap to upload receipt'}</p>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setReceipt(e.target.files[0])} />
                  </label>
                  <button onClick={handleReceiptUpload} disabled={!receipt || uploading} className="bg-accent text-[#1a0a00] rounded-xl py-3 text-sm font-bold disabled:opacity-60">
                    {uploading ? 'Uploading...' : 'Submit registration'}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="rounded-2xl border border-accent/30 bg-surface-light dark:bg-surface-dark p-7 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <Check size={22} className="text-accent" />
              </div>
              {paymentChoice === 'paid' ? (
                <>
                  <p className="font-display text-2xl tracking-wide mb-2">You're registered!</p>
                  <p className="text-sm text-muted-light dark:text-muted-dark">Receipt uploaded. See you at Daniel's Camp — Mount Up!</p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl tracking-wide mb-2">Spot saved!</p>
                  <p className="text-sm text-muted-light dark:text-muted-dark mb-3">Come back once you've paid to upload your receipt and confirm your spot.</p>
                  <p className="text-xs text-accent font-medium">Use the "Complete payment" tab and search by your name or phone number.</p>
                </>
              )}
              {teamColor && (
  <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white`}
    style={{ backgroundColor: teamColor === 'yellow' ? '#EAB308' : teamColor === 'blue' ? '#3B82F6' : teamColor === 'red' ? '#EF4444' : '#22C55E' }}
  >
    You're on the <span className="uppercase">{teamColor}</span> team
  </div>
)}
            </div>
          )}
        </>
      )}

      {/* Lookup tab */}
      {tab === 'lookup' && (
        <div>
          <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
            Already registered but haven't paid? Find your registration and upload your receipt.
          </p>
          <form onSubmit={handleLookup} className="flex flex-col gap-2.5 mb-5">
            <input type="text" placeholder="Full name" value={lookup.full_name} onChange={(e) => setLookup((l) => ({ ...l, full_name: e.target.value }))} className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none" />
            <p className="text-xs text-center text-muted-light dark:text-muted-dark -my-1">or</p>
            <input type="tel" placeholder="Phone number" value={lookup.phone_number} onChange={(e) => setLookup((l) => ({ ...l, phone_number: e.target.value }))} className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none" />
            <button type="submit" disabled={lookupStatus === 'checking' || (!lookup.full_name && !lookup.phone_number)} className="bg-accent text-[#1a0a00] rounded-xl py-3 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              <Search size={15} />
              {lookupStatus === 'checking' ? 'Searching...' : 'Find my registration'}
            </button>
          </form>

          {lookupStatus === 'notfound' && <p className="text-sm text-red-500">No registration found — double check your name or number.</p>}

          {lookupResult && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5">
              <p className="font-display text-2xl tracking-wide mb-3">{lookupResult.full_name}</p>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Age</p>
                  <p className="font-medium">{lookupResult.age}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Department</p>
                  <p className="font-medium">{lookupResult.department_name?.replace(' Department', '') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-light dark:text-muted-dark mb-0.5">Payment</p>
                  <p className={`font-semibold ${lookupResult.payment_status === 'paid' ? 'text-green-500' : 'text-accent'}`}>
                    {lookupResult.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}
                  </p>
                </div>
              </div>
              {lookupResult.payment_status === 'unpaid' && (
                <div className="flex flex-col gap-3 border-t border-black/10 dark:border-white/10 pt-4">
                  <p className="text-xs font-medium">Upload your receipt to confirm your spot:</p>
                  <label className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-4 text-center cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={18} className="text-accent" />
                    <p className="text-xs font-medium">{completeReceipt ? completeReceipt.name : 'Tap to upload receipt'}</p>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setCompleteReceipt(e.target.files[0])} />
                  </label>
                  <button onClick={handleCompletePayment} disabled={!completeReceipt || completing} className="bg-accent text-[#1a0a00] rounded-xl py-3 text-sm font-bold disabled:opacity-60">
                    {completing ? 'Uploading...' : 'Confirm payment'}
                  </button>
                </div>
              )}
              {lookupResult.payment_status === 'paid' && (
                <p className="text-sm text-green-500 font-medium">You're all set — see you at Daniel's Camp! 🏕️</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}