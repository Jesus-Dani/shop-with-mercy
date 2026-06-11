import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

const BASE = `https://res.cloudinary.com/${PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryOptions {
	width?: number;
	height?: number;
	aspectRatio?: string; // e.g. '4:5', '1:1'
	crop?: 'fill' | 'fit' | 'thumb' | 'scale';
	quality?: 'auto' | number;
}

export function cdnUrl(publicId: string, opts: CloudinaryOptions = {}): string {
	const parts: string[] = ['f_auto', `q_${opts.quality ?? 'auto'}`];
	if (opts.width) parts.push(`w_${opts.width}`);
	if (opts.height) parts.push(`h_${opts.height}`);
	if (opts.aspectRatio) parts.push(`ar_${opts.aspectRatio}`);
	if (opts.crop) parts.push(`c_${opts.crop}`);
	return `${BASE}/${parts.join(',')}/${publicId}`;
}

export function cdnSrcset(
	publicId: string,
	widths: number[],
	opts: Omit<CloudinaryOptions, 'width'> = {}
): string {
	return widths.map((w) => `${cdnUrl(publicId, { ...opts, width: w })} ${w}w`).join(', ');
}

// <sizes> attribute for product card thumbnails
export const CARD_SIZES = '(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw';

// <sizes> attribute for product page main image
export const HERO_SIZES = '(min-width: 768px) 50vw, 100vw';
