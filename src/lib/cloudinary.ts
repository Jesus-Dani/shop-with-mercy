import { env } from '$env/dynamic/public';

export interface CloudinaryOptions {
	width?: number;
	height?: number;
	aspectRatio?: string; // e.g. '4:5', '1:1'
	crop?: 'fill' | 'fit' | 'thumb' | 'scale';
	quality?: 'auto' | number;
}

export function cdnUrl(publicId: string, opts: CloudinaryOptions = {}): string {
	const BASE = `https://res.cloudinary.com/${env.PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
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

export const CARD_SIZES = '(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw';
export const HERO_SIZES = '(min-width: 768px) 50vw, 100vw';

async function compressImage(file: File, maxWidth = 1400, quality = 0.85): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			const scale = Math.min(1, maxWidth / img.width);
			const canvas = document.createElement('canvas');
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
			URL.revokeObjectURL(url);
			canvas.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
				'image/jpeg',
				quality
			);
		};
		img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
		img.src = url;
	});
}

export async function uploadToCloudinary(file: File, uploadPreset: string): Promise<string> {
	const blob = await compressImage(file);
	const fd = new FormData();
	fd.append('file', blob, file.name.replace(/\.[^.]+$/, '.jpg'));
	fd.append('upload_preset', uploadPreset);
	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${env.PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
		{ method: 'POST', body: fd }
	);
	if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
	const data = await res.json();
	return data.public_id as string;
}