import Quote from '../models/Quote';
import Show from '../models/Show';
import Character from '../models/Character';

interface SearchResult {
  id: number;
  type: "quote" | "show" | "character";
  imageUrl: string;
  quote?: string;
  showYear?: number;
  characterName?: string;
  showName?: string;
}

const formatSearchResults = (quotes, shows, characters) => {
  const formattedQuotes = quotes.map(quote => ({type: 'quote', id: quote._id, quote: quote.markup, showName: quote.show.name, imageUrl: "https://i.imgur.com/kv3nT2a.png" }) );
  const formattedShows = shows.map(show => ({type: 'show', id: show._id, showName: show.name, showYear: show.year, imageUrl: show.coverPicture}));
  const formattedCharacters= characters.map(character => ({type: 'character', id: character._id, characterName: character.characterName, imageUrl: character.coverPicture, showName: character.shows?.[0]?.name, showYear: character.shows?.[0]?.year }));
  return formattedQuotes.concat(formattedShows, formattedCharacters);
}

export const searchByQuery = {
  name: 'searchByQuery',
  type: '[SearchResult]!',
  args: {
    query: 'String!',
  },
  resolve: async ({ args: { query } }): Promise<Array<SearchResult>> => {
    const quoteSearchPromise = Quote.find({ raw: new RegExp(query, 'i') }).populate('show');
    const showSearchPromise = Show.find({ name: new RegExp(query, 'i') });
    const characterSearchPromise = Character.find({ $or: [{ characterName: new RegExp(query, 'i')}, {realName: new RegExp(query, 'i') }] }).populate('shows');

    const [quotes, shows, characters] = await Promise.all([quoteSearchPromise, showSearchPromise, characterSearchPromise]);

    return formatSearchResults(quotes, shows, characters);
  }
}
