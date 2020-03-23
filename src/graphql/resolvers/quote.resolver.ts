import { composeWithMongoose } from 'graphql-compose-mongoose';

import Quote from '../../models/Quote';
import { ShowTC } from './show.resolver'

const customizationOptions = {};
const QuoteTC = composeWithMongoose(Quote, customizationOptions);

QuoteTC.addRelation('show', {
  resolver: () => ShowTC.getResolver('findById'),
  prepareArgs: {
    _id: (source: { show: string }): string => source.show
  },
  projection: { show: true }
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
  quoteUpdateById: QuoteTC.getResolver('updateById'),
  quoteUpdateOne: QuoteTC.getResolver('updateOne'),
  quoteRemoveById: QuoteTC.getResolver('removeById'),
  quoteRemoveOne: QuoteTC.getResolver('removeOne'),
}


export { QuoteTC, QuoteQueryFields, QuoteMutationFields }
