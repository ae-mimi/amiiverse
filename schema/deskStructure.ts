import type { StructureBuilder } from 'sanity/structure'
import {
    SettingsIcon, PageIcon, ReleaseIcon, TrackIcon,
    VideoDocIcon, GalleryDocIcon, MemberIcon, EventIcon,
    PressMentionIcon, DownloadIcon, PostIcon, FanIcon,
    PollIcon, CampaignIcon, RedirectIcon, TimelineIcon,
    MusicIcon, PressIcon, ShopIcon,
} from './icons'

export const deskStructure = (S: StructureBuilder) =>
    S.list()
        .title('Content')
        .items([
            // ── Settings (singleton) ──────────────────
            S.listItem()
                .title('Site Settings')
                .icon(SettingsIcon)
                .child(
                    S.document()
                        .schemaType('settings')
                        .documentId('settings'),
                ),

            S.divider(),

            // ── Pages ─────────────────────────────────
            S.listItem()
                .title('Pages')
                .icon(PageIcon)
                .child(S.documentTypeList('page').title('Pages')),

            S.divider(),

            // ── Music & Media ─────────────────────────
            S.listItem()
                .title('Music & Media')
                .icon(ReleaseIcon)
                .child(
                    S.list()
                        .title('Music & Media')
                        .items([
                            S.listItem()
                                .title('Releases')
                                .icon(ReleaseIcon)
                                .child(S.documentTypeList('release').title('Releases')),
                            S.listItem()
                                .title('Tracks')
                                .icon(TrackIcon)
                                .child(S.documentTypeList('track').title('Tracks')),
                            S.listItem()
                                .title('Videos')
                                .icon(VideoDocIcon)
                                .child(S.documentTypeList('video').title('Videos')),
                            S.listItem()
                                .title('Galleries')
                                .icon(GalleryDocIcon)
                                .child(S.documentTypeList('gallery').title('Galleries')),
                        ]),
                ),

            // ── People & Events ───────────────────────
            S.listItem()
                .title('People & Events')
                .icon(MemberIcon)
                .child(
                    S.list()
                        .title('People & Events')
                        .items([
                            S.listItem()
                                .title('Members')
                                .icon(MemberIcon)
                                .child(S.documentTypeList('member').title('Members')),
                            S.listItem()
                                .title('Events')
                                .icon(EventIcon)
                                .child(S.documentTypeList('event').title('Events')),
                            S.listItem()
                                .title('Timeline')
                                .icon(TimelineIcon)
                                .child(S.documentTypeList('timelineItem').title('Timeline')),
                        ]),
                ),

            // ── Press & Downloads ─────────────────────
            S.listItem()
                .title('Press & Downloads')
                .icon(PressMentionIcon)
                .child(
                    S.list()
                        .title('Press & Downloads')
                        .items([
                            S.listItem()
                                .title('Press Mentions')
                                .icon(PressMentionIcon)
                                .child(S.documentTypeList('pressMention').title('Press Mentions')),
                            S.listItem()
                                .title('Downloadable Assets')
                                .icon(DownloadIcon)
                                .child(S.documentTypeList('downloadableAsset').title('Downloadable Assets')),
                        ]),
                ),

            // ── News & Community ──────────────────────
            S.listItem()
                .title('News & Community')
                .icon(PostIcon)
                .child(
                    S.list()
                        .title('News & Community')
                        .items([
                            S.listItem()
                                .title('News Posts')
                                .icon(PostIcon)
                                .child(S.documentTypeList('post').title('News Posts')),
                            S.listItem()
                                .title('Fan Submissions')
                                .icon(FanIcon)
                                .child(
                                    S.list()
                                        .title('Fan Submissions')
                                        .items([
                                            S.listItem()
                                                .title('All Submissions')
                                                .icon(FanIcon)
                                                .child(S.documentTypeList('fanSubmission').title('All Submissions')),
                                            S.listItem()
                                                .title('Pending Review')
                                                .icon(FanIcon)
                                                .child(
                                                    S.documentList()
                                                        .title('Pending Review')
                                                        .filter('_type == "fanSubmission" && status == "pending"')
                                                ),
                                        ])
                                ),
                            S.listItem()
                                .title('Polls')
                                .icon(PollIcon)
                                .child(S.documentTypeList('poll').title('Polls')),
                        ]),
                ),

            S.divider(),

            // ── Shop & Commerce ───────────────────────
            S.listItem()
                .title('Shop')
                .icon(ShopIcon)
                .child(
                    S.list()
                        .title('Shop & Commerce')
                        .items([
                            S.listItem()
                                .title('Products')
                                .icon(ShopIcon)
                                .child(S.documentTypeList('product').title('Products')),
                            S.listItem()
                                .title('Recent Orders')
                                .icon(ShopIcon)
                                .child(
                                    S.documentList()
                                        .title('Recent Orders')
                                        .schemaType('order')
                                        .filter('_type == "order"')
                                        .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                                ),
                        ]),
                ),

            S.divider(),

            // ── Campaigns & Admin ─────────────────────
            S.listItem()
                .title('Campaigns')
                .icon(CampaignIcon)
                .child(S.documentTypeList('campaign').title('Campaigns')),

            S.listItem()
                .title('Redirects')
                .icon(RedirectIcon)
                .child(S.documentTypeList('redirect').title('Redirects')),
        ])
