import { schemaComposer } from 'graphql-compose';
import { trendingQuotes, trendingShows } from '../../controllers/home.controller';

const HomeTC = schemaComposer.createObjectTC(`
  type TrendingQuote {
    quote: Quote!,
    quotesCount: Int!
  }
`);

HomeTC.addResolver(trendingQuotes);
HomeTC.addResolver(trendingShows);

const HomeQueryFields = {
  trendingQuotes: HomeTC.getResolver('trendingQuotes'),
  trendingShows: HomeTC.getResolver('trendingShows'),
}

export { HomeTC, HomeQueryFields }
