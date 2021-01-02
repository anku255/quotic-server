import { schemaComposer } from 'graphql-compose';
import { getShowDataFromIMDB } from '../../controllers/admin/character.controller';

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
`);

AdminTC.addResolver(getShowDataFromIMDB);

const AdminQueryFields = {
  getShowDataFromIMDB: AdminTC.getResolver('getShowDataFromIMDB'),
}

export { AdminTC, AdminQueryFields }
