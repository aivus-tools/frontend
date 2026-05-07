export const CALLBACK_URL = process.env.NEXT_PUBLIC_CALLBACK_URL ?? '';

/**
 * API pathnames (without domain) - used for HMAC signature generation
 */
export const ApiPathname = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  CHECK_EMAIL: '/api/v1/auth/check-email',
  RESEND_CONFIRMATION: '/api/v1/auth/resend-confirmation',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  CONFIRM_EMAIL: (token: string) => `/api/v1/auth/confirm-email?token=${token}`,
  USER_INFO: '/api/v1/users/me',
  CHANGE_ROLE: (id: number | string) => `/api/v1/users/${id}/change-group`,
  GET_USERS: '/api/v1/users',
} as const;

export const ApiRoute = {
  BRIEF: (id: string | number) => `/service/briefs/${id}`,
  BRIEF_LIST: `/service/briefs`,
  CATEGORY: (id: string | number) => `/service/categories/${id}`,
  CATEGORY_LIST: `/service/categories`,
  CHANGE_ROLE: (id: number | string) => `/service/users/${id}/change-group`,
  CHECK_EMAIL: `/service/auth/check-email`,
  CONFIRM_EMAIL: (token: string) => `/service/auth/confirm-email?token=${token}`,
  FORGOT_PASSWORD: `/service/auth/forgot-password`,
  RESEND_CONFIRMATION: `/service/auth/resend-confirmation`,
  RESET_PASSWORD: `/service/auth/reset-password`,
  ENTRY: (id: string | number) => `/service/entries/${id}`,
  ENTRY_LIST: `/service/entries`,
  GET_USERS: `/service/users`,
  LOGIN: `/service/auth/login`,
  OFFERS_BY_PROJECT_ID: (projectId: string | number) => `/service/offers/project/${projectId}`,
  OFFER_BY_ID: (id: string | number) => `/service/offers/${id}`,
  OFFER_LIST: `/service/offers`,
  PROJECT: (id: string | number) => `/service/projects/${id}`,
  PROJECT_ARCHIVED: '/service/projects/archived',
  PROJECT_LIST: `/service/projects`,
  PROJECT_RESTORE: (id: string) => `/service/projects/${id}/restore`,
  PROJECT_THUMBNAIL: (id: string | number) => `/service/projects/${id}/thumbnail`,
  RATE: (id: string | number) => `/service/rates/${id}`,
  RATES: '/service/rates',
  RATES_FORK: '/service/rates/fork',
  REGISTER: `/service/auth/register`,
  UNIT_LIST: '/service/units',
  USER_INFO: `/service/users/me`,
  // Shares
  SHARE_LIST: '/service/shares',
  SHARE_BY_TOKEN: (token: string) => `/service/shares/${token}`,
  SHARE_MANAGE: (token: string) => `/service/shares/${token}/manage`,
  SHARE_LINK_TO_BRIEF: (token: string) => `/service/shares/${token}/link`,
  SHARE_EXPORT_DATA: (token: string) => `/service/shares/${token}/export-data`,
  // Offer actions
  OFFER_COPY: (id: string | number) => `/service/offers/${id}/copy`,
  OFFER_STATUS: (id: string | number) => `/service/offers/${id}/status`,
  // Templates
  TEMPLATE_LIST: '/service/templates',
  TEMPLATE: (id: string | number) => `/service/templates/${id}`,
  TEMPLATE_APPLY: (id: string | number) => `/service/templates/${id}/apply`,
  // Rates lookup
  RATES_LOOKUP: '/service/rates/lookup',
  // AI Chat (Brief creation)
  BRIEF_CHAT: '/service/client/briefs/chat',
  BRIEF_CHAT_ANALYZE: '/service/client/briefs/chat/analyze',
  // Comparison
  BRIEF_COMPARISON: (briefId: string) => `/service/client/briefs/${briefId}/comparison`,
  BRIEF_COMPARISON_ANALYZE: (briefId: string) => `/service/client/briefs/${briefId}/comparison/analyze`,
  // XLSX Upload
  XLSX_UPLOAD: '/service/client/xlsx-upload',
  // Profile
  USER_PROFILE: '/service/users/profile',
  USER_PROFILE_AVATAR: '/service/users/profile/avatar',
  // Settings
  USER_SETTINGS: '/service/users/settings',
  CHANGE_PASSWORD: '/service/users/change-password',
  VENDOR_SETTINGS: '/service/vendor/settings',
  VENDOR_SETTINGS_LOGO: '/service/vendor/settings/logo',
  OFFER_EXPORT_DATA: (offerId: string | number) => `/service/offers/${offerId}/export-data`,
  // AI Brief v3
  BRIEF_AI_LIST: '/service/client/briefs/ai',
  BRIEF_AI_DRAFT: '/service/client/briefs/ai/drafts',
  BRIEF_AI_START: (briefId: string) => `/service/client/briefs/ai/${briefId}/start`,
  BRIEF_AI_STATUS: (briefId: string) => `/service/client/briefs/ai/${briefId}/status`,
  BRIEF_AI_CHAT: (briefId: string) => `/service/client/briefs/ai/${briefId}/chat`,
  BRIEF_AI_TRANSCRIBE: (briefId: string) => `/service/client/briefs/ai/${briefId}/transcribe`,
  BRIEF_AI_DETAIL: (briefId: string) => `/service/client/briefs/ai/${briefId}`,
  BRIEF_AI_ATTACHMENTS: (briefId: string) => `/service/client/briefs/ai/${briefId}/attachments`,
  BRIEF_AI_ATTACHMENT_DELETE: (briefId: string, attachmentId: string) =>
    `/service/client/briefs/ai/${briefId}/attachments/${attachmentId}`,
  BRIEF_AI_FEEDBACK: (briefId: string) => `/service/client/briefs/ai/${briefId}/feedback`,
  BRIEF_AI_MESSAGE_TRACE: (briefId: string, messageId: string) =>
    `/service/client/briefs/ai/${briefId}/messages/${messageId}/trace`,
  BRIEF_AI_FINALIZE: (briefId: string) => `/service/client/briefs/ai/${briefId}/finalize`,
  BRIEF_AI_FINAL_DOCUMENTS: (briefId: string) => `/service/client/briefs/ai/${briefId}/final-documents`,
  BRIEF_AI_FINAL_DOCUMENT: (briefId: string, documentId: string) =>
    `/service/client/briefs/ai/${briefId}/final-documents/${documentId}`,
  BRIEF_AI_FINAL_DOCUMENT_PDF: (briefId: string, documentId: string) =>
    `/service/client/briefs/ai/${briefId}/final-documents/${documentId}/pdf`,
  BRIEF_AI_SHARE: (briefId: string) => `/service/client/briefs/ai/${briefId}/share`,
  PUBLIC_BRIEF_SHARE: (token: string) => `/service/public/brief-shares/${token}`,
  PUBLIC_BRIEF_SHARE_DOCUMENT_PDF: (token: string, documentId: string) =>
    `/service/public/brief-shares/${token}/documents/${documentId}/pdf`,
  PUBLIC_BRIEF_AI_DRAFT: '/service/public/briefs/ai/drafts',
  PUBLIC_BRIEF_AI_START: (briefId: string) => `/service/public/briefs/ai/${briefId}/start`,
  PUBLIC_BRIEF_AI_STATUS: (briefId: string) => `/service/public/briefs/ai/${briefId}/status`,
  PUBLIC_BRIEF_AI_CHAT: (briefId: string) => `/service/public/briefs/ai/${briefId}/chat`,
  PUBLIC_BRIEF_AI_TRANSCRIBE: (briefId: string) => `/service/public/briefs/ai/${briefId}/transcribe`,
  PUBLIC_BRIEF_AI_ATTACHMENTS: (briefId: string) => `/service/public/briefs/ai/${briefId}/attachments`,
  PUBLIC_BRIEF_AI_ATTACHMENT_DELETE: (briefId: string, attachmentId: string) =>
    `/service/public/briefs/ai/${briefId}/attachments/${attachmentId}`,
  PUBLIC_BRIEF_AI_DETAIL: (briefId: string) => `/service/public/briefs/ai/${briefId}`,
  PUBLIC_BRIEF_AI_CLAIM: (briefId: string) => `/service/public/briefs/ai/${briefId}/claim`,
  // Pre-Vendors
  PRE_VENDORS: '/service/pre-vendors',
} as const;
