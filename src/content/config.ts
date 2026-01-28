import { defineCollection, z } from 'astro:content';

const eras = defineCollection({
  type: 'content',
  schema: () => z.object({
    name: z.string(),
    texture: z.string().optional(),
    logoLight: z.string().optional(),
    logoDark: z.string().optional(),
    bgColor: z.string(),
    textColor: z.string(),
    accentColor: z.string(),
    headingFont: z.string().default('Starbim'),
    bodyFont: z.string().default('Archivo'),
  }),
});

const releases = defineCollection({
  type: 'content',
  schema: () => z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    credits: z.string(),
    cover: z.string(),
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
  schema: () => z.object({
    name: z.string(),
    photo: z.string(),
    bio: z.string(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: () => z.object({
    title: z.string().optional(),
    // Home
    heroType: z.string().optional(),
    heroImage: z.string().optional(),
    heroVideo: z.string().optional(),
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroLink: z.string().optional(),
    heroLinkText: z.string().optional(),
    latestReleasesTitle: z.string().optional(),
    comingSoonText: z.string().optional(),
    // About
    heading: z.string().optional(),
    description: z.string().optional(),
    meaningTitle: z.string().optional(),
    meaningText: z.string().optional(),
    valuesTitle: z.string().optional(),
    valuesList: z.array(z.string()).optional(),
    // Contact
    bookingsTitle: z.string().optional(),
    partnershipsTitle: z.string().optional(),
    fanMailTitle: z.string().optional(),
    formNameLabel: z.string().optional(),
    formEmailLabel: z.string().optional(),
    formMessageLabel: z.string().optional(),
    formButtonText: z.string().optional(),
    // Shop
    placeholderText: z.string().optional(),
    buttonText: z.string().optional(),
    // Music
    emptyStateText: z.string().optional(),
    emptyStateSubtext: z.string().optional(),
    // Links
    profileImage: z.string().optional(),
    profileName: z.string().optional(),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })).optional(),
    // Thank You
    message: z.string().optional(),
  }),
});

export const collections = {
  eras,
  releases,
  members,
  pages,
};
