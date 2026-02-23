
export interface ProductVariant {
    id?: number;
    color_name: string;
    color_hex: string;
    size?: string;
    extra_price?: number;
    media?: { url: string; type: string }[];
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock: number;
    created_at?: string;
    design_code?: string;
    is_on_sale?: boolean;
    sale_price?: number;
    variants?: ProductVariant[];
}
