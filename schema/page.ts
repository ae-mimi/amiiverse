import { defineField, defineType } from 'sanity'
import {
  PageIcon, SEOIcon,
  HeroHomeIcon, HeroPredebutIcon, HeroPageIcon,
  IntroIcon, RichTextIcon, GalleryIcon, VideoIcon,
  CTAIcon, CountdownIcon, FAQIcon, TestimonialIcon,
  MusicGridIcon, MembersGridIcon, ShopGridIcon, PressGridIcon, EventsIcon,
  WidgetIcon, ContactFormIcon, ContactInfoIcon,
  SpacerIcon, DividerIcon, MarqueeIcon, LyricIcon,
  ReleaseSpotlightIcon, DiscographyGridIcon, VideoGalleryIcon,
  TourDatesIcon, EmailSignupIcon, FanWallIcon, DownloadsCenterIcon,
  TimelineBlockIcon, MediaTextIcon, SmartLinksIcon, CreditsIcon,
  ShortsWallIcon, NewsFeedIcon, PressCoverageIcon, PollBlockIcon,
  NewsletterSignupIcon,
} from './icons'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: PageIcon,
  groups: [
    { name: 'content', title: 'Content', icon: PageIcon, default: true },
    { name: 'seo', title: 'SEO', icon: SEOIcon },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The name of this page — also appears in the browser tab.',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'The URL for this page. Click "Generate" to create from the title.',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      group: 'content',
      description: 'Helps the site know what kind of page this is.',
      options: {
        list: [
          { title: 'Home', value: 'home' },
          { title: 'Music', value: 'music' },
          { title: 'Videos', value: 'videos' },
          { title: 'Tour', value: 'tour' },
          { title: 'About', value: 'about' },
          { title: 'Press / EPK', value: 'press' },
          { title: 'Community', value: 'community' },
          { title: 'News', value: 'news' },
          { title: 'Store', value: 'store' },
          { title: 'Custom', value: 'custom' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'sections',
      title: 'Page Sections',
      description: 'Build your page by adding sections below. Drag to reorder them.',
      type: 'array',
      group: 'content',
      of: [
        // ═══════════════════════════════════════
        //  HEROES — Large banners at the top
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'hero',
          title: 'Homepage Banner',
          icon: HeroHomeIcon,
          description: 'A large banner with your photo, headline, and buttons.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Headline', validation: (rule) => rule.required() }),
            defineField({ name: 'subtitle', type: 'string', title: 'Subtitle' }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 3 }),
            defineField({ name: 'image', type: 'image', title: 'Banner Image', options: { hotspot: true } }),
            defineField({ name: 'cta_primary', type: 'string', title: 'Primary Button Text' }),
            defineField({ name: 'cta_primary_link', type: 'string', title: 'Primary Button Link' }),
            defineField({ name: 'cta_secondary', type: 'string', title: 'Secondary Button Text' }),
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
          description: 'A teaser banner with animation and a sign-up button.',
          fields: [
            defineField({ name: 'top_text', type: 'string', title: 'Top Text', initialValue: 'we are amii' }),
            defineField({ name: 'image', type: 'image', title: 'Teaser Image', options: { hotspot: true } }),
            defineField({ name: 'status_text', type: 'string', title: 'Animated Status', initialValue: 'LOADING...' }),
            defineField({ name: 'cta_text', type: 'string', title: 'Button Text', initialValue: 'JOIN THE QUEUE' }),
            defineField({ name: 'cta_link', type: 'string', title: 'Button Link' }),
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
          description: 'A simple title and subtitle at the top of an inner page.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Page Title', validation: (rule) => rule.required() }),
            defineField({ name: 'subtitle', type: 'string', title: 'Subtitle' }),
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
          description: 'Text with an optional image beside it.',
          fields: [
            defineField({ name: 'heading', type: 'string', title: 'Heading' }),
            defineField({ name: 'content', type: 'text', title: 'Body Text', rows: 5 }),
            defineField({ name: 'image', type: 'image', title: 'Photo', options: { hotspot: true } }),
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
          name: 'media_text',
          title: 'Media + Text',
          icon: MediaTextIcon,
          description: 'Side-by-side media and text block — flexible layout.',
          fields: [
            defineField({ name: 'heading', type: 'string', title: 'Heading' }),
            defineField({ name: 'content', type: 'text', title: 'Body Text', rows: 5 }),
            defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Image Left', value: 'imageLeft' }, { title: 'Image Right', value: 'imageRight' }], layout: 'radio' },
              initialValue: 'imageLeft',
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare({ title }) {
              return { title: title || 'Media + Text', subtitle: 'Side-by-side layout' }
            },
          },
        },
        {
          type: 'object',
          name: 'rich_text',
          title: 'Text Block',
          icon: RichTextIcon,
          description: 'A simple text area for paragraphs, announcements, or written content.',
          fields: [
            defineField({ name: 'body', type: 'text', title: 'Content', rows: 10 }),
          ],
          preview: {
            select: { body: 'body' },
            prepare({ body }) {
              return { title: body ? body.substring(0, 60) + '…' : 'Text Block', subtitle: 'Plain text' }
            },
          },
        },
        {
          type: 'object',
          name: 'gallery_block',
          title: 'Photo Gallery',
          icon: GalleryIcon,
          description: 'A grid of photos.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Gallery Title' }),
            defineField({
              name: 'images',
              type: 'array',
              title: 'Photos',
              of: [{
                type: 'image', options: { hotspot: true }, fields: [
                  defineField({ name: 'alt', type: 'string', title: 'Alt Text' }),
                  defineField({ name: 'caption', type: 'string', title: 'Caption' }),
                ]
              }],
              validation: (rule) => rule.min(1),
            }),
            defineField({
              name: 'columns',
              type: 'number',
              title: 'Layout',
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
          description: 'Embed a YouTube or Vimeo video.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title' }),
            defineField({ name: 'video_url', type: 'url', title: 'Video Link', validation: (rule) => rule.required() }),
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
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
          description: 'An eye-catching banner to promote something.',
          fields: [
            defineField({ name: 'heading', type: 'string', title: 'Headline', validation: (rule) => rule.required() }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 3 }),
            defineField({ name: 'button_text', type: 'string', title: 'Button Text', validation: (rule) => rule.required() }),
            defineField({ name: 'button_link', type: 'string', title: 'Button Link', validation: (rule) => rule.required() }),
            defineField({ name: 'bg_image', type: 'image', title: 'Background Photo', options: { hotspot: true } }),
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
          description: 'A live countdown ticking toward a date.',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Label', validation: (rule) => rule.required() }),
            defineField({ name: 'target_date', type: 'datetime', title: 'Target Date & Time', validation: (rule) => rule.required() }),
            defineField({ name: 'finished_text', type: 'string', title: 'Message After Countdown', initialValue: 'OUT NOW!' }),
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
          title: 'FAQ',
          icon: FAQIcon,
          description: 'A list of expandable questions and answers.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Frequently Asked Questions' }),
            defineField({
              name: 'items',
              type: 'array',
              title: 'Questions',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'question', type: 'string', title: 'Question', validation: (rule) => rule.required() }),
                  defineField({ name: 'answer', type: 'text', title: 'Answer', rows: 4, validation: (rule) => rule.required() }),
                ],
                preview: { select: { title: 'question' }, prepare({ title }) { return { title: title || 'New Question' } } },
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
          description: 'Showcase quotes from press, industry, or fans.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'What People Are Saying' }),
            defineField({
              name: 'quotes',
              type: 'array',
              title: 'Quotes',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'quote', type: 'text', title: 'Quote', rows: 3, validation: (rule) => rule.required() }),
                  defineField({ name: 'author', type: 'string', title: 'Who Said It' }),
                  defineField({ name: 'source', type: 'string', title: 'Source' }),
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
        //  MUSIC PROMOTION
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'release_spotlight',
          title: 'Release Spotlight',
          icon: ReleaseSpotlightIcon,
          description: 'Feature a specific release with artwork, tracklist, and streaming links.',
          fields: [
            defineField({ name: 'release', type: 'reference', title: 'Release', to: [{ type: 'release' }], validation: (rule) => rule.required() }),
            defineField({ name: 'showTracklist', type: 'boolean', title: 'Show Tracklist', initialValue: true }),
            defineField({ name: 'showCredits', type: 'boolean', title: 'Show Credits', initialValue: false }),
            defineField({ name: 'showPreSave', type: 'boolean', title: 'Show Pre-Save', initialValue: false }),
          ],
          preview: {
            select: { release: 'release.title' },
            prepare({ release }) {
              return { title: `Release: ${release || 'None selected'}`, subtitle: 'Release Spotlight' }
            },
          },
        },
        {
          type: 'object',
          name: 'discography_grid',
          title: 'Discography Grid',
          icon: DiscographyGridIcon,
          description: 'Show all releases in a filterable grid.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Discography' }),
            defineField({ name: 'filtersEnabled', type: 'boolean', title: 'Show Filters', initialValue: true }),
            defineField({
              name: 'defaultFilter',
              type: 'string',
              title: 'Default Filter',
              options: { list: [{ title: 'All', value: 'all' }, { title: 'Singles', value: 'singles' }, { title: 'EPs', value: 'eps' }, { title: 'Albums', value: 'albums' }] },
              initialValue: 'all',
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Discography', subtitle: 'Auto-generated from releases' } },
          },
        },
        {
          type: 'object',
          name: 'smart_links',
          title: 'Smart Links',
          icon: SmartLinksIcon,
          description: 'Platform buttons for a specific release.',
          fields: [
            defineField({ name: 'release', type: 'reference', title: 'Release', to: [{ type: 'release' }] }),
          ],
          preview: {
            select: { release: 'release.title' },
            prepare({ release }) { return { title: `Smart Links: ${release || 'None'}` } },
          },
        },
        {
          type: 'object',
          name: 'credits_block',
          title: 'Credits',
          icon: CreditsIcon,
          description: 'Display production credits for a release.',
          fields: [
            defineField({ name: 'release', type: 'reference', title: 'Release', to: [{ type: 'release' }] }),
          ],
          preview: {
            select: { release: 'release.title' },
            prepare({ release }) { return { title: `Credits: ${release || 'None'}` } },
          },
        },

        // ═══════════════════════════════════════
        //  VIDEO AND CONTENT
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'video_gallery',
          title: 'Video Gallery',
          icon: VideoGalleryIcon,
          description: 'Display multiple videos in a grid or carousel.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title' }),
            defineField({ name: 'videos', type: 'array', title: 'Videos', of: [{ type: 'reference', to: [{ type: 'video' }] }] }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Grid', value: 'grid' }, { title: 'Carousel', value: 'carousel' }], layout: 'radio' },
              initialValue: 'grid',
            }),
          ],
          preview: {
            select: { title: 'title', videos: 'videos' },
            prepare({ title, videos }) {
              const count = videos?.length || 0
              return { title: title || 'Video Gallery', subtitle: `${count} video${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'shorts_wall',
          title: 'Shorts / Reels Wall',
          icon: ShortsWallIcon,
          description: 'Embed TikTok, IG Reels, or YT Shorts.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title' }),
            defineField({
              name: 'embeds',
              type: 'array',
              title: 'Embed URLs',
              of: [{ type: 'url' }],
            }),
          ],
          preview: {
            select: { title: 'title', embeds: 'embeds' },
            prepare({ title, embeds }) {
              const count = embeds?.length || 0
              return { title: title || 'Shorts Wall', subtitle: `${count} embed${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'news_feed',
          title: 'News Feed',
          icon: NewsFeedIcon,
          description: 'Display recent news posts.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Latest News' }),
            defineField({ name: 'limit', type: 'number', title: 'Max Posts', initialValue: 6 }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'News Feed', subtitle: 'Auto-generated from posts' } },
          },
        },

        // ═══════════════════════════════════════
        //  TOUR AND EVENTS
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'tour_dates',
          title: 'Tour Dates',
          icon: TourDatesIcon,
          description: 'Show upcoming events from the Events library.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Tour Dates' }),
            defineField({ name: 'upcomingOnly', type: 'boolean', title: 'Show Upcoming Only', initialValue: true }),
            defineField({ name: 'showFilters', type: 'boolean', title: 'Show Filters', initialValue: false }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Tour Dates', subtitle: 'Auto-generated from events' } },
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
          description: 'Automatically shows all your songs/releases in a grid.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Music' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Music', subtitle: 'Auto-generated from Music library' } },
          },
        },
        {
          type: 'object',
          name: 'members_grid',
          title: 'Member Profiles',
          icon: MembersGridIcon,
          description: 'Automatically shows group members with photos, names, and roles.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Members' }),
            defineField({ name: 'members', type: 'array', title: 'Specific Members (optional)', of: [{ type: 'reference', to: [{ type: 'member' }] }], description: 'Leave empty to show all members.' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Members', subtitle: 'Member profiles' } },
          },
        },
        {
          type: 'object',
          name: 'shop_grid',
          title: 'Shop / Merch',
          icon: ShopGridIcon,
          description: 'Shows merch and products in a grid.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Shop' }),
            defineField({ name: 'limit', type: 'number', title: 'Max Items', initialValue: 12 }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Shop', subtitle: 'Auto-generated from Shop library' } },
          },
        },

        // ═══════════════════════════════════════
        //  PRESS AND DOWNLOADS
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'press_grid',
          title: 'Press Coverage',
          icon: PressGridIcon,
          description: 'Shows press mentions from the Press library.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Press' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Press', subtitle: 'Auto-generated from Press library' } },
          },
        },
        {
          type: 'object',
          name: 'press_quotes',
          title: 'Press Quotes',
          icon: PressCoverageIcon,
          description: 'Feature specific press mentions with pull quotes.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'In the Press' }),
            defineField({ name: 'items', type: 'array', title: 'Mentions', of: [{ type: 'reference', to: [{ type: 'pressMention' }] }] }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              const count = items?.length || 0
              return { title: title || 'Press Quotes', subtitle: `${count} mention${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'downloads_center',
          title: 'Downloads Center',
          icon: DownloadsCenterIcon,
          description: 'Display downloadable assets (EPK, logos, photos, riders).',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Downloads' }),
            defineField({ name: 'assets', type: 'array', title: 'Assets', of: [{ type: 'reference', to: [{ type: 'downloadableAsset' }] }] }),
          ],
          preview: {
            select: { title: 'title', assets: 'assets' },
            prepare({ title, assets }) {
              const count = assets?.length || 0
              return { title: title || 'Downloads', subtitle: `${count} file${count !== 1 ? 's' : ''}` }
            },
          },
        },

        // ═══════════════════════════════════════
        //  COMMUNITY
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'fan_wall',
          title: 'Fan Wall',
          icon: FanWallIcon,
          description: 'Display approved fan submissions.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Fan Wall' }),
            defineField({ name: 'submissionEnabled', type: 'boolean', title: 'Allow Submissions', initialValue: true }),
            defineField({ name: 'moderationNotice', type: 'text', title: 'Moderation Notice', rows: 2 }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Fan Wall' } },
          },
        },
        {
          type: 'object',
          name: 'poll_block',
          title: 'Poll',
          icon: PollBlockIcon,
          description: 'Embed an interactive poll.',
          fields: [
            defineField({ name: 'poll', type: 'reference', title: 'Poll', to: [{ type: 'poll' }] }),
          ],
          preview: {
            select: { question: 'poll.question' },
            prepare({ question }) { return { title: question || 'Poll', subtitle: 'Interactive poll' } },
          },
        },

        // ═══════════════════════════════════════
        //  EVENTS (inline — kept for backward compat)
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'events',
          title: 'Events (Inline)',
          icon: EventsIcon,
          description: 'Inline event list — prefer Tour Dates block for new pages.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Tour Dates' }),
            defineField({
              name: 'event_list',
              type: 'array',
              title: 'Events',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'name', type: 'string', title: 'Event Name', validation: (rule) => rule.required() }),
                  defineField({ name: 'date', type: 'datetime', title: 'Date & Time', validation: (rule) => rule.required() }),
                  defineField({ name: 'venue', type: 'string', title: 'Venue' }),
                  defineField({ name: 'city', type: 'string', title: 'City' }),
                  defineField({ name: 'ticket_url', type: 'url', title: 'Ticket Link' }),
                  defineField({
                    name: 'status',
                    type: 'string',
                    title: 'Status',
                    options: { list: [{ title: 'On Sale', value: 'on_sale' }, { title: 'Sold Out', value: 'sold_out' }, { title: 'Cancelled', value: 'cancelled' }, { title: 'Coming Soon', value: 'coming_soon' }], layout: 'dropdown' },
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
        //  TIMELINE
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'timeline',
          title: 'Timeline',
          icon: TimelineBlockIcon,
          description: 'Display group history milestones.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Our Journey' }),
            defineField({ name: 'items', type: 'array', title: 'Milestones', of: [{ type: 'reference', to: [{ type: 'timelineItem' }] }] }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              const count = items?.length || 0
              return { title: title || 'Timeline', subtitle: `${count} milestone${count !== 1 ? 's' : ''}` }
            },
          },
        },

        // ═══════════════════════════════════════
        //  WIDGETS — Interactive elements
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'widget',
          title: 'Music Player',
          icon: WidgetIcon,
          description: 'An embedded music player for a specific song.',
          fields: [
            defineField({
              name: 'widget_type',
              type: 'string',
              title: 'Widget Type',
              options: { list: [{ title: 'Music Player', value: 'player' }], layout: 'radio' },
              initialValue: 'player',
            }),
            defineField({
              name: 'music_item',
              title: 'Song to Play',
              type: 'reference',
              to: [{ type: 'track' }],
              description: 'Pick a song from your Music library.',
            }),
          ],
          preview: {
            select: { song: 'music_item.title' },
            prepare({ song }) { return { title: `Music Player: ${song || 'No song selected'}`, subtitle: 'Widget' } },
          },
        },
        {
          type: 'object',
          name: 'email_signup',
          title: 'Email Sign-Up',
          icon: EmailSignupIcon,
          description: 'Newsletter subscription form.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Stay Updated' }),
            defineField({ name: 'subtitle', type: 'text', title: 'Subtitle', rows: 2 }),
            defineField({
              name: 'provider',
              type: 'string',
              title: 'Provider',
              options: { list: [{ title: 'Brevo', value: 'brevo' }, { title: 'Mailchimp', value: 'mailchimp' }, { title: 'Custom', value: 'custom' }] },
              initialValue: 'brevo',
            }),
            defineField({ name: 'formId', type: 'string', title: 'Form / List ID' }),
            defineField({ name: 'successMessage', type: 'string', title: 'Success Message', initialValue: "You're in! 🎉" }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Email Sign-Up', subtitle: 'Newsletter form' } },
          },
        },
        {
          type: 'object',
          name: 'newsletter_signup',
          title: 'Newsletter Sign-Up',
          icon: NewsletterSignupIcon,
          description: 'A sign-up form that collects name and email for your mailing list.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Heading', initialValue: 'JOIN THE AMII-GOS' }),
            defineField({ name: 'subtitle', type: 'text', title: 'Subtitle', rows: 2, initialValue: 'Get early access, updates, and behind-the-scenes' }),
            defineField({ name: 'buttonText', type: 'string', title: 'Button Text', initialValue: 'JOIN US' }),
            defineField({ name: 'successRedirect', type: 'string', title: 'Success Redirect URL', initialValue: '/newsletter-success', description: 'Where to send users after signing up.' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Newsletter Sign-Up', subtitle: 'Name + email form' } },
          },
        },
        {
          type: 'object',
          name: 'contact_form',
          title: 'Contact Form',
          icon: ContactFormIcon,
          description: 'Legacy standalone contact form block. Prefer newsletter, fan-facing, or dedicated future form flows for new pages.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Contact Us' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Contact Form', subtitle: 'Email form' } },
          },
        },
        {
          type: 'object',
          name: 'contact_section',
          title: 'Contact Info & Emails',
          icon: ContactInfoIcon,
          description: 'Displays business contact cards and social links only. No form is rendered here.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Heading', initialValue: 'SAY HELLO' }),
            defineField({ name: 'subtitle', type: 'string', title: 'Subheading' }),
            defineField({ name: 'management_email', type: 'string', title: 'Management Email', initialValue: 'mgmt@weareamii.com' }),
            defineField({ name: 'press_email', type: 'string', title: 'Press Email', initialValue: 'press@weareamii.com' }),
            defineField({ name: 'bookings_email', type: 'string', title: 'Bookings Email', initialValue: 'bookings@weareamii.com' }),
            defineField({ name: 'inquiries_email', type: 'string', title: 'General Email', initialValue: 'hello@weareamii.com' }),
            defineField({ name: 'show_socials', type: 'boolean', title: 'Show Social Icons', initialValue: true }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Contact Info', subtitle: 'Business contact cards' } },
          },
        },

        // ═══════════════════════════════════════
        //  FOLLOW PAGE
        // ═══════════════════════════════════════
        { type: 'profile_header' },
        { type: 'link_stack' },

        // ═══════════════════════════════════════
        //  LAYOUT & DECORATIVE
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'spacer',
          title: 'Spacer',
          icon: SpacerIcon,
          description: 'Add empty space between sections.',
          fields: [
            defineField({
              name: 'size',
              type: 'string',
              title: 'Size',
              options: { list: [{ title: 'Small', value: 'sm' }, { title: 'Medium', value: 'md' }, { title: 'Large', value: 'lg' }], layout: 'radio' },
              initialValue: 'md',
            }),
          ],
          preview: {
            select: { size: 'size' },
            prepare({ size }) {
              const label = { sm: 'Small', md: 'Medium', lg: 'Large' }[(size || 'md') as 'sm' | 'md' | 'lg']
              return { title: `${label} Spacer` }
            },
          },
        },
        {
          type: 'object',
          name: 'divider',
          title: 'Divider Line',
          icon: DividerIcon,
          description: 'A horizontal line to separate sections.',
          fields: [
            defineField({
              name: 'style',
              type: 'string',
              title: 'Style',
              options: { list: [{ title: 'Solid', value: 'solid' }, { title: 'Dashed', value: 'dashed' }, { title: 'Dotted', value: 'dotted' }, { title: 'Gradient', value: 'gradient' }], layout: 'radio' },
              initialValue: 'solid',
            }),
            defineField({
              name: 'width',
              type: 'string',
              title: 'Width',
              options: { list: [{ title: 'Short', value: 'short' }, { title: 'Medium', value: 'medium' }, { title: 'Full', value: 'full' }], layout: 'radio' },
              initialValue: 'medium',
            }),
          ],
          preview: {
            select: { style: 'style', width: 'width' },
            prepare({ style, width }) {
              return { title: `${style || 'Solid'} Divider`, subtitle: `${width || 'Medium'} width` }
            },
          },
        },
        {
          type: 'object',
          name: 'marquee',
          title: 'Scrolling Ticker',
          icon: MarqueeIcon,
          description: 'Text that scrolls across the screen on repeat.',
          fields: [
            defineField({ name: 'text', type: 'string', title: 'Ticker Text', validation: (rule) => rule.required() }),
            defineField({
              name: 'speed',
              type: 'string',
              title: 'Speed',
              options: { list: [{ title: 'Slow', value: 'slow' }, { title: 'Normal', value: 'normal' }, { title: 'Fast', value: 'fast' }], layout: 'radio' },
              initialValue: 'normal',
            }),
            defineField({
              name: 'variant',
              type: 'string',
              title: 'Style',
              options: { list: [{ title: 'Default', value: 'default' }, { title: 'Bold', value: 'bold' }, { title: 'Subtle', value: 'subtle' }], layout: 'radio' },
              initialValue: 'default',
            }),
          ],
          preview: {
            select: { text: 'text' },
            prepare({ text }) { return { title: text || 'Scrolling Ticker' } },
          },
        },
        {
          type: 'object',
          name: 'lyric_highlight',
          title: 'Lyric / Quote Highlight',
          icon: LyricIcon,
          description: 'A big, stylized standalone quote or lyric.',
          fields: [
            defineField({ name: 'text', type: 'text', title: 'Quote Text', rows: 3, validation: (rule) => rule.required() }),
            defineField({ name: 'attribution', type: 'string', title: 'Source' }),
            defineField({
              name: 'alignment',
              type: 'string',
              title: 'Alignment',
              options: { list: [{ title: 'Left', value: 'left' }, { title: 'Center', value: 'center' }, { title: 'Right', value: 'right' }], layout: 'radio' },
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
    select: { title: 'title', slug: 'slug.current', pageType: 'pageType' },
    prepare({ title, slug, pageType }) {
      return { title: title || 'Untitled Page', subtitle: `${pageType ? `[${pageType}] ` : ''}/${slug || ''}` }
    },
  },
})
