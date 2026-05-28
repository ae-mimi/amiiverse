import { defineField, defineType } from 'sanity'
import {
  PageIcon, SEOIcon,
  HeroHomeIcon, HeroPredebutIcon, HeroPageIcon,
  IntroIcon, RichTextIcon, GalleryIcon, VideoIcon,
  CTAIcon, CountdownIcon, FAQIcon, TestimonialIcon,
  MusicGridIcon, MembersGridIcon, PressGridIcon, PressKitIcon, EventsIcon,
  WidgetIcon, ContactFormIcon, ContactInfoIcon,
  SpacerIcon, DividerIcon, MarqueeIcon, LyricIcon,
  ReleaseSpotlightIcon, DiscographyGridIcon, VideoGalleryIcon,
  TourDatesIcon, EmailSignupIcon, FanWallIcon, DownloadsCenterIcon,
  TimelineBlockIcon, MediaTextIcon, SmartLinksIcon, CreditsIcon,
  ShortsWallIcon, NewsFeedIcon, PressCoverageIcon, PollBlockIcon,
  NewsletterSignupIcon, SectionTabsIcon, AchievementsBlockIcon,
  LinkButtonsIcon, LibraryGalleryIcon,
} from './icons'

const sectionIdField = () =>
  defineField({
    name: 'sectionId',
    type: 'string',
    title: 'Section ID',
    description: 'Optional anchor for section tabs, e.g. bio, music, photos, videos, proof, socials, contact.',
  })

const imageCropPresetField = (description = 'Choose a photo-editor style crop ratio for the displayed image. Use Sanity\'s built-in crop/hotspot editor on the image itself to choose the exact crop area.', fieldset?: string) =>
  defineField({
    name: 'imageCropPreset',
    type: 'string',
    title: 'Crop Preset',
    description,
    ...(fieldset ? { fieldset } : {}),
    options: {
      list: [
        { title: 'Free', value: 'natural' },
        { title: 'Original', value: 'original' },
        { title: 'Square (1:1)', value: 'square' },
        { title: '9:16', value: 'portrait916' },
        { title: '16:9', value: 'wide169' },
        { title: '4:5', value: 'portrait45' },
        { title: '5:4', value: 'landscape54' },
        { title: '3:4', value: 'portrait34' },
        { title: '4:3', value: 'landscape43' },
        { title: '2:3', value: 'portrait23' },
        { title: '3:2', value: 'landscape32' },
        { title: '5:7', value: 'portrait57' },
        { title: '7:5', value: 'landscape75' },
        { title: '1:2', value: 'portrait12' },
        { title: '2:1', value: 'landscape21' },
        { title: 'Panorama', value: 'panorama' },
        { title: 'Cinematic (21:9)', value: 'cinematic219' },
        { title: 'Website Banner (3:1)', value: 'banner31' },
      ],
      layout: 'dropdown',
    },
    initialValue: 'natural',
  })

const imageLayoutStyleField = (initialValue = 'boxed', fieldset?: string) =>
  defineField({
    name: 'imageDisplayStyle',
    type: 'string',
    title: 'Image Layout',
    description: 'Choose how the photo should sit in this section. These are common website layout styles.',
    ...(fieldset ? { fieldset } : {}),
    options: {
      list: [
        { title: 'Boxed photo with margins', value: 'boxed' },
        { title: 'Big full-width photo', value: 'fullWidthBleed' },
        { title: 'Full-screen opening photo', value: 'fullScreen' },
        { title: 'Photo and text side-by-side', value: 'split' },
        { title: 'Overlapping editorial layout', value: 'asymmetric' },
        { title: 'Scrolling background photo', value: 'fixedBackground' },
      ],
      layout: 'dropdown',
    },
    initialValue,
  })

const imageEditorFields = (fieldset?: string) => [
  imageLayoutStyleField('boxed', fieldset),
  defineField({ name: 'useBackgroundRemovedImage', type: 'boolean', title: 'Use Background-Removed Version', initialValue: false, ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'backgroundRemovedImage', type: 'image', title: 'Background-Removed Image', description: 'Upload a cutout/transparent PNG here. Automatic removal requires an external image service.', options: { hotspot: true }, ...(fieldset ? { fieldset } : {}) }),
  defineField({
    name: 'imageObjectPosition',
    type: 'string',
    title: 'Image Position',
    description: 'Controls which part of the photo stays visible inside the crop.',
    ...(fieldset ? { fieldset } : {}),
    options: {
      list: [
        { title: 'Center', value: 'center center' },
        { title: 'Top', value: 'center top' },
        { title: 'Bottom', value: 'center bottom' },
        { title: 'Left', value: 'left center' },
        { title: 'Right', value: 'right center' },
      ],
      layout: 'dropdown',
    },
    initialValue: 'center center',
  }),
  defineField({ name: 'imageRotate', type: 'number', title: 'Rotate', description: 'Degrees. Similar to the rotate control in Photos.', initialValue: 0, ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageFlipHorizontal', type: 'boolean', title: 'Flip Horizontal', initialValue: false, ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageFlipVertical', type: 'boolean', title: 'Flip Vertical', initialValue: false, ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageSkewX', type: 'number', title: 'Skew X', initialValue: 0, ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageSkewY', type: 'number', title: 'Skew Y', initialValue: 0, ...(fieldset ? { fieldset } : {}) }),
  defineField({
    name: 'imageFilterPreset',
    type: 'string',
    title: 'Filter',
    ...(fieldset ? { fieldset } : {}),
    options: {
      list: [
        { title: 'Original', value: 'original' },
        { title: 'Punch', value: 'punch' },
        { title: 'Golden', value: 'golden' },
        { title: 'Radiate', value: 'radiate' },
        { title: 'Warm Contrast', value: 'warmContrast' },
        { title: 'Calm', value: 'calm' },
        { title: 'Cool Light', value: 'coolLight' },
        { title: 'Vivid Cool', value: 'vividCool' },
        { title: 'Dramatic Cool', value: 'dramaticCool' },
        { title: 'Black & White', value: 'blackAndWhite' },
        { title: 'Sepia', value: 'sepia' },
      ],
      layout: 'dropdown',
    },
    initialValue: 'original',
  }),
  defineField({ name: 'imageBrightness', type: 'number', title: 'Brightness', initialValue: 0, validation: (rule) => rule.min(-100).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageExposure', type: 'number', title: 'Exposure', initialValue: 0, validation: (rule) => rule.min(-100).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageContrast', type: 'number', title: 'Contrast', initialValue: 0, validation: (rule) => rule.min(-100).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageSaturation', type: 'number', title: 'Saturation', initialValue: 0, validation: (rule) => rule.min(-100).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageWarmth', type: 'number', title: 'Warmth', initialValue: 0, validation: (rule) => rule.min(-100).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageTint', type: 'number', title: 'Tint', initialValue: 0, validation: (rule) => rule.min(-180).max(180), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageSharpness', type: 'number', title: 'Sharpness', initialValue: 0, validation: (rule) => rule.min(-100).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageVignette', type: 'number', title: 'Vignette', initialValue: 0, validation: (rule) => rule.min(0).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageOverlayColor', type: 'string', title: 'Gradient / Overlay Color', description: 'Hex color used as a readability overlay, e.g. #000000.', initialValue: '#000000', ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageOverlayOpacity', type: 'number', title: 'Overlay Opacity', initialValue: 0, validation: (rule) => rule.min(0).max(100), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageMarkupText', type: 'string', title: 'Markup Text', description: 'Simple on-image annotation. Freehand drawing needs a custom editor integration.', ...(fieldset ? { fieldset } : {}) }),
  defineField({
    name: 'imageFrameShape',
    type: 'string',
    title: 'Frame Shape',
    description: 'Use Oval/Circle for the rounded Figma-style portrait frames.',
    ...(fieldset ? { fieldset } : {}),
    options: {
      list: [
        { title: 'None', value: 'none' },
        { title: 'Rounded Rectangle', value: 'rounded' },
        { title: 'Soft Rounded', value: 'softRounded' },
        { title: 'Pill / Oval', value: 'oval' },
        { title: 'Circle', value: 'circle' },
        { title: 'Arch', value: 'arch' },
        { title: 'Card / Boxed', value: 'card' },
      ],
      layout: 'dropdown',
    },
    initialValue: 'none',
  }),
  defineField({ name: 'imageFrameBorderColor', type: 'string', title: 'Frame Border Color', description: 'Hex color, e.g. #174ea6 or #ff3ba7.', initialValue: 'transparent', ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageFrameBorderWidth', type: 'number', title: 'Frame Border Width', initialValue: 0, validation: (rule) => rule.min(0).max(40), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageFramePadding', type: 'number', title: 'Frame Padding', description: 'Adds space between the frame edge and image.', initialValue: 0, validation: (rule) => rule.min(0).max(120), ...(fieldset ? { fieldset } : {}) }),
  defineField({ name: 'imageFrameBackgroundColor', type: 'string', title: 'Frame Background Color', description: 'Hex color behind the image when padding is used.', initialValue: 'transparent', ...(fieldset ? { fieldset } : {}) }),
  defineField({
    name: 'imageFrameShadow',
    type: 'string',
    title: 'Frame Shadow',
    ...(fieldset ? { fieldset } : {}),
    options: {
      list: [
        { title: 'None', value: 'none' },
        { title: 'Soft', value: 'soft' },
        { title: 'Lifted', value: 'lifted' },
        { title: 'Glow', value: 'glow' },
      ],
      layout: 'dropdown',
    },
    initialValue: 'none',
  }),
]

const mediaWidthField = (initialValue = 'contained') =>
  defineField({
    name: 'mediaWidth',
    type: 'string',
    title: 'Section Width',
    description: 'Choose how much horizontal space this section can use. This is different from the photo layout.',
    options: {
      list: [
        { title: 'Contained', value: 'contained' },
        { title: 'Wide', value: 'wide' },
        { title: 'Full Width', value: 'full' },
      ],
      layout: 'radio',
    },
    initialValue,
  })

const heroOrderField = () =>
  defineField({
    name: 'contentOrder',
    type: 'array',
    title: 'Content Order',
    description: 'Drag these to choose the display order for the homepage banner content.',
    of: [{
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Title', value: 'title' },
          { title: 'Subtitle', value: 'subtitle' },
          { title: 'Description', value: 'description' },
          { title: 'Buttons', value: 'buttons' },
        ],
      },
    }],
    initialValue: ['image', 'title', 'subtitle', 'description', 'buttons'],
  })

const predebutOrderField = () =>
  defineField({
    name: 'contentOrder',
    type: 'array',
    title: 'Content Order',
    description: 'Drag these to choose the display order for the pre-debut/home banner content.',
    of: [{
      type: 'string',
      options: {
        list: [
          { title: 'Top Text', value: 'topText' },
          { title: 'Image', value: 'image' },
          { title: 'Banner Text + Button', value: 'banner' },
        ],
      },
    }],
    initialValue: ['topText', 'image', 'banner'],
  })

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
      options: {
        insertMenu: {
          showIcons: true,
          groups: [
            { name: 'essentials', title: 'Essentials', of: ['hero', 'page_hero', 'intro', 'rich_text', 'media_text', 'cta_banner', 'newsletter_signup', 'contact_section'] },
            { name: 'music', title: 'Music', of: ['music_grid', 'release_spotlight', 'smart_links', 'discography_grid', 'credits_block', 'widget'] },
            { name: 'media', title: 'Media', of: ['gallery_block', 'library_gallery', 'video_gallery', 'video_embed', 'shorts_wall', 'downloads_center'] },
            { name: 'press', title: 'Press / EPK', of: ['section_tabs', 'press_grid', 'press_quotes', 'achievements_block', 'link_buttons', 'press_kit'] },
            { name: 'community', title: 'Community', of: ['members_grid', 'tour_dates', 'fan_wall', 'poll_block', 'timeline', 'news_feed'] },
            { name: 'layout', title: 'Layout', of: ['spacer', 'divider', 'marquee', 'lyric_highlight'] },
            { name: 'advancedLegacy', title: 'Advanced / Legacy', of: ['predebut_hero', 'testimonials', 'events', 'email_signup', 'contact_form', 'profile_header', 'link_stack'] },
          ],
        },
      },
      of: [
        // ═══════════════════════════════════════
        //  HEROES — Large banners at the top
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'hero',
          title: 'Hero / Main Homepage Banner',
          icon: HeroHomeIcon,
          description: 'Use this for the big first section visitors see on the Home page.',
          fieldsets: [
            {
              name: 'photoSettings',
              title: 'Photo settings',
              description: 'Crop, position, layout, filters, overlay, and frame controls for the main photo.',
              options: { collapsible: true, collapsed: true },
            },
            {
              name: 'buttonSettings',
              title: 'Button settings',
              description: 'Button labels and links.',
              options: { collapsible: true, collapsed: true },
            },
            {
              name: 'contentSettings',
              title: 'Content order',
              description: 'Move the photo, text, and buttons into the order you want.',
              options: { collapsible: true, collapsed: true },
            },
          ],
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Big Heading', description: 'The main words people should notice first.', validation: (rule) => rule.required() }),
            defineField({ name: 'subtitle', type: 'string', title: 'Small Heading', description: 'Optional short line above or below the big heading.' }),
            defineField({ name: 'description', type: 'text', title: 'Supporting Text', description: 'A short sentence or two that explains the hero.', rows: 3 }),
            defineField({ name: 'image', type: 'image', title: 'Main Photo', description: 'The main image for this hero. Use crop/hotspot to choose the most important area.', options: { hotspot: true }, fieldset: 'photoSettings' }),
            imageCropPresetField('Choose the shape of the photo area, like square, 16:9, or wide banner. Use the crop/hotspot editor on the photo to choose the exact crop.', 'photoSettings'),
            ...imageEditorFields('photoSettings'),
            { ...heroOrderField(), fieldset: 'contentSettings' },
            defineField({ name: 'cta_primary', type: 'string', title: 'Main Button Text', description: 'Example: Listen Now, Join Us, Watch Video.', fieldset: 'buttonSettings' }),
            defineField({ name: 'cta_primary_link', type: 'string', title: 'Main Button Link', description: 'Paste a page URL, social link, music link, or email link.', fieldset: 'buttonSettings' }),
            defineField({ name: 'cta_secondary', type: 'string', title: 'Second Button Text', description: 'Optional smaller follow-up action.', fieldset: 'buttonSettings' }),
            defineField({ name: 'cta_secondary_link', type: 'string', title: 'Second Button Link', description: 'Where the second button should go.', fieldset: 'buttonSettings' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'subtitle' },
            prepare({ title, subtitle }) {
              return { title: title || 'Hero / Main Homepage Banner', subtitle: subtitle || 'Hero section' }
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
            mediaWidthField('contained'),
            imageCropPresetField('Use Full Width + a wide crop for hero layouts like the Figma mockup.'),
            ...imageEditorFields(),
            predebutOrderField(),
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
          title: 'Intro Section / Bio',
          icon: IntroIcon,
          description: 'Use for page intros, artist bios, short descriptions, or text with an optional image.',
          fields: [
            sectionIdField(),
            defineField({ name: 'epkProfile', type: 'reference', title: 'EPK Profile Source', to: [{ type: 'epkProfile' }], description: 'Optional: use short or long bio from an EPK Profile when Body Text is empty.' }),
            defineField({
              name: 'bioVariant',
              type: 'string',
              title: 'EPK Bio Length',
              description: 'Only used when an EPK Profile Source is selected and Body Text is empty.',
              options: { list: [{ title: 'Short Bio', value: 'short' }, { title: 'Long Bio', value: 'long' }], layout: 'radio' },
              initialValue: 'short',
            }),
            defineField({ name: 'heading', type: 'string', title: 'Heading' }),
            defineField({ name: 'content', type: 'text', title: 'Body Text', rows: 5 }),
            defineField({ name: 'image', type: 'image', title: 'Photo', options: { hotspot: true } }),
            imageCropPresetField(),
            ...imageEditorFields(),
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
            mediaWidthField('contained'),
            imageCropPresetField(),
            ...imageEditorFields(),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Image Left', value: 'imageLeft' }, { title: 'Image Right', value: 'imageRight' }, { title: 'Image Top', value: 'imageTop' }, { title: 'Image Bottom', value: 'imageBottom' }], layout: 'radio' },
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
          title: 'Text Block / Copy',
          icon: RichTextIcon,
          description: 'Search terms: copy, paragraph, bio, announcement, plain text, written content.',
          fields: [
            sectionIdField(),
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
          title: 'Photo Gallery / Images',
          icon: GalleryIcon,
          description: 'A grid of photos, images, press shots, artwork, or visual assets.',
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
            mediaWidthField('contained'),
            imageCropPresetField('Applies the selected crop ratio to every image in this gallery.'),
            ...imageEditorFields(),
            defineField({ name: 'teaserLimit', type: 'number', title: 'Images to Show Before Gallery Link', description: 'Use 3 or 4 on public pages to avoid clutter. Leave empty to show all images.', initialValue: 3 }),
            defineField({ name: 'showGalleryLink', type: 'boolean', title: 'Show Public Gallery Link Card', initialValue: true }),
            defineField({ name: 'galleryLinkText', type: 'string', title: 'Gallery Link Text', initialValue: 'View the gallery' }),
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
          name: 'library_gallery',
          title: 'Library Gallery / Reusable Gallery',
          icon: LibraryGalleryIcon,
          description: 'Pull photos from the Galleries library instead of uploading images directly into this page.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title' }),
            defineField({ name: 'gallery', type: 'reference', title: 'Gallery', to: [{ type: 'gallery' }], validation: (rule) => rule.required() }),
            defineField({
              name: 'columns',
              type: 'number',
              title: 'Layout',
              options: { list: [{ title: '2 per row', value: 2 }, { title: '3 per row', value: 3 }, { title: '4 per row', value: 4 }] },
              initialValue: 3,
            }),
            mediaWidthField('contained'),
            imageCropPresetField('Applies the selected crop ratio to every image in this reusable gallery.'),
            ...imageEditorFields(),
            defineField({ name: 'teaserLimit', type: 'number', title: 'Images to Show Before Gallery Link', description: 'Use 3 or 4 on public pages to avoid clutter. Leave empty to show all images.', initialValue: 3 }),
            defineField({ name: 'showGalleryLink', type: 'boolean', title: 'Show Public Gallery Link Card', initialValue: true }),
            defineField({ name: 'galleryLinkText', type: 'string', title: 'Gallery Link Text', initialValue: 'View the gallery' }),
          ],
          preview: {
            select: { title: 'title', galleryTitle: 'gallery.title' },
            prepare({ title, galleryTitle }) {
              return { title: title || galleryTitle || 'Library Gallery', subtitle: 'From Galleries library' }
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
            mediaWidthField('full'),
            imageCropPresetField('Controls the banner background frame. Use 16:9, 21:9, or 3:1 for website banners.'),
            ...imageEditorFields(),
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
          name: 'link_buttons',
          title: 'Link Buttons / CTA Links',
          icon: LinkButtonsIcon,
          description: 'A simple row or stack of buttons for internal pages, external URLs, email links, phone links, or file downloads.',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Section Title' }),
            defineField({ name: 'intro', type: 'text', title: 'Intro Text', rows: 2 }),
            defineField({
              name: 'links',
              type: 'array',
              title: 'Links',
              of: [{ type: 'link' }],
              validation: (rule) => rule.min(1),
            }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Centered Row', value: 'row' }, { title: 'Stacked', value: 'stack' }], layout: 'radio' },
              initialValue: 'row',
            }),
          ],
          preview: {
            select: { title: 'title', links: 'links' },
            prepare({ title, links }) {
              const count = links?.length || 0
              return { title: title || 'Link Buttons', subtitle: `${count} link${count !== 1 ? 's' : ''}` }
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
          title: 'Advanced: Manual Quotes / Testimonials',
          icon: TestimonialIcon,
          description: 'Manual quote cards. Prefer Press Quotes / Endorsements when quotes should come from Press Mentions.',
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
          title: 'Release Spotlight / Featured Music',
          icon: ReleaseSpotlightIcon,
          description: 'Feature a specific release with artwork, tracklist, and streaming links. Good for EPK music sections.',
          fields: [
            sectionIdField(),
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
          title: 'Advanced: Discography Grid',
          icon: DiscographyGridIcon,
          description: 'Show all releases in a filterable grid. Use on archive/catalog pages; cards link to release detail pages.',
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
          title: 'Smart Links / Music Links',
          icon: SmartLinksIcon,
          description: 'Platform buttons for a release. Search terms: music links, streaming links, Spotify, Apple Music, YouTube.',
          fields: [
            sectionIdField(),
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
          title: 'Video Gallery / YouTube Embeds',
          icon: VideoGalleryIcon,
          description: 'Display multiple videos as embeds with YouTube links and embed-code copy tools.',
          fields: [
            sectionIdField(),
            defineField({ name: 'title', type: 'string', title: 'Section Title' }),
            defineField({ name: 'epkProfile', type: 'reference', title: 'EPK Profile Source', to: [{ type: 'epkProfile' }], description: 'Optional: use featured videos from an EPK Profile when no videos are selected.' }),
            defineField({ name: 'videos', type: 'array', title: 'Videos', of: [{ type: 'reference', to: [{ type: 'video' }] }] }),
            defineField({ name: 'showCopyActions', type: 'boolean', title: 'Show YouTube Link & Embed Tools', initialValue: true }),
            defineField({
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: { list: [{ title: 'Grid', value: 'grid' }, { title: 'Carousel', value: 'carousel' }], layout: 'radio' },
              initialValue: 'grid',
            }),
            mediaWidthField('contained'),
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
          title: 'Advanced: News Feed',
          icon: NewsFeedIcon,
          description: 'Display recent news posts. Use after creating News Post documents; cards link to news detail pages.',
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
            imageCropPresetField('Applies the selected crop ratio to all member photos in this block.'),
            ...imageEditorFields(),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Members', subtitle: 'Member profiles' } },
          },
        },
        // ═══════════════════════════════════════
        //  PRESS AND DOWNLOADS
        // ═══════════════════════════════════════
        {
          type: 'object',
          name: 'press_grid',
          title: 'Press Coverage / Reviews',
          icon: PressGridIcon,
          description: 'Shows press mentions, reviews, articles, media coverage, and interviews from the Press library.',
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
          title: 'Press Quotes / Endorsements',
          icon: PressCoverageIcon,
          description: 'Feature specific press mentions, reviews, endorsements, testimonials, or pull quotes.',
          fields: [
            sectionIdField(),
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'In the Press' }),
            defineField({ name: 'epkProfile', type: 'reference', title: 'EPK Profile Source', to: [{ type: 'epkProfile' }], description: 'Optional: use featured press mentions from an EPK Profile when no mentions are selected.' }),
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
          title: 'Downloads Center / Press Assets',
          icon: DownloadsCenterIcon,
          description: 'Display downloadable assets: EPK PDF, bio PDF, press photos, album art, logos, riders, stage plots, and promo clips.',
          fields: [
            sectionIdField(),
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Downloads' }),
            defineField({ name: 'epkProfile', type: 'reference', title: 'EPK Profile Source', to: [{ type: 'epkProfile' }], description: 'Optional: use featured assets from an EPK Profile when no assets are selected.' }),
            defineField({ name: 'assets', type: 'array', title: 'Assets', of: [{ type: 'reference', to: [{ type: 'downloadableAsset' }] }] }),
            defineField({ name: 'showCategoryFilters', type: 'boolean', title: 'Show Category Filters', initialValue: false }),
            mediaWidthField('contained'),
            defineField({
              name: 'visibleCategories',
              type: 'array',
              title: 'Visible Categories',
              description: 'Leave empty to show all selected assets.',
              of: [{
                type: 'string',
                options: {
                  list: [
                    { title: 'EPK PDF', value: 'epkPdf' },
                    { title: 'Bio PDF', value: 'bioPdf' },
                    { title: 'Press Photo', value: 'pressPhoto' },
                    { title: 'Album Art', value: 'albumArt' },
                    { title: 'Logo', value: 'logo' },
                    { title: 'Tech Rider', value: 'rider' },
                    { title: 'Stage Plot', value: 'stagePlot' },
                    { title: 'Promo Clip', value: 'promoClip' },
                    { title: 'Miscellaneous', value: 'misc' },
                    { title: 'EPK (Legacy)', value: 'epk' },
                    { title: 'Press Photo (Legacy)', value: 'photo' },
                  ],
                },
              }],
              options: { layout: 'tags' },
            }),
          ],
          preview: {
            select: { title: 'title', assets: 'assets' },
            prepare({ title, assets }) {
              const count = assets?.length || 0
              return { title: title || 'Downloads', subtitle: `${count} file${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'achievements_block',
          title: 'Achievements / Milestones',
          icon: AchievementsBlockIcon,
          description: 'Display milestones, stats, awards, press proof, reviews, and notable career moments.',
          fields: [
            sectionIdField(),
            defineField({ name: 'title', type: 'string', title: 'Section Title', initialValue: 'Achievements' }),
            defineField({ name: 'epkProfile', type: 'reference', title: 'EPK Profile Source', to: [{ type: 'epkProfile' }], description: 'Optional: use featured achievements from an EPK Profile when no achievements are selected.' }),
            defineField({ name: 'items', type: 'array', title: 'Achievements', of: [{ type: 'reference', to: [{ type: 'achievement' }] }] }),
          ],
          preview: {
            select: { title: 'title', items: 'items' },
            prepare({ title, items }) {
              const count = items?.length || 0
              return { title: title || 'Achievements', subtitle: `${count} item${count !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'press_kit',
          title: 'Advanced: Press Kit / EPK Bento',
          icon: PressKitIcon,
          description: 'Compact teaser only. Use on /press to link people to /epk; do not use as the main EPK page.',
          fields: [
            sectionIdField(),
            defineField({
              name: 'layoutPreset',
              type: 'string',
              title: 'Layout',
              description: 'Use the designed split layout, or stack the media before the cards.',
              initialValue: 'cardsLeft',
              options: {
                list: [
                  { title: 'Cards Left, Media Right', value: 'cardsLeft' },
                  { title: 'Media Left, Cards Right', value: 'mediaLeft' },
                ],
                layout: 'radio',
              },
            }),
            defineField({ name: 'bioHeading', type: 'string', title: 'Biography Heading', initialValue: 'BIOGRAPHY' }),
            defineField({ name: 'bioText', type: 'text', title: 'Biography Text', rows: 6 }),
            defineField({
              name: 'facts',
              type: 'array',
              title: 'Key Facts',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', type: 'string', title: 'Label' }),
                    defineField({ name: 'value', type: 'string', title: 'Value' }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'value' },
                  },
                },
              ],
            }),
            defineField({
              name: 'links',
              type: 'array',
              title: 'Links',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', type: 'string', title: 'Label' }),
                    defineField({ name: 'url', type: 'url', title: 'URL' }),
                    defineField({
                      name: 'icon',
                      type: 'string',
                      title: 'Icon',
                      description: 'Simple Icons slug, for example: tiktok, instagram, spotify, youtube.',
                    }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'url' },
                  },
                },
              ],
            }),
            defineField({ name: 'mediaHeading', type: 'string', title: 'EPK & Media Heading', initialValue: 'EPK & MEDIA' }),
            defineField({
              name: 'downloads',
              type: 'array',
              title: 'Download Buttons',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', type: 'string', title: 'Button Label' }),
                    defineField({ name: 'asset', type: 'reference', title: 'Downloadable Asset', to: [{ type: 'downloadableAsset' }] }),
                    defineField({ name: 'url', type: 'url', title: 'Fallback URL' }),
                  ],
                  preview: {
                    select: { title: 'label', assetTitle: 'asset.title' },
                    prepare({ title, assetTitle }) {
                      return { title: title || assetTitle || 'Download button' }
                    },
                  },
                },
              ],
            }),
            defineField({
              name: 'mediaItems',
              type: 'array',
              title: 'Media Preview Cards',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', type: 'string', title: 'Title' }),
                    defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
                    defineField({ name: 'asset', type: 'reference', title: 'Optional Downloadable Asset', to: [{ type: 'downloadableAsset' }] }),
                  ],
                  preview: {
                    select: { title: 'title', media: 'image' },
                    prepare({ title, media }) {
                      return { title: title || 'Media preview', media }
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { bioHeading: 'bioHeading', downloads: 'downloads', mediaItems: 'mediaItems' },
            prepare({ bioHeading, downloads, mediaItems }) {
              const downloadCount = downloads?.length || 0
              const mediaCount = mediaItems?.length || 0
              return { title: bioHeading || 'Press Kit', subtitle: `${downloadCount} download${downloadCount !== 1 ? 's' : ''}, ${mediaCount} media card${mediaCount !== 1 ? 's' : ''}` }
            },
          },
        },
        {
          type: 'object',
          name: 'section_tabs',
          title: 'Section Tabs / Jump Links',
          icon: SectionTabsIcon,
          description: 'Sticky jump links for long structured pages like the EPK. Search terms: tabs, anchor links, page navigation.',
          fields: [
            defineField({
              name: 'items',
              type: 'array',
              title: 'Tabs',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'label', type: 'string', title: 'Label', validation: (rule) => rule.required() }),
                  defineField({ name: 'targetId', type: 'string', title: 'Target Section ID', validation: (rule) => rule.required() }),
                ],
                preview: { select: { title: 'label', subtitle: 'targetId' } },
              }],
              initialValue: [
                { label: 'Bio', targetId: 'bio' },
                { label: 'Music', targetId: 'music' },
                { label: 'Photos', targetId: 'photos' },
                { label: 'Videos', targetId: 'videos' },
                { label: 'Proof', targetId: 'proof' },
                { label: 'Socials', targetId: 'socials' },
                { label: 'Contact', targetId: 'contact' },
              ],
            }),
          ],
          preview: {
            select: { items: 'items' },
            prepare({ items }) {
              const count = items?.length || 0
              return { title: 'Section Tabs', subtitle: `${count} tab${count !== 1 ? 's' : ''}` }
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
          title: 'Legacy: Events (Inline)',
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
          title: 'Legacy: Email Sign-Up',
          icon: EmailSignupIcon,
          description: 'Legacy newsletter form. Prefer Newsletter Sign-Up for new pages.',
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
            defineField({ name: 'successRedirect', type: 'string', title: 'Success Redirect URL', initialValue: '/newsletter-queue', description: 'Where to send users after signing up.' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Newsletter Sign-Up', subtitle: 'Name + email form' } },
          },
        },
        {
          type: 'object',
          name: 'contact_form',
          title: 'Legacy: Contact Form',
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
          title: 'Contact Info & Emails / Industry Contact',
          icon: ContactInfoIcon,
          description: 'Displays management, press, booking, inquiries, business contact emails, and social links. No form is rendered here.',
          fields: [
            sectionIdField(),
            defineField({ name: 'epkProfile', type: 'reference', title: 'EPK Profile', to: [{ type: 'epkProfile' }], description: 'Optional: pull contact emails from an EPK Profile.' }),
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
