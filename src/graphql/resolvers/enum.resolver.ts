import { schemaComposer } from 'graphql-compose';

const EnumTC = schemaComposer.createEnumTC(`
  enum ShowTypeEnum {
    SERIES
    MOVIE
  }
`);

export { EnumTC };
