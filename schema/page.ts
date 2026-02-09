import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'blocks',
      title: 'Page Blocks',
      type: 'array',
      of: [
        // Hero
        {
          type: 'object',
          name: 'hero',
          title: 'Hero Section',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'subtitle', type: 'string' },
            { name: 'description', type: 'text' },
            { name: 'image', type: 'image' },
            { name: 'cta_primary', type: 'string', title: 'Primary CTA Text' },
            { name: 'cta_primary_link', type: 'string', title: 'Primary CTA Link' },
            { name: 'cta_secondary', type: 'string', title: 'Secondary CTA Text' },
            { name: 'cta_secondary_link', type: 'string', title: 'Secondary CTA Link' },
          ],
        },
        // Predebut Hero
        {
          type: 'object',
          name: 'predebut_hero',
          title: 'Predebut Hero',
          fields: [
            { name: 'top_text', type: 'string', initialValue: 'we are amii' },
            { name: 'image', type: 'image' },
            { name: 'status_text', type: 'string', initialValue: 'LOADING...' },
            { name: 'cta_text', type: 'string', initialValue: 'JOIN THE QUEUE' },
            { name: 'cta_link', type: 'string' },
          ],
        },
        // Intro
        {
          type: 'object',
          name: 'intro',
          title: 'Intro Section',
          fields: [
            { name: 'heading', type: 'string' },
            { name: 'content', type: 'text' },
            { name: 'image', type: 'image' },
          ],
        },
        // Widget
        {
          type: 'object',
          name: 'widget',
          title: 'Widget',
          fields: [
            {
              name: 'widget_type',
              type: 'string',
              options: {
                list: [
                  { title: 'Newsletter', value: 'newsletter' },
                  { title: 'Player', value: 'player' },
                ],
              },
            },
          ],
        },
        // Page Hero (Simple Header)
        {
          type: 'object',
          name: 'page_hero',
          title: 'Page Header',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'subtitle', type: 'string' },
          ],
        },
        // Rich Text
        {
          type: 'object',
          name: 'rich_text',
          title: 'Rich Text',
          fields: [
            {
              name: 'body',
              type: 'text', // In Sanity this should be PortableText mainly, but keeping it simple text/markdown for now to match current setup logic
              title: 'Markdown Body'
            }
          ],
        },
        // Grids
        {
          type: 'object',
          name: 'shop_grid',
          title: 'Shop Grid',
          fields: [
            { name: 'title', type: 'string', initialValue: 'Shop' },
            { name: 'limit', type: 'number', initialValue: 12 },
          ],
        },
        {
          type: 'object',
          name: 'music_grid',
          title: 'Music Grid',
          fields: [
            { name: 'title', type: 'string', initialValue: 'Music' },
          ],
        },
        {
          type: 'object',
          name: 'press_grid',
          title: 'Press Grid',
          fields: [
            { name: 'title', type: 'string', initialValue: 'Press' },
          ],
        },
        {
          type: 'object',
          name: 'members_grid',
          title: 'Members Grid',
          fields: [
            { name: 'title', type: 'string', initialValue: 'Members' },
          ],
        },
        // Contact
        {
          type: 'object',
          name: 'contact_form',
          title: 'Contact Form',
          fields: [
            { name: 'title', type: 'string', initialValue: 'Contact Us' },
            { name: 'endpoint', type: 'string' },
          ],
        },
        {
          type: 'object',
          name: 'contact_section',
          title: 'Contact Section',
          fields: [
            { name: 'title', type: 'string', initialValue: 'SAY HELLO' },
            { name: 'subtitle', type: 'string', initialValue: 'Have a question...' },
            { name: 'management_email', type: 'string', initialValue: 'mgmt@amiiverse.com' },
            { name: 'press_email', type: 'string', initialValue: 'press@amiiverse.com' },
            { name: 'bookings_email', type: 'string', initialValue: 'bookings@amiiverse.com' },
            { name: 'inquiries_email', type: 'string', initialValue: 'hello@amiiverse.com' },
            { name: 'show_socials', type: 'boolean', initialValue: true },
          ],
        },
      ],
    }),
  ],
})
