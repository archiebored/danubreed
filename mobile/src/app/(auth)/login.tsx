import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { ThemeContext } from '@/context/ThemeContext';
import { colorsFor } from '@/theme/colors';
import { useMemberAuth } from '@/context/MemberAuthContext';

const colors = colorsFor('dark');
const forcedDarkTheme = { theme: 'dark' as const, colors, toggleTheme: () => {} };

export default function Login() {
  const router = useRouter();
  const { login } = useMemberAuth();
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!firstName.trim() || !phone.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await login(firstName, phone);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <ThemeContext.Provider value={forcedDarkTheme}>
      <LinearGradient colors={['#0A0A0A', '#1a0800']} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}
        >
          <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} color={colors.muted} />
            <Text style={{ fontSize: 13, color: colors.muted }}>Back</Text>
          </Pressable>

          <View style={{ width: '100%', maxWidth: 360, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 24, gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.accent}22`, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <LogIn size={18} color={colors.accent} />
            </View>
            <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 28, color: colors.accent, marginBottom: 2 }}>Welcome back</Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
              Your first name or nickname, and the phone number you signed up with.
            </Text>
            <TextField placeholder="First name or nickname" value={firstName} onChangeText={setFirstName} />
            <TextField placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Button label={loading ? 'Checking...' : 'Log in'} onPress={handleSubmit} loading={loading} disabled={!firstName.trim() || !phone.trim()} fullWidth />
            {error ? <Text style={{ fontSize: 12, color: colors.danger }}>{error}</Text> : null}
            <Pressable onPress={() => router.replace('/(auth)/signup')} style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
                New here? <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ThemeContext.Provider>
  );
}
