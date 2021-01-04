import { composeWithMongoose } from 'graphql-compose-mongoose';

import Character from '../../models/character.model';
import { ShowTC } from './show.resolver'

const customizationOptions = {};
const CharacterTC = composeWithMongoose(Character, customizationOptions);

CharacterTC.addRelation('shows', {
  resolver: () => ShowTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (source: { shows: [string] }): [string] => source.shows
  },
  projection: { shows: true }
})

const CharacterQueryFields = {
  characterById: CharacterTC.getResolver('findById'),
  characterByIds: CharacterTC.getResolver('findByIds'),
  characterOne: CharacterTC.getResolver('findOne'),
  characterMany: CharacterTC.getResolver('findMany'),
  characterCount: CharacterTC.getResolver('count'),
};

const CharacterMutationFields = {
  characterCreateOne: CharacterTC.getResolver('createOne'),
  characterCreateMany: CharacterTC.getResolver('createMany'),
  characterUpdateById: CharacterTC.getResolver('updateById'),
  characterUpdateOne: CharacterTC.getResolver('updateOne'),
  characterRemoveById: CharacterTC.getResolver('removeById'),
  characterRemoveOne: CharacterTC.getResolver('removeOne'),
}


export { CharacterTC, CharacterQueryFields, CharacterMutationFields }
