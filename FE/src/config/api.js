const DEFAULT_API_URL = 'https://applestore-56bvbi1n.b4a.run';

export const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
