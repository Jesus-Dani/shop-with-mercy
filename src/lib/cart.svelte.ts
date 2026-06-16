import { browser } from '$app/environment';
import { track } from './track';

export interface CartItem {
	variantId: string;
	productId: string;
	colourId: string;
	name: string;
	colourName: string;
	size: string;
	price: number; // integer Naira — never float
	quantity: number;
	imagePublicId: string | null;
}

const STORAGE_KEY = 'swm_cart_v1';

function load(): CartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartItem[]) : [];
	} catch {
		return [];
	}
}

function persist(items: CartItem[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

let items = $state<CartItem[]>(load());
let drawerOpen = $state(false);

const count = $derived(items.reduce((s, i) => s + i.quantity, 0));
const total = $derived(items.reduce((s, i) => s + i.price * i.quantity, 0));

function add(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
	const qty = item.quantity ?? 1;
	const idx = items.findIndex((i) => i.variantId === item.variantId);
	if (idx >= 0) {
		items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
	} else {
		items = [...items, { ...item, quantity: qty }];
	}
	persist(items);
	drawerOpen = true;
	if (browser) track('add_to_cart', { product_id: item.productId, variant_id: item.variantId });
}

function remove(variantId: string) {
	items = items.filter((i) => i.variantId !== variantId);
	persist(items);
}

function updateQty(variantId: string, qty: number) {
	if (qty <= 0) { remove(variantId); return; }
	const idx = items.findIndex((i) => i.variantId === variantId);
	if (idx >= 0) {
		items[idx] = { ...items[idx], quantity: qty };
		persist(items);
	}
}

function clear() {
	items = [];
	persist(items);
}

export const cart = {
	get items() { return items; },
	get count() { return count; },
	get total() { return total; },
	get isOpen() { return drawerOpen; },
	open: () => { drawerOpen = true; },
	close: () => { drawerOpen = false; },
	toggle: () => { drawerOpen = !drawerOpen; },
	add,
	remove,
	updateQty,
	clear
};
