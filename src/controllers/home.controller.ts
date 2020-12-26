import Quote from '../models/quote.model';
import Show from '../models/show.model';

export const trendingQuotes = {
  name: 'trendingQuotes',
  type: '[TrendingQuote]!',
  args: {
    limit: 'Int!',
  },
  resolve: async ({ args: { limit } }): Promise<Array<unknown>> => {
    const quotes = await Quote.aggregate([{ $sample: { size: limit } }]);

    const showIds = quotes.map((quote: any) => quote.show._id);

    const quotesCount = await Promise.all(showIds.map(showId => Quote.count({show: showId})));
    return quotes.map((quote, i) => ({quote, quotesCount: quotesCount[i]}));
  },
};

export const trendingShows = {
  name: 'trendingShows',
  type: '[Show]!',
  args: {
    limit: 'Int!',
  },
  resolve: async ({ args: { limit } }): Promise<Array<unknown>> => {
    const shows = await Show.aggregate([{ $sample: { size: limit } }]);
    return shows;
  },
};
