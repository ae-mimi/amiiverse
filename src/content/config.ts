import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        slug: z.string().optional(),
        blocks: z.array(z.any()).optional(), // We can be more strict here later if needed, but 'any' allows flexiblity for now as we define blocks
    }),
});

const members = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        role: z.string(),
        fact: z.string(),
        image: z.string(),
    }),
});

const music = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        cover: z.string(),
        spotify: z.string().optional(),
    }),
});

const press = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        file: z.string().optional(),
    }),
});

const shop = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        price: z.string(),
        image: z.string(),
        url: z.string(),
    }),
});

export const collections = {
    pages,
    members,
    music,
    press,
    shop,
};
