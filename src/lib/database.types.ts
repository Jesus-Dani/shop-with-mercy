/**
 * Auto-generated Supabase database types.
 * Regenerate after schema changes with:
 *   npx supabase gen types typescript --project-id nqiuxsmzccxiicxdlvnd > src/lib/database.types.ts
 *
 * This stub allows the project to compile before the schema is applied.
 * Replace with the generated output once the migration has been run.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			categories: {
				Row: {
					id: string;
					name: string;
					sort_order: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					sort_order?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					sort_order?: number;
					created_at?: string;
				};
			};
			products: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					category_id: string | null;
					price: number;
					sale_price: number | null;
					cost_price: number | null;
					published: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					category_id?: string | null;
					price: number;
					sale_price?: number | null;
					cost_price?: number | null;
					published?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					category_id?: string | null;
					price?: number;
					sale_price?: number | null;
					cost_price?: number | null;
					published?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			product_colours: {
				Row: {
					id: string;
					product_id: string;
					colour_name: string;
					colour_hex: string | null;
					sort_order: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					product_id: string;
					colour_name: string;
					colour_hex?: string | null;
					sort_order?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					product_id?: string;
					colour_name?: string;
					colour_hex?: string | null;
					sort_order?: number;
					created_at?: string;
				};
			};
			product_images: {
				Row: {
					id: string;
					product_colour_id: string;
					cloudinary_public_id: string;
					sort_order: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					product_colour_id: string;
					cloudinary_public_id: string;
					sort_order?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					product_colour_id?: string;
					cloudinary_public_id?: string;
					sort_order?: number;
					created_at?: string;
				};
			};
			product_variants: {
				Row: {
					id: string;
					product_colour_id: string;
					size: string;
					stock_quantity: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					product_colour_id: string;
					size: string;
					stock_quantity?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					product_colour_id?: string;
					size?: string;
					stock_quantity?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
			orders: {
				Row: {
					id: string;
					order_number: string;
					user_id: string | null;
					customer_name: string;
					customer_email: string;
					customer_phone: string;
					delivery_type: 'within_run' | 'outside_run';
					status: 'pending' | 'paid' | 'fulfilled' | 'delivered' | 'cancelled' | 'refunded';
					subtotal: number;
					paystack_reference: string;
					paystack_channel: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					order_number?: string;
					user_id?: string | null;
					customer_name: string;
					customer_email: string;
					customer_phone: string;
					delivery_type: 'within_run' | 'outside_run';
					status?: 'pending' | 'paid' | 'fulfilled' | 'delivered' | 'cancelled' | 'refunded';
					subtotal: number;
					paystack_reference: string;
					paystack_channel?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					order_number?: string;
					user_id?: string | null;
					customer_name?: string;
					customer_email?: string;
					customer_phone?: string;
					delivery_type?: 'within_run' | 'outside_run';
					status?: 'pending' | 'paid' | 'fulfilled' | 'delivered' | 'cancelled' | 'refunded';
					subtotal?: number;
					paystack_reference?: string;
					paystack_channel?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			order_items: {
				Row: {
					id: string;
					order_id: string;
					product_variant_id: string | null;
					product_name: string;
					colour_name: string;
					size: string;
					quantity: number;
					unit_price: number;
					cost_price: number | null;
				};
				Insert: {
					id?: string;
					order_id: string;
					product_variant_id?: string | null;
					product_name: string;
					colour_name: string;
					size: string;
					quantity: number;
					unit_price: number;
					cost_price?: number | null;
				};
				Update: {
					id?: string;
					order_id?: string;
					product_variant_id?: string | null;
					product_name?: string;
					colour_name?: string;
					size?: string;
					quantity?: number;
					unit_price?: number;
					cost_price?: number | null;
				};
			};
			cart_items: {
				Row: {
					id: string;
					user_id: string;
					product_variant_id: string;
					quantity: number;
					added_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					product_variant_id: string;
					quantity?: number;
					added_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					product_variant_id?: string;
					quantity?: number;
					added_at?: string;
				};
			};
			wishlist_items: {
				Row: {
					id: string;
					user_id: string;
					product_variant_id: string;
					added_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					product_variant_id: string;
					added_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					product_variant_id?: string;
					added_at?: string;
				};
			};
			restock_notifications: {
				Row: {
					id: string;
					product_variant_id: string;
					email: string;
					user_id: string | null;
					notified_at: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					product_variant_id: string;
					email: string;
					user_id?: string | null;
					notified_at?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					product_variant_id?: string;
					email?: string;
					user_id?: string | null;
					notified_at?: string | null;
					created_at?: string;
				};
			};
			reviews: {
				Row: {
					id: string;
					product_id: string;
					user_id: string | null;
					order_id: string;
					rating: number;
					body: string | null;
					is_visible: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					product_id: string;
					user_id?: string | null;
					order_id: string;
					rating: number;
					body?: string | null;
					is_visible?: boolean;
					created_at?: string;
				};
				Update: {
					id?: string;
					product_id?: string;
					user_id?: string | null;
					order_id?: string;
					rating?: number;
					body?: string | null;
					is_visible?: boolean;
					created_at?: string;
				};
			};
			pinterest_pins: {
				Row: {
					id: string;
					user_id: string;
					pin_id: string;
					image_url: string;
					pin_title: string | null;
					fetched_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					pin_id: string;
					image_url: string;
					pin_title?: string | null;
					fetched_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					pin_id?: string;
					image_url?: string;
					pin_title?: string | null;
					fetched_at?: string;
				};
			};
			admin_audit_log: {
				Row: {
					id: string;
					admin_id: string;
					action: string;
					target_table: string;
					target_id: string;
					old_value: Json | null;
					new_value: Json | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					admin_id: string;
					action: string;
					target_table: string;
					target_id: string;
					old_value?: Json | null;
					new_value?: Json | null;
					created_at?: string;
				};
				Update: never;
			};
			admin_users: {
				Row: {
					id: string;
					user_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					created_at?: string;
				};
			};
			profiles: {
				Row: {
					id: string;
					full_name: string;
					phone: string | null;
					pinterest_access_token_id: string | null;
					pinterest_refresh_token_id: string | null;
					pinterest_board_id: string | null;
					pinterest_board_name: string | null;
					pinterest_token_expires_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					full_name: string;
					phone?: string | null;
					pinterest_access_token_id?: string | null;
					pinterest_refresh_token_id?: string | null;
					pinterest_board_id?: string | null;
					pinterest_board_name?: string | null;
					pinterest_token_expires_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					full_name?: string;
					phone?: string | null;
					pinterest_access_token_id?: string | null;
					pinterest_refresh_token_id?: string | null;
					pinterest_board_id?: string | null;
					pinterest_board_name?: string | null;
					pinterest_token_expires_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
