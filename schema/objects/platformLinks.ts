import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'platformLinks',
    title: 'Streaming Platform Links',
    type: 'object',
    fields: [
        defineField({ name: 'spotify', title: 'Spotify', type: 'url', description: 'Spotify link.' }),
        defineField({ name: 'appleMusic', title: 'Apple Music', type: 'url', description: 'Apple Music link.' }),
        defineField({ name: 'youtubeMusic', title: 'YouTube Music', type: 'url', description: 'YouTube Music link.' }),
        defineField({ name: 'audiomack', title: 'Audiomack', type: 'url', description: 'Audiomack link.' }),
        defineField({ name: 'boomplay', title: 'Boomplay', type: 'url', description: 'Boomplay link.' }),
        defineField({ name: 'soundcloud', title: 'SoundCloud', type: 'url', description: 'SoundCloud link.' }),
        defineField({ name: 'deezer', title: 'Deezer', type: 'url', description: 'Deezer link.' }),
        defineField({ name: 'tidal', title: 'Tidal', type: 'url', description: 'Tidal link.' }),
    ],
})
