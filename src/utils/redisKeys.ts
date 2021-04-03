export const redisKeys = {
  wikiQuotesPage: (wikiQuotesUrl: string) => `WIKI_QUOTES:${wikiQuotesUrl}`,
  trendingQuotes: () => `TRENDING_QUOTES`,
  trendingShows: () => `TRENDING_SHOWS`,
};
