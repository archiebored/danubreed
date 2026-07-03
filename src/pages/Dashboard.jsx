import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Tags, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { staff } = useAuth();
  const [counts, setCounts] = useState({ members: 0, tribes: 0, departments: 0, newSubmissions: 0 });

  useEffect(() => {
    async function load() {
      const [members, tribes, departments, newSubmissions] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('tribes').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase
          .from('anonymous_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new'),
      ]);
      setCounts({
        members: members.count || 0,
        tribes: tribes.count || 0,
        departments: departments.count || 0,
        newSubmissions: newSubmissions.count || 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-7 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent mb-1.5">Overview</p>
          <p className="font-display text-4xl tracking-wide">Dashboard</p>
        </div>
        <span className="text-xs text-muted-dark bg-surface-dark border border-white/10 px-3 py-1.5 rounded-full capitalize">
          {staff?.role}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Members" value={counts.members} icon={Users} />
        <StatCard label="Tribes" value={counts.tribes} icon={Tags} />
        <StatCard label="Depts" value={counts.departments} icon={Tags} />
        <Link to="/staff/confessions">
          <StatCard label="New confessions" value={counts.newSubmissions} icon={Mail} accent />
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link
          to="/staff/members"
          className="text-sm font-medium rounded-xl border border-white/10 bg-surface-dark px-5 py-3 hover:-translate-y-0.5 hover:border-accent/30 transition-all"
        >
          Manage members →
        </Link>
        <Link
          to="/staff/events"
          className="text-sm font-medium rounded-xl border border-white/10 bg-surface-dark px-5 py-3 hover:-translate-y-0.5 hover:border-accent/30 transition-all"
        >
          Manage events →
        </Link>
        <Link
          to="/staff/confessions"
          className="text-sm font-medium rounded-xl border border-white/10 bg-surface-dark px-5 py-3 hover:-translate-y-0.5 hover:border-accent/30 transition-all"
        >
          Review inbox →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-dark p-4 cursor-pointer hover:-translate-y-0.5 hover:border-accent/30 transition-all">
      <Icon size={16} className={accent ? 'text-accent mb-2' : 'text-muted-dark mb-2'} />
      <p className="text-[11px] text-muted-dark mb-1">{label}</p>
      <p className={`font-display text-2xl tracking-wide ${accent ? 'text-accent' : ''}`}>{value}</p>
    </div>
  );
}