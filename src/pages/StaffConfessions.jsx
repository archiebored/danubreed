import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function StaffConfessions() {
  const { staff } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('new');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let query = supabase
      .from('anonymous_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function markReviewed(id) {
    await supabase
      .from('anonymous_submissions')
      .update({ status: 'reviewed', reviewed_by: staff?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Inbox</p>
          <p className="font-display text-4xl tracking-wide">Confessions &amp; suggestions</p>
        </div>
        <div className="flex gap-1.5">
          {['new', 'reviewed', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full capitalize border ${
                filter === f
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface-dark text-muted-dark border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-muted-dark">Loading...</p>}
      {!loading && items.length === 0 && <p className="text-sm text-muted-dark">Nothing here.</p>}

      <div className="flex flex-col gap-2.5 max-w-lg">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-surface-dark p-4">
            <div className="flex justify-between items-start gap-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-accent">
                {item.type}
              </span>
              <span className="text-[10px] text-muted-dark flex-shrink-0">
                {new Date(item.submitted_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{item.content}</p>

            {item.contact_info && (
              <div className="flex items-center gap-1.5 mt-2.5 text-xs text-accent font-medium">
                <Phone size={12} />
                Wants a reply — {item.contact_info}
              </div>
            )}

            {item.status === 'new' ? (
              <button onClick={() => markReviewed(item.id)} className="text-xs text-accent mt-3 font-semibold">
                Mark reviewed
              </button>
            ) : (
              <p className="text-[10px] text-muted-dark mt-3">
                Reviewed {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString() : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}