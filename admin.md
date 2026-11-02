# Admin Module Documentation

## Overview

The admin module provides a secure dashboard for managing products, orders, and promotional offers. It uses JWT-based authentication and is accessible via the `/admin` API prefix.

---

## Authentication

### Flow
1. Admin submits email + password to `POST /admin/login`
2. Server validates credentials against `.env` values (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
3. On success, a JWT token (24h expiry) is returned
4. Frontend stores the token in `localStorage`
5. All subsequent requests include `Authorization: Bearer <token>` header

### Middleware — `adminAuth`
Every protected route passes through `adminAuth`, which:
- Extracts the Bearer token from `Authorization` header
- Verifies the JWT signature and expiry
- Attaches decoded admin data to `req.admin`
- Returns `401` if token is missing, invalid, or expired

---

## API Endpoints

Base URL: `/admin`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/admin/login` | ❌ Public | Admin login |

**Request Body:**
```json
{
  "email": "admin@apple-store.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "data": { "name": "Admin", "email": "admin@apple-store.com" }
}
```

---

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/admin/product/:id` | ✅ JWT | Update product (name, price, stock) |
| `DELETE` | `/admin/product/:id` | ✅ JWT | Delete a product |

> **Note:** Adding products uses the existing public endpoint `POST /product/add-product` (multipart/form-data).

#### PUT `/admin/product/:id`

**Request Body:**
```json
{
  "name": "Sticker Name",
  "price": 20,
  "stock": 50
}
```

**Business Logic:**
- The `price` sent is treated as the **original price** (`originalPrice` field)
- If an active offer exists for the product's category, the actual `price` is recalculated with the discount applied
- For **stickers**, the frontend enforces a fixed price of 20 (Small) / 25 (Medium), so the admin cannot change it

---

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/orders` | ✅ JWT | Get all orders (newest first) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Customer Name",
      "email": "customer@email.com",
      "phone": "01234567890",
      "products": [
        { "name": "Product Name", "quantity": 2 }
      ],
      "totalPrice": 100,
      "status": true,
      "paymentMethod": "cod",
      "createdAt": "2026-03-01T..."
    }
  ]
}
```

---

### Offers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/offers` | ✅ JWT | Get all offers (newest first) |
| `POST` | `/admin/offer` | ✅ JWT | Create a new offer |
| `DELETE` | `/admin/offer/:id` | ✅ JWT | Delete an offer |

#### POST `/admin/offer`

**Request Body:**
```json
{
  "title": "Summer Sale",
  "category": "stickers",
  "discountType": "percentage",
  "discountValue": 20,
  "startDate": "2026-03-01",
  "expiryDate": "2026-03-31"
}
```

**Business Logic:**
- `discountType` can be `"percentage"` or `"fixed"`
- On creation, the offer is **automatically applied** to all existing products in the matching category — their `price` is recalculated from `originalPrice`
- When a new product is added to a category with an active offer, the discount is auto-applied

#### DELETE `/admin/offer/:id`

**Business Logic:**
- Deletes the offer from the database
- **Automatically reverts** all affected products in the category back to their `originalPrice`
- If another active offer exists for the same category, that offer is applied instead

---

## Offer Auto-Expiry (Cron Job)

A background cron job runs every **60 seconds** to check for expired offers:
1. Finds all offers where `expiryDate < now` and `isActive === true`
2. Sets `isActive = false` on expired offers
3. Reverts all products in the affected category to their `originalPrice`

---

## Pricing Rules

| Category | Price Behavior |
|----------|---------------|
| **Stickers** | Fixed: Small = LE 20, Medium = LE 25. Admin cannot change. Size affects price on the storefront only. |
| **All other categories** | Dynamic: Admin sets price freely via add/edit. |

---

## Frontend Files

| File | Purpose |
|------|---------|
| `FE/pages/admin-dashboard.html` | Admin dashboard UI (products, orders, offers tabs) |
| `FE/pages/admin-login.html` | Admin login page |
| `FE/js/admin-dashboard.js` | Dashboard logic: CRUD, tab switching, form handling |
| `FE/css/admin-dashboard.css` | Dashboard styling (green/white theme) |

## Backend Files

| File | Purpose |
|------|---------|
| `BE/src/modules/admin/admin.controller.ts` | Express router with 7 routes |
| `BE/src/modules/admin/admin.service.ts` | Business logic for all admin operations |
| `BE/src/modules/admin/admin.middleware.ts` | JWT Bearer token verification |
| `BE/src/modules/admin/offer.helpers.ts` | Shared functions: calculate discounts, apply/revert offers |
| `BE/src/modules/admin/offer.cron.ts` | Cron job for auto-expiring offers |
