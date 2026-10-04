import * as Device from 'expo-device';
import { apiRequest, uploadSingleFile } from './client';
import { saveTokens, clearTokens } from '@/lib/session';
import type { AuthTokens, Category, HomeData, PortfolioItem, RequestDetailResponse, Review, ServiceOffering, ServiceRequest, User, Worker } from '@/types/api';

export async function login(email: string, password: string) {
  const data = await apiRequest<{ user: User; auth: AuthTokens }>('auth/login.php', {
    method: 'POST', body: JSON.stringify({ email, password, device_name: Device.modelName ?? 'NAXVO móvil' }),
  }, false);
  await saveTokens(data.auth); return data.user;
}

export async function register(payload: Record<string, unknown>) {
  const data = await apiRequest<{ user: User; auth: AuthTokens; next_step: string }>('auth/register.php', {
    method: 'POST', body: JSON.stringify({ ...payload, device_name: Device.modelName ?? 'NAXVO móvil' }),
  }, false);
  await saveTokens(data.auth); return data;
}

export const getMe = () => apiRequest<{ user: User }>('auth/me.php').then(x => x.user);
export async function logout(allDevices = false) {
  try { await apiRequest('auth/logout.php', { method: 'POST', body: JSON.stringify({ all_devices: allDevices }) }); } finally { await clearTokens(); }
}
export const getHome = () => apiRequest<HomeData>('home.php', {}, false);
export const getCategories = () => apiRequest<{ categories: Category[] }>('catalog/categories.php', {}, false).then(x => x.categories);
export const getWorkers = (query = '') => apiRequest<{ workers: Worker[] }>(`workers/index.php${query ? `?${query}` : ''}`).then(x => x.workers);
export const getWorker = (id: number) => apiRequest<{ worker: Worker; portfolio: PortfolioItem[]; reviews: Review[] }>(`workers/show.php?id=${id}`);
export const getFavorites = () => apiRequest<{ workers: Worker[] }>('favorites/index.php').then(x => x.workers);
export const toggleFavorite = (workerId: number) => apiRequest<{ worker_id: number; favorite: boolean }>('favorites/toggle.php', { method: 'POST', body: JSON.stringify({ worker_id: workerId }) });
export const getRequests = () => apiRequest<{ requests: ServiceRequest[] }>('requests/index.php').then(x => x.requests);
export const getOpportunities = () => apiRequest<{ verified: boolean; requests: ServiceRequest[] }>('requests/opportunities.php');
export const acceptOpportunity = (id: number) => apiRequest('requests/accept.php', { method: 'POST', body: JSON.stringify({ request_id: id }) });
export const declineOpportunity = (id: number) => apiRequest('requests/decline.php', { method: 'POST', body: JSON.stringify({ request_id: id }) });
export const createRequest = (payload: Record<string, unknown>) => apiRequest<{ request_id: number }>('requests/create.php', { method: 'POST', body: JSON.stringify(payload) });
export const uploadRequestImage = (requestId: number, asset: { uri: string; mimeType?: string | null }) =>
  uploadSingleFile<{ request_id: number; url?: string | null }>('requests/image.php', asset.uri, {
    fieldName: 'imagen',
    mimeType: asset.mimeType || 'image/jpeg',
    parameters: { request_id: String(requestId) },
  });

export const startService = (requestId: number) => apiRequest<{ request_id: number; estado: string }>('requests/start.php', {
  method: 'POST', body: JSON.stringify({ request_id: requestId }),
});
export const requestServiceCompletion = (requestId: number, notas: string) => apiRequest<{ request_id: number; finalizacion_estado: string }>('completion/request.php', {
  method: 'POST', body: JSON.stringify({ request_id: requestId, notas }),
});
export const requestCompletionCorrection = (requestId: number, motivo: string) => apiRequest<{ request_id: number; finalizacion_estado: string }>('completion/correction.php', {
  method: 'POST', body: JSON.stringify({ request_id: requestId, motivo }),
});
export const confirmServiceCompletion = (requestId: number) => apiRequest<{ request_id: number; estado: string; finalizacion_estado: string }>('completion/confirm.php', {
  method: 'POST', body: JSON.stringify({ request_id: requestId }),
});
export async function uploadCompletionEvidence(requestId: number, asset: { uri: string; mimeType?: string | null }) {
  return uploadSingleFile<{ request_id: number; evidence: { path: string; url?: string | null } }>('completion/evidence.php', asset.uri, {
    fieldName: 'evidencia',
    mimeType: asset.mimeType || 'image/jpeg',
    parameters: { request_id: String(requestId) },
  });
}

export const getRequest = (id: number) => apiRequest<RequestDetailResponse>(`requests/show.php?id=${id}`);
export const getMessages = (requestId: number, afterId = 0) => apiRequest<{ messages: any[] }>(`chat/messages.php?request_id=${requestId}${afterId ? `&after_id=${afterId}` : ''}`).then(x => x.messages);
export const sendMessage = (requestId: number, message: string) => apiRequest<{ message: any }>('chat/send.php', { method: 'POST', body: JSON.stringify({ request_id: requestId, message }) });
export const getNotifications = () => apiRequest<{ unread_count: number; notifications: any[] }>('notifications/index.php');
export const markNotification = (id: number) => apiRequest('notifications/read.php', { method: 'POST', body: JSON.stringify({ notification_id: id }) });
export const getPortfolio = () => apiRequest<{ portfolio: PortfolioItem[] }>('portfolio/index.php').then(x => x.portfolio);
export const getVerification = () => apiRequest<{ verification: any }>('verification/index.php').then(x => x.verification);
export const updateProfile = (payload: Record<string, unknown>) => apiRequest<{ user: User }>('profile/update.php', { method: 'PATCH', body: JSON.stringify(payload) }).then(x => x.user);
export const updateAppearance = (payload: { tema_preferido: string; modo_color: string }) => apiRequest<{ user: User }>('profile/appearance.php', { method: 'PATCH', body: JSON.stringify(payload) }).then(x => x.user);
export const setAvailability = (disponible: boolean) => apiRequest<{ user: User }>('profile/availability.php', { method: 'PATCH', body: JSON.stringify({ disponible }) }).then(x => x.user);

export async function uploadProfilePhoto(asset: { uri: string; mimeType?: string | null }) {
  return uploadSingleFile<{ user: User }>('profile/photo.php', asset.uri, {
    fieldName: 'foto',
    mimeType: asset.mimeType || 'image/jpeg',
  }).then(x => x.user);
}

export async function createPortfolioItem(payload: { uri: string; beforeUri?: string; titulo: string; descripcion: string; categoria: string; etiquetas: string; fecha_realizado: string }) {
  const created = await uploadSingleFile<{ portfolio_id: number }>('portfolio/create.php', payload.uri, {
    fieldName: 'imagen',
    mimeType: 'image/jpeg',
    parameters: {
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      categoria: payload.categoria,
      etiquetas: payload.etiquetas,
      fecha_realizado: payload.fecha_realizado,
    },
  });

  if (payload.beforeUri) {
    try {
      await uploadSingleFile('portfolio/before.php', payload.beforeUri, {
        fieldName: 'imagen_antes',
        mimeType: 'image/jpeg',
        parameters: { portfolio_id: String(created.portfolio_id) },
      });
    } catch (error) {
      await apiRequest('portfolio/delete.php', {
        method: 'DELETE',
        body: JSON.stringify({ portfolio_id: created.portfolio_id }),
      }).catch(() => undefined);
      throw error;
    }
  }

  return created;
}

export async function submitVerification(identificacion: string, document: { uri: string; name: string; type: string }) {
  return uploadSingleFile('verification/submit.php', document.uri, {
    fieldName: 'documento',
    mimeType: document.type || 'application/octet-stream',
    parameters: { identificacion },
  });
}

export const getServices = (query = '') =>
  apiRequest<{ services: ServiceOffering[] }>(`services/index.php${query ? `?${query}` : ''}`).then(x => x.services);

export const getService = (id: number) =>
  apiRequest<{ service: ServiceOffering }>(`services/show.php?id=${id}`).then(x => x.service);

export const getMyServices = () =>
  apiRequest<{ services: ServiceOffering[] }>('services/mine.php').then(x => x.services);

export const createServiceOffering = (payload: Record<string, unknown>) =>
  apiRequest<{ service: ServiceOffering; published: boolean; message: string }>('services/create.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateServiceOffering = (serviceId: number, payload: Record<string, unknown>) =>
  apiRequest<{ service: ServiceOffering }>('services/update.php', {
    method: 'PATCH',
    body: JSON.stringify({ ...payload, service_id: serviceId }),
  }).then(x => x.service);

export const toggleServiceOffering = (serviceId: number, activo: boolean) =>
  apiRequest<{ service: ServiceOffering }>('services/toggle.php', {
    method: 'PATCH',
    body: JSON.stringify({ service_id: serviceId, activo }),
  }).then(x => x.service);

export const deleteServiceOffering = (serviceId: number) =>
  apiRequest<{ deleted: boolean; service_id: number }>('services/delete.php', {
    method: 'DELETE',
    body: JSON.stringify({ service_id: serviceId }),
  });


export const submitQuote = (requestId: number, payload: { monto: string; detalle: string; fecha: string; hora: string }) =>
  apiRequest<{ request_id: number; quoted: boolean }>('requests/quote.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId, ...payload }),
  });

export const respondQuote = (requestId: number, action: 'aceptar' | 'rechazar', reason = '') =>
  apiRequest<{ request_id: number; accepted: boolean }>('requests/quote-response.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId, action, reason }),
  });

export const getPaymentStatus = (requestId: number, refresh = false) =>
  apiRequest<import('@/types/api').PaymentStatusResponse>(`payments/status.php?request_id=${requestId}${refresh ? '&refresh=1' : ''}`);

export const startMercadoPagoCheckout = (requestId: number) =>
  apiRequest<import('@/types/api').PaymentCheckoutResponse>('payments/checkout.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId }),
  });

export const declareCashPayment = (requestId: number) =>
  apiRequest<{ request_id: number; declared: boolean; already_paid: boolean; payment_id: number }>('payments/cash-declare.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId }),
  });

export const confirmCashPayment = (requestId: number) =>
  apiRequest<{ request_id: number; paid: boolean; already_paid: boolean; payment_id: number }>('payments/cash.php', {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId }),
  });

// Administración móvil
export const getAdminDashboard = () =>
  apiRequest<{ summary: any }>('admin/dashboard.php').then(x => x.summary);

export const getAdminUsers = (params: { q?: string; tipo?: string; estado?: string; verificacion?: string; page?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
  return apiRequest<{ result: any }>(`admin/users.php${query.toString() ? `?${query.toString()}` : ''}`).then(x => x.result);
};

export const getAdminUser = (id: number) => apiRequest<{ user: any; requests: any[] }>(`admin/user.php?id=${id}`);
export const setAdminUserStatus = (userId: number, estado: 'activo' | 'suspendido', motivo = '', suspendidoHasta = '') =>
  apiRequest<{ updated: boolean }>('admin/user-status.php', { method: 'POST', body: JSON.stringify({ user_id: userId, estado, motivo, suspendido_hasta: suspendidoHasta }) });

export const getAdminVerifications = (estado = 'pendiente') =>
  apiRequest<{ items: any[] }>(`admin/verifications.php?estado=${encodeURIComponent(estado)}`).then(x => x.items);
export const reviewAdminVerification = (workerId: number, decision: 'aprobada' | 'rechazada', nota = '') =>
  apiRequest<{ updated: boolean }>('admin/verification-action.php', { method: 'POST', body: JSON.stringify({ worker_id: workerId, decision, nota }) });

export const getAdminRequests = (params: { q?: string; estado?: string; pago?: string; page?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
  return apiRequest<{ result: any }>(`admin/requests.php${query.toString() ? `?${query.toString()}` : ''}`).then(x => x.result);
};
export const getAdminRequest = (id: number) => apiRequest<{ request: any; events: any[]; payments: any[]; evidence: any[] }>(`admin/request.php?id=${id}`);
export const cancelAdminRequest = (requestId: number, motivo: string) =>
  apiRequest<{ cancelled: boolean }>('admin/request-cancel.php', { method: 'POST', body: JSON.stringify({ request_id: requestId, motivo }) });

export const getAdminPayments = (params: { q?: string; estado?: string; metodo?: string; page?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
  return apiRequest<{ stats: any; result: any }>(`admin/payments.php${query.toString() ? `?${query.toString()}` : ''}`);
};

export const getAdminReviews = (params: { q?: string; visibilidad?: string; puntuacion?: number; page?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
  return apiRequest<{ result: any }>(`admin/reviews.php${query.toString() ? `?${query.toString()}` : ''}`).then(x => x.result);
};
export const moderateAdminReview = (reviewId: number, visible: boolean, motivo = '') =>
  apiRequest<{ updated: boolean }>('admin/review-action.php', { method: 'POST', body: JSON.stringify({ review_id: reviewId, visible, motivo }) });

export const getAdminReports = (params: { q?: string; estado?: string; categoria?: string; page?: number } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') query.set(k, String(v)); });
  return apiRequest<{ result: any }>(`admin/reports.php${query.toString() ? `?${query.toString()}` : ''}`).then(x => x.result);
};
export const getAdminReport = (id: number) => apiRequest<{ report: any }>(`admin/report.php?id=${id}`).then(x => x.report);
export const resolveAdminReport = (reportId: number, estado: 'en_revision' | 'resuelto' | 'descartado', resolucion = '') =>
  apiRequest<{ updated: boolean }>('admin/report-action.php', { method: 'POST', body: JSON.stringify({ report_id: reportId, estado, resolucion }) });

export const getAdminAudit = (page = 1) => apiRequest<{ result: any }>(`admin/audit.php?page=${page}`).then(x => x.result);
export const getAdminSystem = () => apiRequest<{ checks: any[]; security_events: any[] }>('admin/system.php');
