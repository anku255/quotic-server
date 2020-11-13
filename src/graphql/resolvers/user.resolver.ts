import { schemaComposer } from 'graphql-compose';
import { composeWithMongoose } from 'graphql-compose-mongoose';

import User from '../../models/user.model';
import { me, signIn, signUp } from '../../controllers/auth'

// CONVERT MONGOOSE MODEL TO GraphQL PIECES
const customizationOptions = {}; // left it empty for simplicity, described below
const UserTC = composeWithMongoose(User, customizationOptions);

// Remove Fields
UserTC.removeField('password')

// Add Resolvers
UserTC.addResolver(signIn);
UserTC.addResolver(signUp);
UserTC.addResolver(me);

const UserQueryFields = {
  userById: UserTC.getResolver('findById'),
  userByIds: UserTC.getResolver('findByIds'),
  userOne: UserTC.getResolver('findOne'),
  userMany: UserTC.getResolver('findMany'),
  userCount: UserTC.getResolver('count'),
  me: UserTC.getResolver('me'),
};

const UserMutationFields = {
  userCreateOne: UserTC.getResolver('createOne'),
  userUpdateById: UserTC.getResolver('updateById'),
  userUpdateOne: UserTC.getResolver('updateOne'),
  userRemoveById: UserTC.getResolver('removeById'),
  userRemoveOne: UserTC.getResolver('removeOne'),
  signIn: UserTC.getResolver('signIn'),
  signUp: UserTC.getResolver('signUp'),
}

schemaComposer.createObjectTC({
  name: 'AccessToken',
  fields: { accessToken: 'String!' }
})


export { UserTC, UserQueryFields, UserMutationFields }
