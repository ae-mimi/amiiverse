export interface QuickBuyPayload {
    productId?: string;
    variantId?: string;
    quantity: number;
    productType?: "physical" | "digital";
    title?: string;
    price?: number;
    image?: string;
}

export interface FormSubmitState {
    state: "idle" | "success" | "warning" | "error";
    message: string;
}
