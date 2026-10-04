import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Brand, Button, Card, Field, Screen, Title } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ApiError, apiUrl } from '@/api/client';
import { useTheme } from '@/context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { palette } = useTheme();

  async function submit() {
    if (busy) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !pw) {
      setError('Escribe tu correo y contraseña.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      await signIn(cleanEmail, pw);
      router.replace('/');
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'No fue posible iniciar sesión.';
      setError(message);
      console.warn('NAXVO login:', e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Brand />
      <Title subtitle="Usa la misma cuenta de NAXVO web.">Bienvenido de nuevo</Title>
      <Field label="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="tu@correo.com" />
      <Field label="Contraseña" value={pw} onChangeText={setPw} secureTextEntry placeholder="••••••••" />

      {error ? (
        <Card>
          <Text style={{ color: palette.danger, fontWeight: '800' }}>{error}</Text>
          {Platform.OS === 'web' ? (
            <Text selectable style={{ color: palette.muted, marginTop: 6, fontSize: 12 }}>
              API: {apiUrl()}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <Button title="Entrar" icon="log-in-outline" onPress={submit} loading={busy} />
      <View>
        <Text onPress={() => router.push('/(auth)/register')} style={{ color: palette.primary, textAlign: 'center', fontWeight: '800' }}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </View>
    </Screen>
  );
}
