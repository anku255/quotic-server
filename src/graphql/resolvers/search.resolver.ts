import { schemaComposer } from 'graphql-compose';
import { searchByQuery, searchCharacters, searchShows } from '../../controllers/search.controller';

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
SearchTC.addResolver(searchCharacters);
SearchTC.addResolver(searchShows);

const SearchQueryFields = {
  searchByQuery: SearchTC.getResolver('searchByQuery'),
  searchCharacters: SearchTC.getResolver('searchCharacters'),
  searchShows: SearchTC.getResolver('searchShows')
}

export { SearchTC, SearchQueryFields }
