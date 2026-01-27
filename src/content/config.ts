import { defineCollection, z } from 'astro:content';

const eras = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    texture: image().optional(),
    bgColor: z.string(),
    textColor: z.string(),
    accentColor: z.string(),
    headingFont: z.string().default('Starbim'),
    bodyFont: z.string().default('Archivo'),
  }),
});

const releases = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    credits: z.string(),
    cover: image(),
    spotify: z.string().optional(),
    apple: z.string().optional(),
    youtube: z.string().optional(),
    audiomack: z.string().optional(),
    boomplay: z.string().optional(),
    soundcloud: z.string().optional(),
    deezer: z.string().optional(),
    tidal: z.string().optional(),
    amazon: z.string().optional(),
    era: z.string().optional(), // Reference to era slug
  }),
});

const members = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    photo: image(),
    bio: z.string(),
  }),
});

export const collections = {
  eras,
  releases,
  members,
};
