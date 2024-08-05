import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rapidApiKey = import.meta.env.VITE_RAPID_API_ARTICLE_KEY;
const googleTranslateApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

export const articleApi = createApi({
    reducerPath: 'articleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://article-extractor-and-summarizer.p.rapidapi.com/',
        prepareHeaders: (headers) => {
            headers.set('X-RapidAPI-Key', rapidApiKey);
            headers.set('X-RapidAPI-Host', 'article-extractor-and-summarizer.p.rapidapi.com');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getSummary: builder.query({
            query: (params) => `summarize?url=${encodeURIComponent(params.articleUrl)}&length=10`,
        }),
        translateText: builder.query({
            query: (text) => ({
                url: `https://translation.googleapis.com/language/translate/v2`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${googleTranslateApiKey}`,
                },
                body: JSON.stringify({
                    q: text,
                    target: 'tr',
                }),
            }),
        }),
    }),
})

export const { useLazyGetSummaryQuery, useLazyTranslateTextQuery } = articleApi
