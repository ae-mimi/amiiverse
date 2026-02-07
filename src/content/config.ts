import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        slug: z.string().optional(),
        blocks: z.array(z.any()).optional(), // We can be more strict here later if needed, but 'any' allows flexiblity for now as we define blocks
    }),
});

export const collections = {
    pages,
};
