import { defineConfig, defineLocaleResourceBundle } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schema'
import { deskStructure } from './schema/deskStructure'

/**
 * English translations for Sanity Studio UI keys that aren't
 * resolving automatically in sanity@3.99+.
 */
const enUS_release = defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: 'release',
    resources: {
        'chip.published': 'Published',
        'chip.draft': 'Draft',
    },
})

const enUS_structure = defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: 'structure',
    resources: {
        'panes.document-list-pane.search-input.placeholder': 'Search',
    },
})

const enUS_inputs = defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: 'inputs',
    resources: {
        'array.action.add-item-select-type': 'Add block…',
    },
})

const sanityProjectId = process.env.PUBLIC_SANITY_PROJECT_ID || 'pxn399gi'
const sanityDataset = process.env.PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
    name: 'default',
    title: 'Amiiverse CMS',

    projectId: sanityProjectId,
    dataset: sanityDataset,

    plugins: [
        structureTool({
            structure: deskStructure,
        }),
    ],

    schema: {
        types: schemaTypes,
        templates: (prev) => [
            ...prev,
            {
                id: 'page-press',
                title: 'Press Page',
                schemaType: 'page',
                value: {
                    title: 'Press',
                    pageType: 'press',
                    sections: [
                        { _type: 'page_hero', _key: 'pressHero', title: 'Press', subtitle: 'Official updates, reviews, and media coverage.' },
                        { _type: 'intro', _key: 'pressIntro', heading: 'Latest Press', content: 'Find official press updates, coverage, reviews, and selected media moments.' },
                        { _type: 'press_grid', _key: 'pressCoverage', title: 'Press Coverage' },
                        { _type: 'press_quotes', _key: 'pressQuotes', title: 'Reviews & Quotes' },
                        { _type: 'link_buttons', _key: 'pressEpkLink', title: 'Industry / Media Kit', intro: 'For bios, photos, music links, video embeds, and contact details, visit the EPK.', links: [{ _key: 'epkLink', _type: 'link', label: 'Open EPK', type: 'external', url: '/epk' }] },
                        { _type: 'newsletter_signup', _key: 'pressNewsletter', title: 'JOIN THE AMII-GOS' },
                    ],
                },
            },
            {
                id: 'page-epk',
                title: 'EPK Page',
                schemaType: 'page',
                value: {
                    title: 'EPK',
                    pageType: 'press',
                    sections: [
                        { _type: 'page_hero', _key: 'epkHero', title: 'EPK', subtitle: 'Professional press kit, media assets, music links, videos, and industry contacts.' },
                        { _type: 'section_tabs', _key: 'epkTabs', items: [{ _key: 'bio', label: 'Bio', targetId: 'bio' }, { _key: 'music', label: 'Music', targetId: 'music' }, { _key: 'photos', label: 'Photos', targetId: 'photos' }, { _key: 'videos', label: 'Videos', targetId: 'videos' }, { _key: 'proof', label: 'Proof', targetId: 'proof' }, { _key: 'contact', label: 'Contact', targetId: 'contact' }] },
                        { _type: 'intro', _key: 'epkBio', sectionId: 'bio', heading: 'Artist Bio' },
                        { _type: 'music_grid', _key: 'epkMusic', sectionId: 'music', title: 'Music' },
                        { _type: 'downloads_center', _key: 'epkAssets', sectionId: 'photos', title: 'Photos & Album Art', showCategoryFilters: true },
                        { _type: 'video_gallery', _key: 'epkVideos', sectionId: 'videos', title: 'Videos', showCopyActions: true },
                        { _type: 'achievements_block', _key: 'epkProof', sectionId: 'proof', title: 'Recent Achievements' },
                        { _type: 'press_quotes', _key: 'epkQuotes', title: 'Reviews & Press Quotes' },
                        { _type: 'contact_section', _key: 'epkContact', sectionId: 'contact', title: 'Industry Contact' },
                    ],
                },
            },
            {
                id: 'page-music',
                title: 'Music Page',
                schemaType: 'page',
                value: {
                    title: 'Music',
                    pageType: 'music',
                    sections: [
                        { _type: 'page_hero', _key: 'musicHero', title: 'Music' },
                        { _type: 'music_grid', _key: 'musicReleases', title: 'Music' },
                        { _type: 'newsletter_signup', _key: 'musicNewsletter', title: 'JOIN THE AMII-GOS' },
                    ],
                },
            },
            {
                id: 'page-about',
                title: 'About Page',
                schemaType: 'page',
                value: {
                    title: 'About',
                    pageType: 'about',
                    sections: [
                        { _type: 'page_hero', _key: 'aboutHero', title: 'About' },
                        { _type: 'intro', _key: 'aboutIntro', heading: 'About amii' },
                        { _type: 'members_grid', _key: 'aboutMembers', title: 'Members' },
                        { _type: 'newsletter_signup', _key: 'aboutNewsletter', title: 'JOIN THE AMII-GOS' },
                    ],
                },
            },
            {
                id: 'page-contact',
                title: 'Contact Page',
                schemaType: 'page',
                value: {
                    title: 'Contact',
                    pageType: 'custom',
                    sections: [
                        { _type: 'page_hero', _key: 'contactHero', title: 'Contact' },
                        { _type: 'contact_section', _key: 'contactInfo', title: 'Contact Us', show_socials: true },
                    ],
                },
            },
        ],
    },

    i18n: {
        bundles: [enUS_release, enUS_structure, enUS_inputs],
    },
})
