import type { StructureBuilder } from 'sanity/structure'
import {
    SettingsIcon, PageIcon, MusicIcon, MemberIcon,
    ShopIcon, PressIcon, ThemeIcon,
} from './icons'

export const deskStructure = (S: StructureBuilder) =>
    S.list()
        .title('Amiiverse CMS')
        .items([
            // ── Settings (Singleton) ──────────────────────────
            S.listItem()
                .title('Site Settings')
                .icon(SettingsIcon)
                .child(
                    S.document()
                        .schemaType('settings')
                        .documentId('siteSettings')
                        .title('Site Settings')
                ),

            S.divider(),

            // ── Content ──────────────────────────────────────
            S.listItem()
                .title('Pages')
                .icon(PageIcon)
                .child(S.documentTypeList('page').title('Pages')),

            S.divider(),

            // ── Collections ──────────────────────────────────
            S.listItem()
                .title('Music')
                .icon(MusicIcon)
                .child(S.documentTypeList('music').title('Music')),

            S.listItem()
                .title('Members')
                .icon(MemberIcon)
                .child(S.documentTypeList('member').title('Members')),

            S.listItem()
                .title('Shop')
                .icon(ShopIcon)
                .child(S.documentTypeList('shop').title('Shop Items')),

            S.listItem()
                .title('Press')
                .icon(PressIcon)
                .child(S.documentTypeList('press').title('Press')),

            S.divider(),

            // ── Design ───────────────────────────────────────
            S.listItem()
                .title('Era Themes')
                .icon(ThemeIcon)
                .child(S.documentTypeList('theme').title('Era Themes')),
        ])
