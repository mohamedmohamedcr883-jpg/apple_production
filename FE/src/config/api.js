const DEFAULT_API_URL = 'https://appleproduction-production.up.railway.app';

export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
