import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { getCategories, uploadProfilePhoto, updateProfile } from '@/api';
import { ApiError } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Badge, Button, Card, Field, Screen, Title } from '@/components/ui';
import type { Category } from '@/types/api';

type FieldErrors = Record<string, string>;

const editableFields = [
  'nombre', 'apellidos', 'telefono', 'fecha_nacimiento', 'direccion', 'ciudad', 'estado',
  'codigo_postal', 'biografia', 'facebook', 'instagram', 'linkedin', 'sitio_web',
  'profesion', 'especialidad', 'especialidades', 'anos_experiencia', 'experiencia',
  'zona_servicio', 'radio_servicio_km', 'modalidad_servicio', 'horario_disponibilidad',
] as const;

function buildPayload(form: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const key of editableFields) {
    const value = form[key];
    payload[key] = value == null ? '' : String(value).trim();
  }
  return payload;
}

function errorFields(error: ApiError): FieldErrors {
  const fields = error.details?.fields;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return {};
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => typeof value === 'string') as [string, string][],
  );
}

export default function ProfileScreen() {
  const { user, signOut, replaceUser } = useAuth();
  const { palette } = useTheme();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!user) return;
    setForm({
      ...user,
      anos_experiencia: user.anos_experiencia?.toString() ?? '',
      radio_servicio_km: user.radio_servicio_km?.toString() ?? '',
      modalidad_servicio: user.modalidad_servicio || 'domicilio',
    });
  }, [user]);

  useEffect(() => {
    if (user?.tipo !== 'trabajador') return;
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, [user?.tipo]);

  if (!user) return null;

  const set = (key: string, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
    if (errors[key]) setErrors(current => ({ ...current, [key]: '' }));
  };

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const fresh = await updateProfile(buildPayload(form));
      replaceUser(fresh);
      setForm({
        ...fresh,
        anos_experiencia: fresh.anos_experiencia?.toString() ?? '',
        radio_servicio_km: fresh.radio_servicio_km?.toString() ?? '',
        modalidad_servicio: fresh.modalidad_servicio || 'domicilio',
      });
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente.');
    } catch (error) {
      if (error instanceof ApiError) {
        const fields = errorFields(error);
        setErrors(fields);
        const messages = Object.values(fields);
        Alert.alert(
          'Revisa estos datos',
          messages.length ? messages.join('\n') : error.message,
        );
      } else {
        Alert.alert('No se pudo guardar', 'Intenta otra vez.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function photo() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;

    setBusy(true);
    try {
      replaceUser(await uploadProfilePhoto({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
      }));
    } catch (error) {
      Alert.alert('No se pudo subir', error instanceof ApiError ? error.message : 'Intenta otra vez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Pressable onPress={photo}>
          <Avatar uri={user.foto_url} name={user.nombre} size={92} />
          <View style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: palette.primary, borderRadius: 99, padding: 7 }}>
            <Text style={{ color: palette.primaryText }}>✎</Text>
          </View>
        </Pressable>
        <Text style={{ color: palette.text, fontSize: 22, fontWeight: '900' }}>{user.nombre} {user.apellidos}</Text>
        <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Badge text={user.tipo === 'trabajador' ? 'Profesional' : user.tipo === 'admin' ? 'Administrador' : 'Cliente'} tone="info" />
          {user.tipo === 'trabajador' ? (
            <Badge text={user.verificado ? 'Verificado' : `Verificación: ${user.verificacion_estado}`} tone={user.verificado ? 'success' : 'warning'} />
          ) : null}
        </View>
      </View>

      <Card>
        <Title subtitle="Puedes guardar tus datos personales aunque todavía no hayas completado toda la información profesional.">Datos personales</Title>
        <Field label="Nombre" value={form.nombre ?? ''} onChangeText={v => set('nombre', v)} error={errors.nombre} />
        <Field label="Apellidos" value={form.apellidos ?? ''} onChangeText={v => set('apellidos', v)} error={errors.apellidos} />
        <Field label="Teléfono" value={form.telefono ?? ''} onChangeText={v => set('telefono', v)} keyboardType="phone-pad" error={errors.telefono} />
        <Field label="Fecha de nacimiento" value={form.fecha_nacimiento ?? ''} onChangeText={v => set('fecha_nacimiento', v)} placeholder="AAAA-MM-DD" error={errors.fecha_nacimiento} />
        <Field label="Dirección" value={form.direccion ?? ''} onChangeText={v => set('direccion', v)} error={errors.direccion} />
        <Field label="Ciudad" value={form.ciudad ?? ''} onChangeText={v => set('ciudad', v)} error={errors.ciudad} />
        <Field label="Estado" value={form.estado ?? ''} onChangeText={v => set('estado', v)} error={errors.estado} />
        <Field label="Código postal" value={form.codigo_postal ?? ''} onChangeText={v => set('codigo_postal', v)} keyboardType="number-pad" error={errors.codigo_postal} />
        <Field label="Biografía" value={form.biografia ?? ''} onChangeText={v => set('biografia', v)} multiline error={errors.biografia} />
      </Card>

      {user.tipo === 'trabajador' ? (
        <Card>
          <Title subtitle="Completa estos datos para que los clientes entiendan qué haces y dónde trabajas. Puedes completarlos poco a poco.">Perfil profesional</Title>
          <Field label="Profesión u oficio" value={form.profesion ?? ''} onChangeText={v => set('profesion', v)} placeholder="Ej. Electricista residencial" error={errors.profesion} />

          <View style={{ gap: 8 }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Categoría principal</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {categories.map(category => {
                const active = form.especialidad === category.name;
                return (
                  <Pressable
                    key={category.slug}
                    onPress={() => set('especialidad', category.name)}
                    style={{
                      borderWidth: 1,
                      borderColor: active ? palette.primary : palette.border,
                      backgroundColor: active ? palette.surface2 : palette.surface,
                      borderRadius: 99,
                      paddingHorizontal: 11,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{ color: palette.text, fontWeight: active ? '800' : '600' }}>{category.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.especialidad ? <Text style={{ color: palette.danger }}>⚠ {errors.especialidad}</Text> : null}
          </View>

          <Field label="Especialidades" value={form.especialidades ?? ''} onChangeText={v => set('especialidades', v)} multiline placeholder="Ej. Tableros, iluminación, instalaciones" error={errors.especialidades} />
          <Field label="Años de experiencia" value={form.anos_experiencia ?? ''} onChangeText={v => set('anos_experiencia', v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" error={errors.anos_experiencia} />
          <Field label="Experiencia" value={form.experiencia ?? ''} onChangeText={v => set('experiencia', v)} multiline error={errors.experiencia} />
          <Field label="Zona de servicio" value={form.zona_servicio ?? ''} onChangeText={v => set('zona_servicio', v)} error={errors.zona_servicio} />
          <Field label="Radio de servicio (km)" value={form.radio_servicio_km ?? ''} onChangeText={v => set('radio_servicio_km', v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" error={errors.radio_servicio_km} />

          <View style={{ gap: 8 }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Modalidad</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {[
                ['domicilio', 'A domicilio'],
                ['taller', 'En taller'],
                ['ambos', 'Ambos'],
              ].map(([value, label]) => {
                const active = form.modalidad_servicio === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => set('modalidad_servicio', value)}
                    style={{
                      borderWidth: 1,
                      borderColor: active ? palette.primary : palette.border,
                      backgroundColor: active ? palette.surface2 : palette.surface,
                      borderRadius: 99,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                    }}
                  >
                    <Text style={{ color: palette.text, fontWeight: active ? '800' : '600' }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.modalidad_servicio ? <Text style={{ color: palette.danger }}>⚠ {errors.modalidad_servicio}</Text> : null}
          </View>

          <Field label="Horario / disponibilidad" value={form.horario_disponibilidad ?? ''} onChangeText={v => set('horario_disponibilidad', v)} error={errors.horario_disponibilidad} />
        </Card>
      ) : null}

      <Button title="Guardar cambios" icon="save-outline" onPress={save} loading={busy} />
      <Button title="Apariencia y accesibilidad" variant="secondary" icon="color-palette-outline" onPress={() => router.push('/settings/appearance')} />
      {user.tipo === 'trabajador' ? (
        <Button title="Verificación profesional" variant="secondary" icon="shield-checkmark-outline" onPress={() => router.push('/verification')} />
      ) : null}
      <Button title="Cerrar sesión" variant="ghost" icon="log-out-outline" onPress={async () => { await signOut(); router.replace('/'); }} />
    </Screen>
  );
}
