import { composeWithMongoose } from 'graphql-compose-mongoose';

import Show from '../../models/Show';
import { CharacterTC } from './character.resolver';

const customizationOptions = {};
const ShowTC = composeWithMongoose(Show, customizationOptions);

ShowTC.addRelation('characters', {
  resolver: () => CharacterTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (source: { characters: [string] }): [string] => source.characters
  },
  projection: { characters: true }
})

const ShowQueryFields = {
  showById: ShowTC.getResolver('findById'),
  showByIds: ShowTC.getResolver('findByIds'),
  showOne: ShowTC.getResolver('findOne'),
  showMany: ShowTC.getResolver('findMany'),
  showCount: ShowTC.getResolver('count'),
};

const ShowMutationFields = {
  showCreateOne: ShowTC.getResolver('createOne'),
  showUpdateById: ShowTC.getResolver('updateById'),
  showUpdateOne: ShowTC.getResolver('updateOne'),
  showRemoveById: ShowTC.getResolver('removeById'),
  showRemoveOne: ShowTC.getResolver('removeOne'),
}


export { ShowTC, ShowQueryFields, ShowMutationFields }
