import Quote from '../models/quote.model';
import Show from '../models/show.model';
import Character from '../models/character.model';

interface SearchResult {
  id: number;
  type: 'quote' | 'show' | 'character';
  imageUrl: string;
  quote?: string;
  showYear?: number;
  characterName?: string;
  showName?: string;
}

const formatSearchResults = (quotes, shows, characters) => {
  const formattedQuotes = quotes.map(quote => ({
    type: 'quote',
    id: quote._id,
    quote: quote.markup,
    showName: quote.show.name,
    imageUrl: 'https://i.imgur.com/kv3nT2a.png',
  }));
  const formattedShows = shows.map(show => ({
    type: 'show',
    id: show._id,
    showName: show.name,
    showYear: show.year,
    imageUrl: show.coverPicture,
  }));
  const formattedCharacters = characters.map(character => ({
    type: 'character',
    id: character._id,
    characterName: character.characterName,
    imageUrl: character.coverPicture,
    showName: character.shows?.[0]?.name,
    showYear: character.shows?.[0]?.year,
  }));
  return formattedShows.concat(formattedCharacters, formattedQuotes);
};

export const searchByQuery = {
  name: 'searchByQuery',
  type: '[SearchResult]!',
  args: {
    query: 'String!',
  },
  resolve: async ({ args: { query } }): Promise<Array<SearchResult>> => {
    const quoteSearchPromise = Quote.find({ raw: new RegExp(query, 'i') })
      .limit(5)
      .populate('show');
    const showSearchPromise = Show.find({ name: new RegExp(query, 'i') });
    const characterSearchPromise = Character.find({
      $or: [{ characterName: new RegExp(query, 'i') }, { realName: new RegExp(query, 'i') }],
    }).populate('shows');

    const [quotes, shows, characters] = await Promise.all([
      quoteSearchPromise,
      showSearchPromise,
      characterSearchPromise,
    ]);

    return formatSearchResults(quotes, shows, characters);
  },
};

export const searchCharacters = {
  name: 'searchCharacters',
  type: '[Character]!',
  args: {
    characterName: 'String',
    realName: 'String',
    showId: 'String',
    limit: 'Int',
  },
  resolve: async ({ args: { characterName, realName, showId, limit } }): Promise<Array<unknown>> => {
    const characters = await Character.find({
      $or: [{ characterName: new RegExp(characterName, 'i'), realName: new RegExp(realName, 'i') }],
      shows: [showId],
    })
      .limit(limit ?? 10)
      .lean();
    return characters;
  },
};

export const searchShows = {
  name: 'searchShows',
  type: '[Show]!',
  args: {
    name: 'String',
    limit: 'Int',
  },
  resolve: async ({ args: { name, limit } }): Promise<Array<unknown>> => {
    const shows = await Show.find({ name: new RegExp(name, 'i') })
      .limit(limit ?? 10)
      .lean();
    return shows;
  },
};
