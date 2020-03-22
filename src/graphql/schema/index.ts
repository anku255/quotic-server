import { schemaComposer } from 'graphql-compose';
import { UserMutationFields, UserQueryFields } from '../resolvers/user.resolver';

// Queries
schemaComposer.Query.addFields(UserQueryFields)

// Mutations
schemaComposer.Mutation.addFields(UserMutationFields)

const graphqlSchema = schemaComposer.buildSchema()

export default graphqlSchema
