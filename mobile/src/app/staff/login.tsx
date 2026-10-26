import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthContext';
import { colorsFor } from '@/theme/colors';

const colors = colorsFor('dark');

export default function StaffLogin() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError('Could not sign in — check the email and password.');
      return;
    }
    router.replace('/staff/dashboard');
  }

  return (
    <LinearGradient colors={['#0A0A0A', '#1a0800']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}
      >
        <View style={{ width: '100%', maxWidth: 360, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 24, gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.accent}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Lock size={18} color={colors.accent} />
          </View>
          <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 28, color: colors.accent, marginBottom: 4 }}>Staff login</Text>
          <TextField placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button label={loading ? 'Signing in...' : 'Sign in'} onPress={handleSubmit} loading={loading} fullWidth />
          {error ? <Text style={{ fontSize: 12, color: colors.danger }}>{error}</Text> : null}
          <Button label="Back to home" variant="ghost" onPress={() => router.replace('/')} />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
