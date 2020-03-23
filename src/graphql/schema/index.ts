import { schemaComposer } from 'graphql-compose';
import { UserQueryFields, UserMutationFields } from '../resolvers/user.resolver';
import { QuoteQueryFields, QuoteMutationFields } from '../resolvers/quote.resolver';
import { ShowQueryFields, ShowMutationFields } from '../resolvers/show.resolver';
import { CharacterQueryFields, CharacterMutationFields } from '../resolvers/character.resolver';

// Queries
schemaComposer.Query.addFields({
  ...UserQueryFields,
  ...QuoteQueryFields,
  ...ShowQueryFields,
  ...CharacterQueryFields
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
