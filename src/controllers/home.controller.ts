import Quote from '../models/quote.model';
import Show from '../models/show.model';
import { fetchFromCacheOrDB } from '../utils/redisHelpers';
import { redisKeys } from '../utils/redisKeys';

export const trendingQuotes = {
  name: 'trendingQuotes',
  type: '[TrendingQuote]!',
  args: {
    limit: 'Int!',
  },
  resolve: async ({ args: { limit }, context: { redisClient } }): Promise<Array<unknown>> => {
    const fetchFromDB = async () => {
      const quotes = await Quote.aggregate([{ $sample: { size: limit } }]);

      const showIds = quotes.map((quote: any) => quote.show._id);

      const quotesCount = await Promise.all(showIds.map(showId => Quote.count({ show: showId })));
      return quotes.map((quote, i) => ({ quote, quotesCount: quotesCount[i] }));
    };

    return fetchFromCacheOrDB({ key: redisKeys.trendingQuotes(), expiry: 300, redisClient, fetchFromDB }) as any;
  },
};

export const trendingShows = {
  name: 'trendingShows',
  type: '[Show]!',
  args: {
    limit: 'Int!',
  },
  resolve: async ({ args: { limit }, context: { redisClient } }): Promise<Array<unknown>> => {
    const fetchFromDB = async () => {
      return Show.aggregate([{ $sample: { size: limit } }]);
    };

    return fetchFromCacheOrDB({ key: redisKeys.trendingShows(), expiry: 300, redisClient, fetchFromDB }) as any;
  },
};
