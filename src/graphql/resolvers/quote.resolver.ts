import { composeWithMongoose } from 'graphql-compose-mongoose';

import Quote from '../../models/quote.model';
import { ShowTC } from './show.resolver'
import { CharacterTC } from './character.resolver';

const customizationOptions = {};
const QuoteTC = composeWithMongoose(Quote, customizationOptions);

QuoteTC.addRelation('show', {
  resolver: () => ShowTC.getResolver('findById'),
  prepareArgs: {
    _id: (source: { show: string }): string => source.show
  },
  projection: { show: true }
})

QuoteTC.addRelation('characters', {
  resolver: () => CharacterTC.getResolver('findByIds'),
  prepareArgs: {
    _ids: (source: { characters: [string] }): [string] => source.characters
  },
  projection: { characters: true }
})

QuoteTC.addRelation('mainCharacter', {
  resolver: () => CharacterTC.getResolver('findById'),
  prepareArgs: {
    _id: (source: { mainCharacter: string }): string => source.mainCharacter
  },
  projection: { mainCharacter: true }
})

const QuoteQueryFields = {
  quoteById: QuoteTC.getResolver('findById'),
  quoteByIds: QuoteTC.getResolver('findByIds'),
  quoteOne: QuoteTC.getResolver('findOne'),
  quoteMany: QuoteTC.getResolver('findMany'),
  quoteCount: QuoteTC.getResolver('count'),
};

const QuoteMutationFields = {
  quoteCreateOne: QuoteTC.getResolver('createOne'),
  quoteCreateMany: QuoteTC.getResolver('createMany'),
  quoteUpdateById: QuoteTC.getResolver('updateById'),
  quoteUpdateOne: QuoteTC.getResolver('updateOne'),
  quoteRemoveById: QuoteTC.getResolver('removeById'),
  quoteRemoveOne: QuoteTC.getResolver('removeOne'),
}


export { QuoteTC, QuoteQueryFields, QuoteMutationFields }
