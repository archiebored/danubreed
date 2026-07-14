import { useEffect, useState } from 'react';
import { Upload, Check, Search, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TEAM_COLORS = { yellow: '#EAB308', blue: '#3B82F6', red: '#EF4444', green: '#22C55E' };

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

function TeamBadge({ color }) {
  if (!color) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white capitalize"
      style={{ backgroundColor: TEAM_COLORS[color] || '#888' }}
    >
      {color} team
    </span>
  );
}

const emptyChild = () => ({ full_name: '', age: '', department_id: '', notes: '' });

export default function DanielsCamp() {
  const countdown = useCountdown('2026-08-27T00:00:00');
  const [departments, setDepartments] = useState([]);
  const [tab, setTab] = useState('register');
  const [step, setStep] = useState('form');

  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [children, setChildren] = useState([emptyChild()]);
  const [registeredChildren, setRegisteredChildren] = useState([]);

  const [paymentChoice, setPaymentChoice] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle');

  const [lookupPhone, setLookupPhone] = useState('');
  const [familyResult, setFamilyResult] = useState(null);
  const [lookupStatus, setLookupStatus] = useState('idle');
  const [completing, setCompleting] = useState(false);
  const [completeReceipt, setCompleteReceipt] = useState(null);

  useEffect(() => {
    supabase.from('departments').select('id, name').order('name').then(({ data }) => setDepartments(data || []));
  }, []);

  function addChild() {
    setChildren((c) => [...c, emptyChild()]);
  }
  function removeChild(i) {
    setChildren((c) => c.filter((_, idx) => idx !== i));
  }
  function updateChild(i, field, value) {
    setChildren((c) => c.map((child, idx) => (idx === i ? { ...child, [field]: value } : child)));
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!parentPhone.trim() || children.some((c) => !c.full_name || !c.age)) return;
    setStatus('saving');

    const rows = children.map((c) => ({
      full_name: c.full_name.trim(),
      age: Number(c.age),
      department_id: c.department_id || null,
      phone_number: parentPhone.trim(),
      parent_name: parentName.trim() || null,
      parent_phone: parentPhone.trim(),
      payment_status: 'unpaid',
      team_color: ['yellow', 'blue', 'red', 'green'][Math.floor(Math.random() * 4)],
      notes: c.notes?.trim() || null,
    }));

    const { data, error } = await supabase.from('camp_registrations').insert(rows).select('id, full_name, team_color');

    if (error || !data) { setStatus('error'); return; }
    setRegisteredChildren(data);
    setStatus('idle');
    setStep('payment');
  }

  function handlePaymentChoice(choice) {
    setPaymentChoice(choice);
    if (choice === 'unpaid') setStep('done');
  }

  async function handleReceiptUpload() {
    if (!receipt || registeredChildren.length === 0) return;
    setUploading(true);
    const ext = receipt.name.split('.').pop();
    const path = `camp/${parentPhone.trim()}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(path, receipt, { upsert: true });
    if (uploadError) { setUploading(false); setStatus('error'); return; }
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);

    await supabase
      .from('camp_registrations')
      .update({ payment_status: 'paid', receipt_url: urlData.publicUrl })
      .in('id', registeredChildren.map((c) => c.id));

    setUploading(false);
    setStep('done');
  }

  async function handleLookup(e) {
    e.preventDefault();
    setLookupStatus('checking');
    const { data, error } = await supabase.rpc('get_camp_family', { p_parent_phone: lookupPhone.trim() });
    if (error || !data || data.length === 0) { setLookupStatus('notfound'); setFamilyResult(null); return; }
    setFamilyResult(data);
    setLookupStatus('found');
  }

  async function handleCompletePayment() {
    if (!completeReceipt || !familyResult) return;
    setCompleting(true);
    const ext = completeReceipt.name.split('.').pop();
    const path = `camp/${lookupPhone.trim()}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('receipts').upload(path, completeReceipt, { upsert: true });
    if (uploadError) { setCompleting(false); return; }
    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);

    await supabase
      .from('camp_registrations')
      .update({ payment_status: 'paid', receipt_url: urlData.publicUrl })
      .in('id', familyResult.map((c) => c.id));

    setFamilyResult(familyResult.map((c) => ({ ...c, payment_status: 'paid' })));
    setCompleting(false);
  }

  const isGroup = familyResult && familyResult.length > 1;
  const isRegisteredGroup = registeredChildren.length > 1;

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <div
        className="relative overflow-hidden rounded-2xl p-7 mb-7 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(10,5,0,0.55), rgba(10,5,0,0.88)), url('/mount-up-banner.jpeg')" }}
      >
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

      <div className="flex gap-2 mb-6">
        {[['register', 'Register'], ['lookup', 'Complete payment']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95 ${tab === key ? 'bg-accent/15 text-accent border-accent/30' : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-black/10 dark:border-white/10'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'register' && (
        <>
          {step === 'form' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <section className="flex flex-col gap-2.5">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">Contact info</p>
                <p className="text-xs text-muted-light dark:text-muted-dark -mt-1">
                  Registering just yourself? Put your own name and number below — this is only used to look up your registration later.
                </p>
                <input
                  type="text" placeholder="Your name (or a parent's, if they're helping you register)" value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
                <input
                  type="tel" required placeholder="Phone number (yours, or theirs)" value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none transition-colors duration-200 focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
              </section>

              <section className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">Who's attending</p>
                {children.map((child, i) => (
                  <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-muted-light dark:text-muted-dark">
                        {children.length > 1 ? `Person ${i + 1}` : 'Attendee'}
                      </p>
                      {children.length > 1 && (
                        <button type="button" onClick={() => removeChild(i)} className="text-red-400" aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text" required placeholder="Full name" value={child.full_name}
                      onChange={(e) => updateChild(i, 'full_name', e.target.value)}
                      className="rounded-lg bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number" required min="10" max="25" placeholder="Age" value={child.age}
                        onChange={(e) => updateChild(i, 'age', e.target.value)}
                        className="w-24 rounded-lg bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm outline-none"
                      />
                      <select
                        value={child.department_id}
                        onChange={(e) => updateChild(i, 'department_id', e.target.value)}
                        className="flex-1 rounded-lg bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm outline-none"
                      >
                        <option value="">Department (optional)</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name.replace(' Department', '')}</option>)}
                      </select>
                    </div>
                    <input
                      type="text" placeholder="Allergies or special notes (optional)" value={child.notes || ''}
                      onChange={(e) => updateChild(i, 'notes', e.target.value)}
                      className="rounded-lg bg-base-light dark:bg-base-dark border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                ))}
                <button
                  type="button" onClick={addChild}
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-accent border border-dashed border-accent/30 rounded-xl py-2.5 transition-colors duration-200 hover:bg-accent/5"
                >
                  <Plus size={15} />
                  Add another person
                </button>
              </section>

              <button
                type="submit" disabled={status === 'saving'}
                className="bg-accent text-[#1a0a00] rounded-xl py-3.5 text-sm font-bold disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                {status === 'saving' ? 'Saving...' : `Continue to payment →`}
              </button>
              {status === 'error' && <p className="text-xs text-red-500">Something went wrong — please try again.</p>}
            </form>
          )}

          {step === 'payment' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium mb-1">Have you paid the camp fee for {isRegisteredGroup ? 'everyone above' : 'this registration'}?</p>
              <button onClick={() => handlePaymentChoice('paid')} className={`rounded-xl border p-4 text-left transition-colors ${paymentChoice === 'paid' ? 'border-accent/30 bg-accent/10' : 'border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark'}`}>
                <p className="text-sm font-semibold">I've paid ✓</p>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                  {isRegisteredGroup ? 'One receipt covers everyone registered above' : 'Upload your receipt to confirm your spot'}
                </p>
              </button>
              <button onClick={() => handlePaymentChoice('unpaid')} className={`rounded-xl border p-4 text-left transition-colors ${paymentChoice === 'unpaid' ? 'border-accent/30 bg-accent/10' : 'border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark'}`}>
                <p className="text-sm font-semibold">I haven't paid yet</p>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                  {isRegisteredGroup ? "Save these spots now, come back once you've paid" : "Save your spot now, come back once you've paid"}
                </p>
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
                <p className="font-display text-2xl tracking-wide mb-3">You're registered!</p>
              ) : (
                <>
                  <p className="font-display text-2xl tracking-wide mb-3">
                    {isRegisteredGroup ? 'Spots saved!' : 'Spot saved!'}
                  </p>
                  <p className="text-sm text-muted-light dark:text-muted-dark mb-2">Come back once you've paid — use "Complete payment" and your phone number.</p>
                </>
              )}
              <div className="flex flex-col gap-2 mt-4">
                {registeredChildren.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm bg-base-light dark:bg-base-dark rounded-lg px-3 py-2">
                    <span>{c.full_name}</span>
                    <TeamBadge color={c.team_color} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'lookup' && (
        <div>
          <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
            Find your registration using the phone number you registered with.
          </p>
          <form onSubmit={handleLookup} className="flex flex-col gap-2.5 mb-5">
            <input
              type="tel" required placeholder="Phone number" value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              className="rounded-xl bg-surface-light dark:bg-surface-dark border border-black/10 dark:border-white/10 px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit" disabled={lookupStatus === 'checking'}
              className="bg-accent text-[#1a0a00] rounded-xl py-3 text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Search size={15} />
              {lookupStatus === 'checking' ? 'Searching...' : 'Find registration'}
            </button>
          </form>

          {lookupStatus === 'notfound' && <p className="text-sm text-red-500">No registration found for that number.</p>}

          {familyResult && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark p-5">
              <p className="font-display text-xl tracking-wide mb-4">
                {isGroup ? (familyResult[0]?.parent_name || 'Your group') : 'Your registration'}
              </p>
              <div className="flex flex-col gap-2.5 mb-4">
                {familyResult.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg bg-base-light dark:bg-base-dark px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold">{c.full_name}</p>
                      <p className="text-xs text-muted-light dark:text-muted-dark">Age {c.age}{c.department_name ? ` · ${c.department_name.replace(' Department', '')}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TeamBadge color={c.team_color} />
                      <span className={`text-xs font-bold ${c.payment_status === 'paid' ? 'text-green-500' : 'text-accent'}`}>
                        {c.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {familyResult.some((c) => c.payment_status === 'unpaid') ? (
                <div className="flex flex-col gap-3 border-t border-black/10 dark:border-white/10 pt-4">
                  <p className="text-xs font-medium">
                    {isGroup ? 'Upload one receipt to confirm everyone above:' : 'Upload your receipt to confirm your spot:'}
                  </p>
                  <label className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-4 text-center cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={18} className="text-accent" />
                    <p className="text-xs font-medium">{completeReceipt ? completeReceipt.name : 'Tap to upload receipt'}</p>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setCompleteReceipt(e.target.files[0])} />
                  </label>
                  <button onClick={handleCompletePayment} disabled={!completeReceipt || completing} className="bg-accent text-[#1a0a00] rounded-xl py-3 text-sm font-bold disabled:opacity-60">
                    {completing ? 'Uploading...' : 'Confirm payment'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-green-500 font-medium border-t border-black/10 dark:border-white/10 pt-4">
                  {isGroup ? "Everyone's all set" : "You're all set"} — see you at Daniel's Camp! 🏕️
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}