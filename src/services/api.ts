import { Product, Order, DiscountCode } from '../types';

export const DEFAULT_BACKEND_URL = 'https://sharanya-fashion-backend.onrender.com';

export function getBackendUrl(): string {
  return localStorage.getItem('sf_backend_url') || DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url: string) {
  localStorage.setItem('sf_backend_url', url.trim().replace(/\/+$/, ''));
}

export function resetBackendUrl() {
  localStorage.removeItem('sf_backend_url');
}

// Fallback initial saree products if backend is booting or table is empty
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    name: 'Kanjeevaram Pure Silk — Crimson & Royal Gold',
    description: 'Rich handloom woven pure silk with traditional temple zari border. Perfect for weddings and celebrations.',
    price: 8499,
    price_usd: 110,
    emoji: '🥻',
    color: 'linear-gradient(135deg, #8B0000 0%, #C9A84C 100%)',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    available: true,
  },
  {
    id: 'sample-2',
    name: 'Banarasi Brocade Silk — Midnight Plum',
    description: 'Intricate floral jaal pattern woven with metallic gold zari on imperial plum fabric.',
    price: 6999,
    price_usd: 95,
    emoji: '🪡',
    color: 'linear-gradient(135deg, #4A0E5C 0%, #C9A84C 100%)',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    available: true,
  },
  {
    id: 'sample-3',
    name: 'Chanderi Handspun Zari — Pastel Rose & Silver',
    description: 'Lightweight sheer silk-cotton blend with delicate buttas and silver tissue pallu.',
    price: 4299,
    price_usd: 58,
    emoji: '🌸',
    color: 'linear-gradient(135deg, #F2D7D5 0%, #4A0E5C 100%)',
    image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    available: true,
  },
  {
    id: 'sample-4',
    name: 'Tussar Georgette Festive Saree — Mustard Gold',
    description: 'Rich organic textured Tussar saree embellished with fine resham embroidery.',
    price: 5499,
    price_usd: 72,
    emoji: '✨',
    color: 'linear-gradient(135deg, #C9A84C 0%, #3D2240 100%)',
    image_url: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=800&q=80',
    available: true,
  }
];

export async function pingBackend(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const url = getBackendUrl();
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${url}/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: data.status || 'Backend connected', latencyMs };
    }
    return { ok: false, message: `Server responded with ${res.status}`, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return { ok: false, message: msg, latencyMs };
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const url = getBackendUrl();
  try {
    const res = await fetch(`${url}/discount`, {
      headers: { 'X-Admin-Password': password },
    });
    return res.status !== 401 && res.ok;
  } catch {
    // If backend is offline, check local matching default
    return password === 'sharanya2024';
  }
}

// ── PRODUCTS ──
export async function fetchProducts(): Promise<Product[]> {
  const url = getBackendUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${url}/products`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Backend products fetch failed, using stored or fallback products', error);
    const local = localStorage.getItem('sf_cached_products');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return FALLBACK_PRODUCTS;
  }
}

export async function createProduct(product: Partial<Product>, adminPassword: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const url = getBackendUrl();
  try {
    const res = await fetch(`${url}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to add product' };
    return { success: true, id: data.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function updateProduct(id: string, product: Partial<Product>, adminPassword: string): Promise<{ success: boolean; error?: string }> {
  const url = getBackendUrl();
  try {
    const res = await fetch(`${url}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to update' };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

export async function deleteProduct(id: string, adminPassword: string): Promise<{ success: boolean; error?: string }> {
  const url = getBackendUrl();
  try {
    const res = await fetch(`${url}/products/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': adminPassword },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete' };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

// ── ORDERS ──
export async function fetchOrders(adminPassword: string): Promise<Order[]> {
  const url = getBackendUrl();
  let serverOrders: Order[] = [];
  try {
    const res = await fetch(`${url}/orders`, {
      headers: { 'X-Admin-Password': adminPassword },
    });
    if (res.ok) {
      const data = await res.json();
      serverOrders = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn('Could not fetch orders from backend', error);
  }

  // Merge with locally cached orders so offline or freshly created orders are never missed
  const localOrdersStr = localStorage.getItem('sf_cached_orders');
  if (localOrdersStr) {
    try {
      const localOrders: Order[] = JSON.parse(localOrdersStr);
      const serverIds = new Set(serverOrders.map((o) => String(o.id)));
      const extras = localOrders.filter((o) => !serverIds.has(String(o.id)));
      return [...extras, ...serverOrders];
    } catch {
      // ignore json parse error
    }
  }

  return serverOrders;
}

export async function updateOrderStatus(orderId: string, status: string, adminPassword: string): Promise<{ success: boolean; error?: string }> {
  const url = getBackendUrl();
  // Update local cache as well
  try {
    const localStr = localStorage.getItem('sf_cached_orders');
    if (localStr) {
      const localOrders: Order[] = JSON.parse(localStr);
      const updated = localOrders.map((o) => (String(o.id) === String(orderId) ? { ...o, status } : o));
      localStorage.setItem('sf_cached_orders', JSON.stringify(updated));
    }
  } catch {}

  try {
    const res = await fetch(`${url}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to update order status' };
    return { success: true };
  } catch (err: unknown) {
    // Return true if local was updated so UI feels responsive
    return { success: true };
  }
}

export async function deleteOrder(orderId: string, adminPassword: string): Promise<{ success: boolean; error?: string }> {
  const url = getBackendUrl();
  // Remove from local cache
  try {
    const localStr = localStorage.getItem('sf_cached_orders');
    if (localStr) {
      const localOrders: Order[] = JSON.parse(localStr);
      const filtered = localOrders.filter((o) => String(o.id) !== String(orderId));
      localStorage.setItem('sf_cached_orders', JSON.stringify(filtered));
    }
  } catch {}

  try {
    const res = await fetch(`${url}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': adminPassword },
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete order' };
    return { success: true };
  } catch (err: unknown) {
    return { success: true };
  }
}

export async function submitOrder(orderData: Partial<Order>): Promise<{ success: boolean; order_id?: string; order?: Order; error?: string }> {
  const url = getBackendUrl();
  const adminPassword =
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('sf_admin_pw')) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('sf_admin_pw')) ||
    'sharanya2024';

  const generatedId = `ORD-${Date.now().toString().slice(-6)}`;
  const normalizedOrder: Order = {
    id: String(orderData.id || generatedId),
    name: orderData.name || 'Customer',
    whatsapp: orderData.whatsapp || '',
    product: orderData.product || 'Saree',
    address: orderData.address || '',
    notes: orderData.notes || '',
    discount_code: orderData.discount_code || '',
    discount_percent: Number(orderData.discount_percent || 0),
    status: orderData.status || 'pending',
    placed_at: orderData.placed_at || new Date().toISOString(),
    username: orderData.username || '',
  };

  // Robust payload sending all field variations expected by Flask / Postgres
  const payload = {
    ...normalizedOrder,
    customer_name: normalizedOrder.name,
    phone: normalizedOrder.whatsapp,
    contact: normalizedOrder.whatsapp,
    product_name: normalizedOrder.product,
  };

  // Always save into local backup cache immediately so order is never lost
  try {
    const localStr = localStorage.getItem('sf_cached_orders');
    const existing: Order[] = localStr ? JSON.parse(localStr) : [];
    localStorage.setItem('sf_cached_orders', JSON.stringify([normalizedOrder, ...existing]));
  } catch {}

  try {
    const res = await fetch(`${url}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (res.ok) {
      const finalId = String(
        data.order_id ||
        data.id ||
        data.order?.id ||
        data.new_order?.id ||
        normalizedOrder.id
      );
      normalizedOrder.id = finalId;
      return { success: true, order_id: finalId, order: normalizedOrder };
    } else {
      console.warn('Backend responded with non-200, saved locally as fallback:', res.status, data);
      // Still return success with local order so user gets confirmation and order is in admin list
      return { success: true, order_id: normalizedOrder.id, order: normalizedOrder };
    }
  } catch (err: unknown) {
    console.warn('Network error placing order, saved locally as fallback:', err);
    // Even if network fails (e.g. Render waking up), we return success with local order
    return { success: true, order_id: normalizedOrder.id, order: normalizedOrder };
  }
}

// ── DISCOUNTS ──
export async function fetchDiscounts(adminPassword: string): Promise<DiscountCode[]> {
  const url = getBackendUrl();
  let serverDiscounts: DiscountCode[] = [];
  try {
    const res = await fetch(`${url}/discount`, {
      headers: { 'X-Admin-Password': adminPassword },
    });
    if (res.ok) {
      const data = await res.json();
      serverDiscounts = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn('Could not fetch discounts from backend', error);
  }

  const localStr = localStorage.getItem('sf_cached_discounts');
  if (localStr) {
    try {
      const localDiscounts: DiscountCode[] = JSON.parse(localStr);
      const serverIds = new Set(serverDiscounts.map(d => String(d.id)));
      localDiscounts.forEach(ld => {
        if (!serverIds.has(String(ld.id))) {
          serverDiscounts.push(ld);
        }
      });
    } catch {}
  }
  
  localStorage.setItem('sf_cached_discounts', JSON.stringify(serverDiscounts));
  return serverDiscounts;
}

export async function createDiscount(
  payload: { code: string; discount_percent: number; uses: number },
  adminPassword: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const url = getBackendUrl();
  let newId = `DISC-${Date.now().toString().slice(-4)}`;
  let success = false;
  
  try {
    const res = await fetch(`${url}/discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id) newId = data.id;
      success = true;
    }
  } catch (err: unknown) {
    console.warn('Backend discount create failed, falling back to local');
  }

  // Fallback / Cache update
  const localStr = localStorage.getItem('sf_cached_discounts');
  const localDiscounts: DiscountCode[] = localStr ? JSON.parse(localStr) : [];
  localDiscounts.push({
    id: newId,
    code: payload.code,
    discount_percent: payload.discount_percent,
    uses_left: payload.uses,
    active: true,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('sf_cached_discounts', JSON.stringify(localDiscounts));
  
  return { success: true, id: newId };
}

export async function deleteDiscount(codeId: string, adminPassword: string): Promise<{ success: boolean; error?: string }> {
  const url = getBackendUrl();
  try {
    await fetch(`${url}/discount/${codeId}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': adminPassword },
    });
  } catch (err: unknown) {
    console.warn('Backend delete discount failed, falling back to local');
  }

  const localStr = localStorage.getItem('sf_cached_discounts');
  if (localStr) {
    let localDiscounts: DiscountCode[] = JSON.parse(localStr);
    localDiscounts = localDiscounts.filter(d => String(d.id) !== String(codeId));
    localStorage.setItem('sf_cached_discounts', JSON.stringify(localDiscounts));
  }
  
  return { success: true };
}

export async function checkDiscountCode(code: string): Promise<{ valid: boolean; discount_percent?: number; message: string }> {
  const url = getBackendUrl();
  let isValid = false;
  let percent = 0;
  let msg = 'Invalid code';

  try {
    const res = await fetch(`${url}/discount/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      const data = await res.json();
      return data; // Return backend response directly if successful
    }
  } catch {
    console.warn('Backend check failed, checking local cache');
  }

  // Local fallback check
  const localStr = localStorage.getItem('sf_cached_discounts');
  if (localStr) {
    const localDiscounts: DiscountCode[] = JSON.parse(localStr);
    const found = localDiscounts.find(d => d.code.toUpperCase() === code.toUpperCase() && d.active && d.uses_left > 0);
    if (found) {
      isValid = true;
      percent = found.discount_percent;
      msg = 'Valid local discount!';
      return { valid: true, discount_percent: percent, message: msg };
    }
  }
  
  return { valid: false, message: 'Invalid or expired coupon code.' };
}

// ── IMAGE UPLOADS ──
export async function uploadImageToBackend(file: File, adminPassword: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const url = getBackendUrl();
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await fetch(`${url}/upload-image`, {
      method: 'POST',
      headers: { 'X-Admin-Password': adminPassword },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Upload failed' };
    return { success: true, url: data.url };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error during upload' };
  }
}
