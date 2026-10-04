import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { createRequest, getCategories, uploadRequestImage } from '@/api';
import { ApiError } from '@/api/client';
import { Button, Card, Field, Screen, Title } from '@/components/ui';
import { DatePickerField, TimePickerField } from '@/components/SchedulePicker';
import { useTheme } from '@/context/ThemeContext';
import type { Category } from '@/types/api';

type RequestForm = {
  servicio: string;
  descripcion: string;
  urgencia: string;
  instrucciones: string;
  calle: string;
  numero: string;
  colonia: string;
  ciudad: string;
  estado_dir: string;
  codigo_postal: string;
  fecha_preferida: string;
  hora_preferida: string;
  metodo_pago: string;
  latitud: string;
  longitud: string;
  trabajador_id: string;
  servicio_publicado_id: string;
};

export default function NewRequest() {
  const params = useLocalSearchParams<{
    workerId?: string;
    service?: string;
    serviceOfferingId?: string;
    serviceTitle?: string;
  }>();
  const { palette } = useTheme();
  const [cats, setCats] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [form, setForm] = useState<RequestForm>({
    servicio: params.service ?? '',
    descripcion: '',
    urgencia: 'media',
    instrucciones: '',
    calle: '',
    numero: '',
    colonia: '',
    ciudad: '',
    estado_dir: '',
    codigo_postal: '',
    fecha_preferida: '',
    hora_preferida: '',
    metodo_pago: 'efectivo',
    latitud: '',
    longitud: '',
    trabajador_id: params.workerId ?? '',
    servicio_publicado_id: params.serviceOfferingId ?? '',
  });

  useEffect(() => {
    getCategories().then(setCats).catch(error => {
      console.warn('NAXVO categorías:', error);
    });
  }, []);

  const set = (key: keyof RequestForm, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  async function pickPhotos() {
    if (photos.length >= 5) {
      Alert.alert('Imágenes', 'Puedes adjuntar un máximo de 5 imágenes por solicitud.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Fotos', 'Necesitamos permiso para seleccionar imágenes del problema.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
      quality: 0.82,
    });
    if (result.canceled) return;
    setPhotos(current => [...current, ...result.assets].slice(0, 5));
  }

  async function addLocation() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Ubicación', 'Permiso no concedido. Puedes continuar escribiendo la dirección manualmente.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setForm(current => ({
        ...current,
        latitud: String(position.coords.latitude),
        longitud: String(position.coords.longitude),
      }));
      Alert.alert('Ubicación agregada', 'Se usará para encontrar servicios cercanos.');
    } catch (error) {
      console.warn('NAXVO ubicación:', error);
      Alert.alert('Ubicación', 'No fue posible obtener tu ubicación. Puedes continuar con la dirección escrita.');
    }
  }

  function validateBeforeSend(): string | null {
    if (!form.servicio) return 'Selecciona una categoría de servicio.';
    if (form.descripcion.trim().length < 15) return 'Describe el problema con al menos 15 caracteres.';

    const requiredAddress: Array<[keyof RequestForm, string]> = [
      ['calle', 'calle'],
      ['numero', 'número'],
      ['colonia', 'colonia'],
      ['ciudad', 'ciudad'],
      ['estado_dir', 'estado'],
    ];
    for (const [key, label] of requiredAddress) {
      if (!form[key].trim()) return `Indica ${label} del servicio.`;
    }

    if (!/^[0-9A-Za-z -]{4,10}$/.test(form.codigo_postal.trim())) {
      return 'Indica un código postal válido.';
    }
    if (form.fecha_preferida && !/^\d{4}-\d{2}-\d{2}$/.test(form.fecha_preferida)) {
      return 'La fecha preferida debe usar el formato AAAA-MM-DD.';
    }
    if (form.hora_preferida && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.hora_preferida)) {
      return 'La hora preferida debe usar el formato HH:MM.';
    }
    if (Boolean(form.fecha_preferida) !== Boolean(form.hora_preferida)) {
      return 'Selecciona fecha y hora juntas, o deja el horario flexible.';
    }
    return null;
  }

  async function submit() {
    if (busy) return;
    const validation = validateBeforeSend();
    if (validation) {
      Alert.alert('Revisa la solicitud', validation);
      return;
    }

    setBusy(true);
    try {
      const result = await createRequest(form);
      let failedPhotos = 0;
      for (const photo of photos) {
        try {
          await uploadRequestImage(result.request_id, { uri: photo.uri, mimeType: photo.mimeType });
        } catch {
          failedPhotos += 1;
        }
      }
      if (failedPhotos > 0) {
        Alert.alert('Solicitud creada', `Folio #${result.request_id}. La solicitud quedó registrada, pero ${failedPhotos} imagen(es) no pudieron subirse.`);
      } else {
        Alert.alert('Solicitud creada', `Folio #${result.request_id}${photos.length ? ` · ${photos.length} imagen(es) adjunta(s)` : ''}`);
      }
      router.replace('/(client)/requests');
    } catch (error) {
      Alert.alert('No se pudo crear', error instanceof ApiError ? error.message : 'Revisa los datos e intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title
        subtitle={params.workerId
          ? 'Se enviará directamente al profesional seleccionado.'
          : 'Puedes publicar una solicitud abierta para que un profesional compatible la tome.'}
      >
        Nueva solicitud
      </Title>

      {params.serviceTitle ? (
        <Card>
          <Text style={{ color: palette.text, fontWeight: '900' }}>Servicio seleccionado</Text>
          <Text style={{ color: palette.muted }}>{params.serviceTitle}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={{ color: palette.text, fontWeight: '900' }}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {cats.map(category => (
            <Pressable
              key={category.slug}
              onPress={() => set('servicio', category.name)}
              style={{
                borderWidth: 1,
                borderColor: form.servicio === category.name ? palette.primary : palette.border,
                borderRadius: 99,
                paddingHorizontal: 11,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: palette.text }}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Field
        label="Describe el problema"
        value={form.descripcion}
        onChangeText={value => set('descripcion', value)}
        multiline
        maxLength={2000}
        placeholder="Qué sucede, desde cuándo y qué necesitas…"
      />
      <Field
        label="Instrucciones adicionales"
        value={form.instrucciones}
        onChangeText={value => set('instrucciones', value)}
        multiline
        maxLength={1000}
      />

      <Text style={{ color: palette.text, fontWeight: '800' }}>Urgencia</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['baja', 'media', 'alta', 'emergencia'].map(urgency => (
          <Pressable
            key={urgency}
            onPress={() => set('urgencia', urgency)}
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 99,
              borderColor: form.urgencia === urgency ? palette.primary : palette.border,
            }}
          >
            <Text style={{ color: palette.text }}>{urgency}</Text>
          </Pressable>
        ))}
      </View>

      <Title>Dirección del servicio</Title>
      <Field label="Calle" value={form.calle} onChangeText={value => set('calle', value)} maxLength={100} />
      <Field label="Número" value={form.numero} onChangeText={value => set('numero', value)} maxLength={20} />
      <Field label="Colonia" value={form.colonia} onChangeText={value => set('colonia', value)} maxLength={100} />
      <Field label="Ciudad" value={form.ciudad} onChangeText={value => set('ciudad', value)} maxLength={100} />
      <Field label="Estado" value={form.estado_dir} onChangeText={value => set('estado_dir', value)} maxLength={100} />
      <Field
        label="Código postal"
        value={form.codigo_postal}
        onChangeText={value => set('codigo_postal', value)}
        maxLength={10}
      />
      <Button
        title={form.latitud ? 'Ubicación agregada' : 'Usar ubicación actual'}
        variant="secondary"
        icon="location-outline"
        onPress={addLocation}
      />
      <Card>
        <View style={{ gap: 4 }}>
          <Text style={{ color: palette.primary, fontWeight: '900', fontSize: 13 }}>PROGRAMACIÓN</Text>
          <Text style={{ color: palette.text, fontWeight: '900', fontSize: 18 }}>¿Cuándo necesitas el servicio?</Text>
          <Text style={{ color: palette.muted, lineHeight: 20 }}>Elige la fecha en el calendario y una hora disponible. Si todavía no lo sabes, puedes dejarlo flexible y acordarlo con el profesional.</Text>
        </View>
        <DatePickerField label="Fecha preferida" value={form.fecha_preferida} onChange={value => set('fecha_preferida', value)} />
        <TimePickerField label="Hora preferida" value={form.hora_preferida} onChange={value => set('hora_preferida', value)} />
        {(form.fecha_preferida || form.hora_preferida) ? <Button title="Dejar horario flexible" variant="ghost" icon="refresh-outline" onPress={() => setForm(current => ({ ...current, fecha_preferida: '', hora_preferida: '' }))} /> : null}
      </Card>

      <Card>
        <View style={{ gap: 4 }}>
          <Text style={{ color: palette.primary, fontWeight: '900', fontSize: 13 }}>IMÁGENES</Text>
          <Text style={{ color: palette.text, fontWeight: '900', fontSize: 18 }}>Ayuda al profesional a entender el problema</Text>
          <Text style={{ color: palette.muted, lineHeight: 20 }}>Puedes adjuntar hasta 5 fotos JPG, PNG o WebP. Son opcionales.</Text>
        </View>
        {photos.length ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {photos.map((photo, index) => <View key={`${photo.uri}-${index}`} style={{ position: 'relative' }}>
            <Image source={{ uri: photo.uri }} style={{ width: 92, height: 92, borderRadius: 12, backgroundColor: palette.surface2 }} />
            <Pressable onPress={() => setPhotos(current => current.filter((_, i) => i !== index))} style={{ position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,.72)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>×</Text>
            </Pressable>
          </View>)}
        </View> : null}
        <Button title={photos.length ? `Agregar más fotos (${photos.length}/5)` : 'Agregar fotos'} variant="secondary" icon="images-outline" onPress={() => void pickPhotos()} disabled={photos.length >= 5 || busy} />
      </Card>

      <Text style={{ color: palette.text, fontWeight: '800' }}>Método de pago</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['efectivo', 'mercadopago'].map(method => (
          <Pressable
            key={method}
            onPress={() => set('metodo_pago', method)}
            style={{
              flex: 1,
              padding: 12,
              borderWidth: 1,
              borderRadius: 12,
              borderColor: form.metodo_pago === method ? palette.primary : palette.border,
            }}
          >
            <Text style={{ color: palette.text, textAlign: 'center', fontWeight: '800' }}>
              {method === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: palette.muted, lineHeight: 20 }}>
        {form.metodo_pago === 'mercadopago'
          ? 'Mercado Pago se abrirá cuando exista una cotización aceptada. El cobro se procesa directamente con Mercado Pago y NAXVO verifica el resultado en el backend.'
          : 'El efectivo se confirma entre cliente y profesional desde la solicitud para dejar registro del pago.'}
      </Text>

      <Button title="Publicar solicitud" icon="send-outline" onPress={submit} loading={busy} />
      <Button title="Cancelar" variant="ghost" onPress={() => router.back()} disabled={busy} />
    </Screen>
  );
}
