import { useState } from 'react';
import { Text } from '@/components/Text';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function StaffNotifications() {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token}` },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        setErrorMsg(errBody?.error || `Server responded with ${res.status}`);
        setStatus('error');
        return;
      }
      const result = await res.json();
      setSentCount(result.sent ?? 0);
      setStatus('sent');
      setTitle('');
      setBody('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error');
      setStatus('error');
    }
  }

  return (
    <Screen>
      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink, marginBottom: 4 }}>Send notification</Text>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 16 }}>
        Goes out to everyone who&apos;s turned on notifications in the app. Use it for things that genuinely need
        attention now — not every small update.
      </Text>

      <Card style={{ gap: 10 }}>
        <TextField placeholder="Title, e.g. Camp reminder" value={title} onChangeText={setTitle} />
        <TextField placeholder="Message" value={body} onChangeText={setBody} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Button label={status === 'sending' ? 'Sending...' : 'Send to everyone'} onPress={handleSend} loading={status === 'sending'} />
        {status === 'sent' && (
          <Text style={{ fontSize: 12, color: colors.success }}>Sent to {sentCount} device{sentCount === 1 ? '' : 's'}.</Text>
        )}
        {status === 'error' && <Text style={{ fontSize: 12, color: colors.danger }}>Couldn&apos;t send: {errorMsg}</Text>}
      </Card>
    </Screen>
  );
}
