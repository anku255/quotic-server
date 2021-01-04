import { schemaComposer } from 'graphql-compose';
import { getShowDataFromIMDB, getCharactersFromIMDB } from '../../controllers/admin.controller';

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
`);

AdminTC.addResolver(getShowDataFromIMDB);
AdminTC.addResolver(getCharactersFromIMDB);

const AdminQueryFields = {
  getShowDataFromIMDB: AdminTC.getResolver('getShowDataFromIMDB'),
  getCharactersFromIMDB: AdminTC.getResolver('getCharactersFromIMDB'),
}

export { AdminTC, AdminQueryFields }
