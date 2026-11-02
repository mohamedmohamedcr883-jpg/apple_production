import { API_BASE } from '../config/api';

// --- Auth Helper ---
export function getToken() {
    return localStorage.getItem('token');
}

export function getAdminToken() {
    return localStorage.getItem('adminToken');
}

// --- Base Fetchers ---
export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

export async function adminApiFetch(method, path, body = null) {
    const isFormData = body instanceof FormData;
    const opts = {
        method,
        headers: {
            'Authorization': `Bearer ${getAdminToken()}`,
        }
    };
    if (!isFormData) opts.headers['Content-Type'] = 'application/json';
    if (body) opts.body = isFormData ? body : JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    let data;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    
    if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        window.location.href = '/pages/admin-login.html';
        return;
    }
    if (!res.ok && data) {
        return {
            success: false,
            message: data.message || data.error || `Request failed with status ${res.status}`,
            errorDetails: data.errorDetails
        };
    }
    return data;
}

// --- Public / Customer API ---
export async function fetchProducts() {
    const { data } = await apiFetch('/product/get-all-products');
    return data;
}

export async function loginUser(email, password) {
    const res = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
}

export async function registerUser(payload) {
    const res = await fetch(`${API_BASE}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return await res.json();
}

export async function sendOtp(email) {
    const res = await fetch(`${API_BASE}/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return await res.json();
}

export async function verifyOtp(email, code) {
    const res = await fetch(`${API_BASE}/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });
    return await res.json();
}

export async function resetPassword(email, newPassword) {
    const res = await fetch(`${API_BASE}/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
    });
    return await res.json();
}

export async function addTransaction(payload) {
    const res = await fetch(`${API_BASE}/transaction/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
    });
    return await res.json();
}

// --- Admin API ---
export async function getAdminProducts() {
    return await adminApiFetch('GET', '/product/get-all-products');
}

export async function createProduct(payload) {
    return await adminApiFetch('POST', '/admin/product', payload);
}

export async function deleteProduct(id) {
    return await adminApiFetch('DELETE', `/admin/product/${id}`);
}

export async function updateProduct(id, payload) {
    return await adminApiFetch('PUT', `/admin/product/${id}`, payload);
}

export async function getOrders() {
    return await adminApiFetch('GET', '/admin/orders');
}

export async function getOffers() {
    return await adminApiFetch('GET', '/admin/offers');
}

export async function createOffer(payload) {
    return await adminApiFetch('POST', '/admin/offer', payload);
}

export async function deleteOffer(id) {
    return await adminApiFetch('DELETE', `/admin/offer/${id}`);
}
