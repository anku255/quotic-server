import { schemaComposer } from 'graphql-compose';
import { searchByQuery } from '../../controllers/search.controller';

const SearchTC = schemaComposer.createObjectTC(`
  type SearchResult {
    id: MongoID!
    imageUrl: String!
    type: String!
    showYear: Int
    showName: String
    characterName: String
    quote: String
  }
`);

SearchTC.addResolver(searchByQuery);

const SearchQueryFields = {
  searchByQuery: SearchTC.getResolver('searchByQuery'),
}

export { SearchTC, SearchQueryFields }
