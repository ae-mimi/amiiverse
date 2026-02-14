import { defineField, defineType } from 'sanity'
import {
  PageIcon,
  HeroHomeIcon, HeroPredebutIcon, HeroPageIcon,
  IntroIcon, RichTextIcon, GalleryIcon, VideoIcon,
  CTAIcon, CountdownIcon, FAQIcon, TestimonialIcon,
  MusicGridIcon, MembersGridIcon, ShopGridIcon, PressGridIcon, EventsIcon,
  WidgetIcon, ContactFormIcon, ContactInfoIcon,
  SpacerIcon, DividerIcon, MarqueeIcon, LyricIcon,
} from './icons'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: PageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The name of this page — also appears in the browser tab.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'The URL for this page. Click "Generate" to create from the title.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blocks',
      title: 'Page Content',
      description: 'Build your page by adding sections below. Drag to reorder them.',
      type: 'array',
      of: [
        // ═══════════════════════════════════════
        //  HEROES — Large banners at the top
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'hero',
          title: 'Homepage Banner',
          icon: HeroHomeIcon,
          description: 'A large banner with your photo, headline, and buttons — best as the first section on your homepage.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Headline', description: 'The big text visitors see first.', validation: (rule) => rule.required() }),
            defineField({ name: 'subtitle', type: 'string', title: 'Subtitle', description: 'A short line below the headline.' }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 3, description: 'A paragraph introducing your group.' }),
            defineField({ name: 'image', type: 'image', title: 'Banner Image', description: 'The main photo displayed in the banner.', options: { hotspot: true } }),
            defineField({ name: 'cta_primary', type: 'string', title: 'Primary Button Text', description: 'Label for the main button, e.g. "Listen Now".' }),
            defineField({ name: 'cta_primary_link', type: 'string', title: 'Primary Button Link', description: 'Where the button goes — a page URL or external link.' }),
            defineField({ name: 'cta_secondary', type: 'string', title: 'Secondary Button Text', description: 'Label for a second, less prominent button.' }),
            defineField({ name: 'cta_secondary_link', type: 'string', title: 'Secondary Button Link' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'subtitle' },
            prepare({ title, subtitle }) {
              return { title: title || 'Homepage Banner', subtitle: subtitle || 'Hero section' }
            },
          },
        },
        {
          type: 'object',
          name: 'predebut_hero',
          title: 'Pre-Debut Teaser',
          icon: HeroPredebutIcon,
          description: 'A teaser banner with "Loading..." animation and a sign-up button — use before your official debut.',
          fields: [
            defineField({ name: 'top_text', type: 'string', title: 'Top Text', description: 'Text shown above the image.', initialValue: 'we are amii' }),
            defineField({ name: 'image', type: 'image', title: 'Teaser Image', description: 'Your pre-debut concept photo.', options: { hotspot: true } }),
            defineField({ name: 'status_text', type: 'string', title: 'Animated Status', description: 'Text that animates below the image (e.g. "LOADING...").', initialValue: 'LOADING...' }),
            defineField({ name: 'cta_text', type: 'string', title: 'Button Text', description: 'The call-to-action button label.', initialValue: 'JOIN THE QUEUE' }),
            defineField({ name: 'cta_link', type: 'string', title: 'Button Link', description: 'Where the button leads (e.g. sign-up page).' }),
          ],
          preview: {
            select: { title: 'top_text', subtitle: 'status_text' },
            prepare({ title, subtitle }) {
              return { title: title || 'Pre-Debut Teaser', subtitle: subtitle || '' }
            },
          },
        },
        {
          type: 'object',
          name: 'page_hero',
          title: 'Page Header',
          icon: HeroPageIcon,
          description: 'A simple title and subtitle at the top of an inner page — use for About, Contact, Press, etc.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Page Title', description: 'The heading displayed at the top.', validation: (rule) => rule.required() }),
            defineField({ name: 'subtitle', type: 'string', title: 'Subtitle', description: 'An optional short description below the title.' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Page Header', subtitle: 'Inner page heading' }
            },
          },
        },

        // ═══════════════════════════════════════
        //  CONTENT — Text, images, and media
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'intro',
          title: 'Intro Section',
          icon: IntroIcon,
          description: 'Text with an optional image beside it — great for introducing yourself, your story, or a new era.',
          fields: [
            defineField({ name: 'heading', type: 'string', title: 'Heading', description: 'The title of this section.' }),
            defineField({ name: 'content', type: 'text', title: 'Body Text', rows: 5, description: 'Tell your story, describe an era, or introduce something new.' }),
            defineField({ name: 'image', type: 'image', title: 'Photo', description: 'An image shown next to the text.', options: { hotspot: true } }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare({ title }) {
              return { title: title || 'Intro Section', subtitle: 'Text + image' }
            },
          },
        },
        {
          type: 'object',
          name: 'rich_text',
          title: 'Text Block',
          icon: RichTextIcon,
          description: 'A simple text area — for paragraphs, announcements, or any written content.',
          fields: [
            defineField({ name: 'body', type: 'text', title: 'Content', rows: 10, description: 'Write whatever you like. This is a free-form text area.' }),
          ],
          preview: {
            select: { body: 'body' },
            prepare({ body }) {
              return {
                title: body ? body.substring(0, 60) + '…' : 'Text Block',
                subtitle: 'Plain text',
              }
            },
          },
        },
        {
          type: 'object',
          name: 'gallery',
          title: 'Photo Gallery',
          icon: GalleryIcon,
          description: 'A grid of photos — concept photos, behind-the-scenes shots, era teasers, event highlights.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Gallery Title', description: 'A heading above the photos (e.g. "Concept Photos").' }),
            defineField({
              name: 'images',
              type: 'array',
              title: 'Photos',
              description: 'Upload your images here. Drag to reorder. Click on an image to set a crop focus point.',
              of: [{
                type: 'image',
                options: { hotspot: true },
                fields: [
                  defineField({ name: 'alt', type: 'string', title: 'Alt Text', description: 'A short description for accessibility (e.g. "Group photo on stage").' }),
                  defineField({ name: 'caption', type: 'string', title: 'Caption', description: 'Optional text shown below the photo.' }),
                ],
              }],
              validation: (rule) => rule.min(1),
            }),
            defineField({
              name: 'columns',
              type: 'number',
              title: 'Layout',
              description: 'How many photos per row.',
              options: { list: [{ title: '2 per row', value: 2 }, { title: '3 per row', value: 3 }, { title: '4 per row', value: 4 }] },
              initialValue: 3,
            }),
          ],
          preview: {
            select: { title: 'title', images: 'images' },
            prepare({ title, images }) {
              const count = images?.length || 0
              return { title: title || 'Photo Gallery', subtitle: `${count} photo${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'video_embed',
          title: 'Video',
          icon: VideoIcon,
          description: 'Embed a YouTube or Vimeo video — music videos, dance practices, vlogs, behind-the-scenes.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'An optional heading above the video.' }),
            defineField({ name: 'video_url', type: 'url', title: 'Video Link', description: 'Paste the YouTube or Vimeo URL here. Example: https://youtube.com/watch?v=...', validation: (rule) => rule.required() }),
            defineField({ name: 'caption', type: 'string', title: 'Caption', description: 'Optional text shown below the video.' }),
          ],
          preview: {
            select: { title: 'title', url: 'video_url' },
            prepare({ title, url }) {
              return { title: title || 'Video', subtitle: url || 'No video link yet' }
            },
          },
        },

        // ═══════════════════════════════════════
        //  ENGAGEMENT — Drive action
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'cta_banner',
          title: 'Promo Banner',
          icon: CTAIcon,
          description: 'An eye-catching banner to promote something — pre-save a song, buy tickets, shop merch, or any call-to-action.',
          fields: [
            defineField({ name: 'heading', type: 'string', title: 'Headline', description: 'What are you promoting? Keep it short and punchy.', validation: (rule) => rule.required() }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 3, description: 'A sentence or two with more details.' }),
            defineField({ name: 'button_text', type: 'string', title: 'Button Text', description: 'What should the button say? (e.g. "Pre-Save Now", "Get Tickets")', validation: (rule) => rule.required() }),
            defineField({ name: 'button_link', type: 'string', title: 'Button Link', description: 'Where the button leads — a URL or page path.', validation: (rule) => rule.required() }),
            defineField({ name: 'bg_image', type: 'image', title: 'Background Photo', description: 'An optional photo behind the text. A dark overlay is added automatically.', options: { hotspot: true } }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'button_text' },
            prepare({ title, subtitle }) {
              return { title: title || 'Promo Banner', subtitle: subtitle ? `Button: "${subtitle}"` : '' }
            },
          },
        },
        {
          type: 'object',
          name: 'countdown',
          title: 'Countdown Timer',
          icon: CountdownIcon,
          description: 'A live countdown ticking toward a date — debut day, album drop, concert, or comeback.',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', description: 'What are you counting down to? (e.g. "Debut in...", "Album drops in...")', validation: (rule) => rule.required() }),
            defineField({ name: 'target_date', type: 'datetime', title: 'Target Date & Time', description: 'Set the exact date and time the countdown reaches zero.', validation: (rule) => rule.required() }),
            defineField({ name: 'finished_text', type: 'string', title: 'Message After Countdown', description: 'What to show when the timer hits zero (e.g. "OUT NOW!", "We\'re here!").', initialValue: 'OUT NOW!' }),
          ],
          preview: {
            select: { title: 'label', date: 'target_date' },
            prepare({ title, date }) {
              const dateStr = date ? new Date(date).toLocaleDateString() : 'No date set'
              return { title: title || 'Countdown Timer', subtitle: dateStr }
            },
          },
        },
        {
          type: 'object',
          name: 'faq',
          title: 'FAQ / Questions & Answers',
          icon: FAQIcon,
          description: 'A list of questions that visitors can click to expand and see the answer — great for fan questions, event info, or group FAQ.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'A heading above the questions.', initialValue: 'Frequently Asked Questions' }),
            defineField({
              name: 'items',
              type: 'array',
              title: 'Questions',
              description: 'Add your questions and answers here.',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'question', type: 'string', title: 'Question', validation: (rule) => rule.required() }),
                  defineField({ name: 'answer', type: 'text', title: 'Answer', rows: 4, validation: (rule) => rule.required() }),
                ],
                preview: {
                  select: { title: 'question' },
                  prepare({ title }) {
                    return { title: title || 'New Question' }
                  },
                },
              }],
              validation: (rule) => rule.min(1),
            }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              const count = items?.length || 0
              return { title: title || 'FAQ', subtitle: `${count} question${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'testimonials',
          title: 'Press Quotes & Endorsements',
          icon: TestimonialIcon,
          description: 'Showcase what the press, industry, or fans are saying about you — quotes displayed as cards.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'A heading above the quotes.', initialValue: 'What People Are Saying' }),
            defineField({
              name: 'quotes',
              type: 'array',
              title: 'Quotes',
              description: 'Add quotes, reviews, or endorsements.',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'quote', type: 'text', title: 'Quote', rows: 3, description: 'The actual quote text.', validation: (rule) => rule.required() }),
                  defineField({ name: 'author', type: 'string', title: 'Who Said It', description: 'Name of the person or publication.' }),
                  defineField({ name: 'source', type: 'string', title: 'Source', description: 'Where it was published (e.g. "Billboard", "NME", "Twitter").' }),
                ],
                preview: {
                  select: { title: 'author', quote: 'quote' },
                  prepare({ title, quote }) {
                    return { title: title || 'Quote', subtitle: quote ? `"${quote.substring(0, 50)}…"` : '' }
                  },
                },
              }],
              validation: (rule) => rule.min(1),
            }),
          ],
          preview: {
            select: { title: 'title', quotes: 'quotes' },
            prepare({ title, quotes }) {
              const count = quotes?.length || 0
              return { title: title || 'Quotes', subtitle: `${count} quote${count !== 1 ? 's' : ''}` }
            },
          },
        },

        // ═══════════════════════════════════════
        //  COLLECTIONS — Auto-display content
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'music_grid',
          title: 'Music Releases',
          icon: MusicGridIcon,
          description: 'Automatically shows all your songs/releases in a grid — pulls from your Music library.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'Heading above the music grid.', initialValue: 'Music' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Music', subtitle: 'Auto-generated from Music library' }
            },
          },
        },
        {
          type: 'object',
          name: 'members_grid',
          title: 'Member Profiles',
          icon: MembersGridIcon,
          description: 'Automatically shows your group members with photos, names, and roles — pulls from your Members library.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'Heading above the members grid.', initialValue: 'Members' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Members', subtitle: 'Auto-generated from Members library' }
            },
          },
        },
        {
          type: 'object',
          name: 'shop_grid',
          title: 'Shop / Merch',
          icon: ShopGridIcon,
          description: 'Shows your merch and products in a grid — pulls from your Shop library.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'Heading above the shop grid.', initialValue: 'Shop' }),
            defineField({ name: 'limit', type: 'number', title: 'Max Items', description: 'How many products to show. Leave empty to show all.', initialValue: 12 }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Shop', subtitle: 'Auto-generated from Shop library' }
            },
          },
        },
        {
          type: 'object',
          name: 'press_grid',
          title: 'Press Coverage',
          icon: PressGridIcon,
          description: 'Shows your press mentions and articles — pulls from your Press library.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'Heading above the press list.', initialValue: 'Press' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Press', subtitle: 'Auto-generated from Press library' }
            },
          },
        },
        {
          type: 'object',
          name: 'events',
          title: 'Tour Dates & Events',
          icon: EventsIcon,
          description: 'List upcoming shows, concerts, fan meetings, and appearances — each event can have ticket links and a status badge.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'Heading above the event list.', initialValue: 'Tour Dates' }),
            defineField({
              name: 'event_list',
              type: 'array',
              title: 'Events',
              description: 'Add your events here. Each one appears as a row with the date, venue, and a ticket button.',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'name', type: 'string', title: 'Event Name', description: 'What is this event called?', validation: (rule) => rule.required() }),
                  defineField({ name: 'date', type: 'datetime', title: 'Date & Time', validation: (rule) => rule.required() }),
                  defineField({ name: 'venue', type: 'string', title: 'Venue', description: 'Name of the venue (e.g. "Madison Square Garden").' }),
                  defineField({ name: 'city', type: 'string', title: 'City', description: 'Which city is this in?' }),
                  defineField({ name: 'ticket_url', type: 'url', title: 'Ticket Link', description: 'Paste the link where fans can buy tickets.' }),
                  defineField({
                    name: 'status',
                    type: 'string',
                    title: 'Ticket Status',
                    description: 'Is this event on sale, sold out, or something else?',
                    options: {
                      list: [
                        { title: 'On Sale', value: 'on_sale' },
                        { title: 'Sold Out', value: 'sold_out' },
                        { title: 'Cancelled', value: 'cancelled' },
                        { title: 'Coming Soon', value: 'coming_soon' },
                      ],
                      layout: 'dropdown',
                    },
                    initialValue: 'on_sale',
                  }),
                ],
                preview: {
                  select: { title: 'name', date: 'date', city: 'city', status: 'status' },
                  prepare({ title, date, city, status }) {
                    const dateStr = date ? new Date(date).toLocaleDateString() : ''
                    const statusLabel = { on_sale: '🟢', sold_out: '🔴', cancelled: '⚫', coming_soon: '🟡' }[(status || 'on_sale') as 'on_sale' | 'sold_out' | 'cancelled' | 'coming_soon']
                    return { title: title || 'Event', subtitle: `${statusLabel} ${dateStr} — ${city || ''}` }
                  },
                },
              }],
            }),
          ],
          preview: {
            select: { title: 'title', events: 'event_list' },
            prepare({ title, events }) {
              const count = events?.length || 0
              return { title: title || 'Events', subtitle: `${count} event${count !== 1 ? 's' : ''}` }
            },
          },
        },

        // ═══════════════════════════════════════
        //  WIDGETS — Interactive elements
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'widget',
          title: 'Newsletter or Music Player',
          icon: WidgetIcon,
          description: 'Add a newsletter sign-up form or an embedded music player to your page.',
          fields: [
            defineField({
              name: 'widget_type',
              type: 'string',
              title: 'What to show',
              description: 'Choose either a newsletter sign-up form or a music player.',
              options: {
                list: [
                  { title: 'Newsletter Sign-Up', value: 'newsletter' },
                  { title: 'Music Player', value: 'player' },
                ],
                layout: 'radio',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'music_item',
              title: 'Song to Play',
              type: 'reference',
              to: [{ type: 'music' }],
              description: 'Pick a song from your Music library.',
              hidden: ({ parent }) => parent?.widget_type !== 'player',
            }),
          ],
          preview: {
            select: { type: 'widget_type', song: 'music_item.title' },
            prepare({ type, song }) {
              if (type === 'player') return { title: `Music Player: ${song || 'No song selected'}`, subtitle: 'Widget' }
              return { title: 'Newsletter Sign-Up', subtitle: 'Widget' }
            },
          },
        },
        {
          type: 'object',
          name: 'contact_form',
          title: 'Contact Form',
          icon: ContactFormIcon,
          description: 'A form where visitors can send you a message — name, email, and message fields.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', description: 'Heading above the form.', initialValue: 'Contact Us' }),
            defineField({ name: 'endpoint', type: 'string', title: 'Custom API Endpoint', description: 'Only change this if you use a custom form handler. Leave blank for default.' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Contact Form', subtitle: 'Email form' }
            },
          },
        },
        {
          type: 'object',
          name: 'contact_section',
          title: 'Contact Info & Emails',
          icon: ContactInfoIcon,
          description: 'Displays your contact emails (management, press, bookings) and social links alongside a form.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Heading', initialValue: 'SAY HELLO' }),
            defineField({ name: 'subtitle', type: 'string', title: 'Subheading', initialValue: 'Have a question...' }),
            defineField({ name: 'management_email', type: 'string', title: 'Management Email', initialValue: 'mgmt@amiiverse.com' }),
            defineField({ name: 'press_email', type: 'string', title: 'Press Email', initialValue: 'press@amiiverse.com' }),
            defineField({ name: 'bookings_email', type: 'string', title: 'Bookings Email', initialValue: 'bookings@amiiverse.com' }),
            defineField({ name: 'inquiries_email', type: 'string', title: 'General Email', initialValue: 'hello@amiiverse.com' }),
            defineField({ name: 'show_socials', type: 'boolean', title: 'Show Social Media Icons', description: 'Display your social media links in this section.', initialValue: true }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Contact Info', subtitle: 'Emails & social links' }
            },
          },
        },

        // ═══════════════════════════════════════
        //  FOLLOW PAGE
        // ═══════════════════════════════════════
        { type: 'profile_header' },
        { type: 'link_stack' },

        // ═══════════════════════════════════════
        //  LAYOUT
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'spacer',
          title: 'Spacer',
          icon: SpacerIcon,
          description: 'Add empty space between sections to create breathing room.',
          fields: [
            defineField({
              name: 'size',
              type: 'string',
              title: 'How much space?',
              options: {
                list: [
                  { title: 'A little', value: 'sm' },
                  { title: 'Medium', value: 'md' },
                  { title: 'A lot', value: 'lg' },
                ],
                layout: 'radio',
              },
              initialValue: 'md',
            }),
          ],
          preview: {
            select: { size: 'size' },
            prepare({ size }) {
              const label = { sm: 'Small gap', md: 'Medium gap', lg: 'Large gap' }[(size || 'md') as 'sm' | 'md' | 'lg']
              return { title: label || 'Spacer', subtitle: 'Empty space' }
            },
          },
        },
        {
          type: 'object',
          name: 'divider',
          title: 'Divider Line',
          icon: DividerIcon,
          description: 'A horizontal line to visually separate sections — choose solid, dashed, dotted, or gradient.',
          fields: [
            defineField({
              name: 'style',
              type: 'string',
              title: 'Line Style',
              description: 'How the line looks.',
              options: {
                list: [
                  { title: 'Solid line', value: 'solid' },
                  { title: 'Dashed line', value: 'dashed' },
                  { title: 'Dotted line', value: 'dotted' },
                  { title: 'Gradient fade', value: 'gradient' },
                ],
                layout: 'radio',
              },
              initialValue: 'solid',
            }),
            defineField({
              name: 'width',
              type: 'string',
              title: 'Width',
              description: 'How wide the line stretches.',
              options: {
                list: [
                  { title: 'Short (centered)', value: 'short' },
                  { title: 'Medium', value: 'medium' },
                  { title: 'Full width', value: 'full' },
                ],
                layout: 'radio',
              },
              initialValue: 'medium',
            }),
          ],
          preview: {
            select: { style: 'style', width: 'width' },
            prepare({ style, width }) {
              const styleLabel = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted', gradient: 'Gradient' }[(style || 'solid') as 'solid' | 'dashed' | 'dotted' | 'gradient']
              const widthLabel = { short: 'Short', medium: 'Medium', full: 'Full' }[(width || 'medium') as 'short' | 'medium' | 'full']
              return { title: `${styleLabel} Divider`, subtitle: `${widthLabel} width` }
            },
          },
        },
        {
          type: 'object',
          name: 'marquee',
          title: 'Scrolling Ticker',
          icon: MarqueeIcon,
          description: 'Text that scrolls across the screen on repeat — great for announcements, hype text, or aesthetic flair.',
          fields: [
            defineField({
              name: 'text',
              type: 'string',
              title: 'Ticker Text',
              description: 'The text that scrolls. It repeats automatically. (e.g. "NEW SINGLE OUT NOW ★ TOUR 2026 ★")',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'speed',
              type: 'string',
              title: 'Scroll Speed',
              options: {
                list: [
                  { title: 'Slow & smooth', value: 'slow' },
                  { title: 'Normal', value: 'normal' },
                  { title: 'Fast & energetic', value: 'fast' },
                ],
                layout: 'radio',
              },
              initialValue: 'normal',
            }),
            defineField({
              name: 'variant',
              type: 'string',
              title: 'Style',
              description: 'How the ticker looks.',
              options: {
                list: [
                  { title: 'Default (matches page)', value: 'default' },
                  { title: 'Bold (inverted colors)', value: 'bold' },
                  { title: 'Subtle (muted text)', value: 'subtle' },
                ],
                layout: 'radio',
              },
              initialValue: 'default',
            }),
          ],
          preview: {
            select: { text: 'text', speed: 'speed' },
            prepare({ text, speed }) {
              const speedLabel = { slow: 'Slow', normal: 'Normal', fast: 'Fast' }[(speed || 'normal') as 'slow' | 'normal' | 'fast']
              return { title: text || 'Scrolling Ticker', subtitle: `${speedLabel} speed` }
            },
          },
        },
        {
          type: 'object',
          name: 'lyric_highlight',
          title: 'Lyric / Quote Highlight',
          icon: LyricIcon,
          description: 'A big, stylized standalone quote — perfect for song lyrics, group mottos, taglines, or inspirational text.',
          fields: [
            defineField({
              name: 'text',
              type: 'text',
              title: 'Quote Text',
              rows: 3,
              description: 'The text to display big and bold.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'attribution',
              type: 'string',
              title: 'Source (optional)',
              description: 'Where the quote is from — a song title, the group name, etc.',
            }),
            defineField({
              name: 'alignment',
              type: 'string',
              title: 'Text Alignment',
              options: {
                list: [
                  { title: 'Left', value: 'left' },
                  { title: 'Center', value: 'center' },
                  { title: 'Right', value: 'right' },
                ],
                layout: 'radio',
              },
              initialValue: 'center',
            }),
          ],
          preview: {
            select: { text: 'text', source: 'attribution' },
            prepare({ text, source }) {
              return {
                title: text ? `"${text.substring(0, 50)}${text.length > 50 ? '…' : ''}"` : 'Quote',
                subtitle: source ? `— ${source}` : 'Lyric / Quote',
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return { title: title || 'Untitled Page', subtitle: slug ? `/${slug}` : 'No URL set' }
    },
  },
})
