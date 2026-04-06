interface PortableTextSpan {
    _type?: string;
    text?: string;
    marks?: string[];
}

interface PortableTextMarkDef {
    _key?: string;
    _type?: string;
    href?: string;
}

export interface PortableTextBlock {
    _type?: string;
    style?: string;
    listItem?: "bullet" | "number";
    level?: number;
    children?: PortableTextSpan[];
    markDefs?: PortableTextMarkDef[];
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderSpan(
    span: PortableTextSpan,
    markDefs: PortableTextMarkDef[],
): string {
    let output = escapeHtml(String(span.text ?? ""));

    for (const mark of span.marks ?? []) {
        const def = markDefs.find((item) => item?._key === mark);
        if (mark === "strong") output = `<strong>${output}</strong>`;
        else if (mark === "em") output = `<em>${output}</em>`;
        else if (mark === "code") output = `<code>${output}</code>`;
        else if (def?._type === "link" && def.href) {
            output = `<a href="${escapeHtml(def.href)}" target="_blank" rel="noreferrer">${output}</a>`;
        }
    }

    return output;
}

function renderInlineContent(block: PortableTextBlock): string {
    return (block.children ?? [])
        .filter((child) => child?._type === "span")
        .map((child) => renderSpan(child, block.markDefs ?? []))
        .join("");
}

export function portableTextToPlainText(blocks: PortableTextBlock[] | undefined): string {
    if (!Array.isArray(blocks) || blocks.length === 0) return "";

    const lines = blocks
        .filter((block) => block?._type === "block")
        .map((block) =>
            (block.children ?? [])
                .filter((child) => child?._type === "span")
                .map((child) => String(child.text ?? "").trim())
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean);

    return lines.join("\n").trim();
}

export function portableTextToHtml(blocks: PortableTextBlock[] | undefined): string {
    if (!Array.isArray(blocks) || blocks.length === 0) return "";

    const html: string[] = [];
    let listType: "bullet" | "number" | null = null;
    let listItems: string[] = [];

    const flushList = () => {
        if (!listType || listItems.length === 0) return;
        const tag = listType === "number" ? "ol" : "ul";
        html.push(`<${tag}>${listItems.join("")}</${tag}>`);
        listType = null;
        listItems = [];
    };

    for (const block of blocks) {
        if (block?._type !== "block") continue;

        const content = renderInlineContent(block).trim();
        if (!content) continue;

        if (block.listItem === "bullet" || block.listItem === "number") {
            if (listType && listType !== block.listItem) {
                flushList();
            }
            listType = block.listItem;
            listItems.push(`<li>${content}</li>`);
            continue;
        }

        flushList();

        const style = block.style || "normal";
        if (style === "h2") html.push(`<h2>${content}</h2>`);
        else if (style === "h3") html.push(`<h3>${content}</h3>`);
        else if (style === "blockquote") html.push(`<blockquote>${content}</blockquote>`);
        else html.push(`<p>${content}</p>`);
    }

    flushList();
    return html.join("");
}
