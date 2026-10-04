import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/lib/session';
import type { ApiEnvelope, ApiFailure, AuthTokens, User } from '@/types/api';

const XAMPP_PROJECT = 'NAXVO_Movil';

function stripPort(value: string) {
  const clean = value.replace(/^https?:\/\//i, '').split('/')[0];
  if (clean.startsWith('[')) return clean.replace(/^\[|\].*$/g, '');
  return clean.split(':')[0];
}

function expoHost(): string | null {
  // En Web conviene usar primero el host con el que se abrió la página.
  // Así localhost usa localhost y una apertura por LAN usa la IP LAN.
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || '127.0.0.1';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return stripPort(hostUri);

  const legacy = (Constants as any)?.manifest?.debuggerHost as string | undefined;
  if (legacy) return stripPort(legacy);

  if (Platform.OS === 'android') return '10.0.2.2';
  return '127.0.0.1';
}

function resolveApiUrl() {
  const explicit = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '');
  if (explicit) return explicit;

  const host = expoHost();
  if (!host) return '';
  return `http://${host}/${XAMPP_PROJECT}/backend/public/api/v1`;
}

const API_URL = resolveApiUrl();

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export function apiUrl() {
  return API_URL;
}

export function apiEndpoint(path: string) {
  if (!API_URL) {
    throw new ApiError(
      'configuration_error',
      'No se pudo determinar la dirección de XAMPP. Inicia Expo en modo LAN o define EXPO_PUBLIC_API_URL.',
    );
  }
  return `${API_URL}/${path.replace(/^\//, '')}`;
}

async function requestFetch(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const signal = init.signal ?? controller.signal;

  try {
    return await fetch(url, { ...init, signal });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const aborted = controller.signal.aborted || (error instanceof Error && error.name === 'AbortError');
    if (aborted) {
      throw new ApiError(
        'request_timeout',
        'XAMPP tardó demasiado en responder. Esto suele ocurrir cuando MySQL está detenido o quedó una transacción bloqueada. Reinicia MySQL en XAMPP y vuelve a intentarlo.',
        0,
        { detail, api_url: API_URL },
      );
    }
    throw new ApiError(
      'network_error',
      `No se pudo conectar con XAMPP en ${API_URL}. Comprueba Apache, MySQL, que el teléfono y la PC estén en la misma red y que el firewall permita Apache.`,
      0,
      { detail, api_url: API_URL },
    );
  } finally {
    clearTimeout(timeout);
  }
}

function parsePayload<T>(status: number, raw: string): T {
  let payload: ApiEnvelope<T> | ApiFailure | null = null;

  try {
    payload = raw ? (JSON.parse(raw) as ApiEnvelope<T> | ApiFailure) : null;
  } catch {
    const preview = raw.replace(/\s+/g, ' ').slice(0, 180);
    throw new ApiError(
      'invalid_api_response',
      `XAMPP respondió con un formato inesperado (HTTP ${status}). ${preview || 'Respuesta vacía.'}`,
      status,
    );
  }

  if (status < 200 || status >= 300 || !payload || payload.ok === false) {
    const failure = payload && payload.ok === false ? payload : null;
    const details = failure?.error.details;
    let message = failure?.error.message ?? `No fue posible completar la solicitud (HTTP ${status}).`;

    if (failure?.error.code === 'validation_error') {
      if (details?.fields && typeof details.fields === 'object') {
        const fieldMessages = Object.values(details.fields).filter(value => typeof value === 'string') as string[];
        if (fieldMessages.length) message = fieldMessages.join('\n');
      } else if (Array.isArray(details?.messages)) {
        const messages = details.messages.filter(value => typeof value === 'string') as string[];
        if (messages.length) message = messages.join('\n');
      }
    }

    throw new ApiError(
      failure?.error.code ?? 'http_error',
      message,
      status,
      details,
    );
  }

  return payload.data;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  return parsePayload<T>(response.status, raw);
}

let refreshing: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await requestFetch(apiEndpoint('auth/refresh.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await parseResponse<{ user: User; auth: AuthTokens }>(response);
    await saveTokens(data.auth);
    return true;
  } catch (error) {
    // Un fallo temporal de red/servidor no debe borrar una sesión válida.
    // Solo limpiamos credenciales cuando el backend confirma que el refresh
    // ya no es utilizable (401/403 o un error explícito de autenticación).
    if (
      error instanceof ApiError
      && (
        error.status === 0
        || error.status >= 500
        || ['request_timeout', 'network_error', 'database_unavailable', 'database_busy', 'server_error'].includes(error.code)
      )
    ) {
      throw error;
    }

    await clearTokens();
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
  retry = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  const isForm = typeof FormData !== 'undefined' && init.body instanceof FormData;

  headers.set('Accept', 'application/json');
  if (!isForm && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await requestFetch(apiEndpoint(path), { ...init, headers });

  if (response.status === 401 && auth && retry) {
    refreshing ??= refreshSession().finally(() => {
      refreshing = null;
    });
    if (await refreshing) return apiRequest<T>(path, init, auth, false);
  }

  return parseResponse<T>(response);
}

/**
 * Sube un archivo al backend. En Android/iOS usa expo-file-system para evitar
 * los fallos multipart de algunas versiones de React Native. En Web usa
 * FormData nativo del navegador.
 */
export async function uploadSingleFile<T>(
  path: string,
  fileUri: string,
  options: {
    fieldName: string;
    mimeType?: string | null;
    parameters?: Record<string, string>;
  },
  auth = true,
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (Platform.OS === 'web') {
    try {
      const source = await fetch(fileUri);
      if (!source.ok && !fileUri.startsWith('blob:') && !fileUri.startsWith('data:')) {
        throw new Error(`No se pudo leer el archivo local (HTTP ${source.status}).`);
      }
      const blob = await source.blob();
      const form = new FormData();
      const mime = options.mimeType || blob.type || 'application/octet-stream';
      const extension = mime.includes('/') ? mime.split('/')[1].replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '') : 'bin';
      form.append(options.fieldName, blob, `naxvo-${Date.now()}.${extension || 'bin'}`);
      Object.entries(options.parameters ?? {}).forEach(([key, value]) => form.append(key, value));

      const response = await requestFetch(apiEndpoint(path), {
        method: 'POST',
        headers,
        body: form,
      });

      if (response.status === 401 && auth && retry) {
        refreshing ??= refreshSession().finally(() => {
          refreshing = null;
        });
        if (await refreshing) return uploadSingleFile<T>(path, fileUri, options, auth, false);
      }

      return parseResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const detail = error instanceof Error ? error.message : String(error);
      throw new ApiError(
        'file_upload_network_error',
        'No se pudo enviar el archivo desde el navegador. Comprueba que Apache esté activo y vuelve a seleccionar el archivo.',
        0,
        { detail, api_url: API_URL, file_uri: fileUri },
      );
    }
  }

  let result: FileSystem.FileSystemUploadResult;
  try {
    result = await FileSystem.uploadAsync(apiEndpoint(path), fileUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: options.fieldName,
      mimeType: options.mimeType || undefined,
      parameters: options.parameters,
      headers,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      'file_upload_network_error',
      'No se pudo enviar el archivo al servidor. Comprueba Apache, la red local y vuelve a intentarlo.',
      0,
      { detail, api_url: API_URL, file_uri: fileUri },
    );
  }

  if (result.status === 401 && auth && retry) {
    refreshing ??= refreshSession().finally(() => {
      refreshing = null;
    });
    if (await refreshing) return uploadSingleFile<T>(path, fileUri, options, auth, false);
  }

  return parsePayload<T>(result.status, result.body ?? '');
}

