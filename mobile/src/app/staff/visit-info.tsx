import { useEffect, useState } from 'react';
import { Text } from '@/components/Text';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

const empty = {
  church_name: '', address: '', city: '', camp_location: '',
  phone: '', email: '', instagram_url: '', tiktok_url: '',
};

export default function StaffVisitInfo() {
  const { colors } = useTheme();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    supabase.from('church_info').select('*').limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setId(data.id);
        setForm({
          church_name: data.church_name || '', address: data.address || '', city: data.city || '',
          camp_location: data.camp_location || '', phone: data.phone || '', email: data.email || '',
          instagram_url: data.instagram_url || '', tiktok_url: data.tiktok_url || '',
        });
      }
    });
  }, []);

  async function handleSubmit() {
    setStatus('saving');
    const { error, data } = id
      ? await supabase.from('church_info').update(form).eq('id', id).select().single()
      : await supabase.from('church_info').insert(form).select().single();
    if (!error && data) setId(data.id);
    setStatus(error ? 'error' : 'saved');
    setTimeout(() => setStatus('idle'), 2000);
  }

  function field(key: keyof typeof empty, placeholder: string, keyboardType?: 'phone-pad' | 'email-address') {
    return (
      <TextField placeholder={placeholder} value={form[key]} onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))} keyboardType={keyboardType} />
    );
  }

  return (
    <Screen>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink, marginBottom: 4 }}>Visit Us</Text>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 16 }}>
        This shows on the public &quot;Visit Us&quot; page. Leave anything blank to hide that section from visitors.
      </Text>

      <Card style={{ gap: 10 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.accent }}>Location</Text>
        {field('church_name', 'Church name')}
        {field('address', 'Street address')}
        {field('city', 'City')}
        {field('camp_location', "Daniel's Camp location")}

        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.accent, marginTop: 6 }}>Contact</Text>
        {field('phone', 'Phone number', 'phone-pad')}
        {field('email', 'Email', 'email-address')}

        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: colors.accent, marginTop: 6 }}>Social</Text>
        {field('instagram_url', 'Instagram URL')}
        {field('tiktok_url', 'TikTok URL')}

        <Button label={status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : 'Save changes'} onPress={handleSubmit} loading={status === 'saving'} />
      </Card>
    </Screen>
  );
}
