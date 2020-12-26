import { schemaComposer } from 'graphql-compose';
import { UserQueryFields, UserMutationFields } from '../resolvers/user.resolver';
import { QuoteQueryFields, QuoteMutationFields } from '../resolvers/quote.resolver';
import { ShowQueryFields, ShowMutationFields } from '../resolvers/show.resolver';
import { CharacterQueryFields, CharacterMutationFields } from '../resolvers/character.resolver';
import { SearchQueryFields } from '../resolvers/search.resolver';
import { HomeQueryFields } from '../resolvers/home.resolver';

// Queries
schemaComposer.Query.addFields({
  ...UserQueryFields,
  ...QuoteQueryFields,
  ...ShowQueryFields,
  ...CharacterQueryFields,
  ...SearchQueryFields,
  ...HomeQueryFields
})

// Mutations
schemaComposer.Mutation.addFields({
  ...UserMutationFields,
  ...QuoteMutationFields,
  ...ShowMutationFields,
  ...CharacterMutationFields
})

const graphqlSchema = schemaComposer.buildSchema()

export default graphqlSchema
