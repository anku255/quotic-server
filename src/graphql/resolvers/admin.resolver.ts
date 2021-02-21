import { schemaComposer } from 'graphql-compose';
import {
  getShowDataFromIMDB,
  getCharactersFromIMDB,
  getEpisodesFromWikiQuotes,
  getQuotesFromWikiQuotes,
} from '../../controllers/admin.controller';

const AdminTC = schemaComposer.createObjectTC(`
  type Episode {
    season: Int!
    episodes: Int!
  }

  type ShowData {
    name: String!
    description: String!
    genre: [String]!
    type: ShowTypeEnum!
    year: Int!
    seasons: Int
    episodes: [Episode]
    coverPicture: String!
    imdbLink: String!
    rating: Float!
  }

  type IMDBCharacter {
    characterName: String
    realName: String
    imdbLink: String
    dob: String
    coverPicture: String
    bioMarkup: String
  }

  type WikiQuote {
    raw: String!
    markup: String!
    characters: [CharacterValue]
    mainCharacter: CharacterValue
    season: Int
    episode: Int
  }

  type CharacterValue {
    label: String
    value: String
  }
`);

AdminTC.addResolver(getShowDataFromIMDB);
AdminTC.addResolver(getCharactersFromIMDB);
AdminTC.addResolver(getEpisodesFromWikiQuotes);
AdminTC.addResolver(getQuotesFromWikiQuotes);

const AdminQueryFields = {
  getShowDataFromIMDB: AdminTC.getResolver('getShowDataFromIMDB'),
  getCharactersFromIMDB: AdminTC.getResolver('getCharactersFromIMDB'),
  getEpisodesFromWikiQuotes: AdminTC.getResolver('getEpisodesFromWikiQuotes'),
  getQuotesFromWikiQuotes: AdminTC.getResolver('getQuotesFromWikiQuotes'),
};

export { AdminTC, AdminQueryFields };
