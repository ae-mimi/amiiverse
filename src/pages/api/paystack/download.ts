import type { APIRoute } from "astro";
import { sanityWriteClient } from "../../../lib/sanity/client";

/**
 * GET /api/paystack/download?reference=...
 * Securely streams a digital product file if the order is paid.
 */
export const GET: APIRoute = async ({ url }) => {
    const reference = url.searchParams.get("reference");

    if (!reference) {
        return new Response("Reference required", { status: 400 });
    }

    try {
        // 1. Fetch Order and check status
        const order = await sanityWriteClient.fetch(
            `*[_type == "order" && reference == $reference][0]{
        status, 
        "productId": productSnapshot.productId 
      }`,
            { reference }
        );

        if (!order) {
            return new Response("Order not found", { status: 404 });
        }

        if (order.status !== "paid") {
            return new Response("Order not paid", { status: 403 });
        }

        // 2. Fetch Product to get the actual digital file
        const product = await sanityWriteClient.fetch(
            `*[_id == $productId][0]{
        title,
        digitalFile {
          asset->{
            url,
            originalFilename,
            mimeType
          }
        }
      }`,
            { productId: order.productId }
        );

        if (!product?.digitalFile?.asset?.url) {
            return new Response("Digital file not found for this product", { status: 404 });
        }

        const { url: fileUrl, originalFilename, mimeType } = product.digitalFile.asset;

        // 3. Stream the file
        const fileResponse = await fetch(fileUrl);

        if (!fileResponse.ok) {
            return new Response("Error fetching file from storage", { status: 500 });
        }

        const headers = new Headers(fileResponse.headers);
        headers.set("Content-Disposition", `attachment; filename="${originalFilename || 'amii-download'}"`);
        headers.set("Content-Type", mimeType || "application/octet-stream");

        return new Response(fileResponse.body, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error("[Download Error]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
