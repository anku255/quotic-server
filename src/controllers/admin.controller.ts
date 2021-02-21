import rp from 'request-promise';
import $ from 'cheerio';
import Showdown from 'showdown';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import url from 'url';
import { uploadImage } from '../utils/uploadImage';
import { accessDeepObject } from '../utils/commonHelpers';
import { redisKeys } from '../utils/redisKeys';
import { redisGet, redisSet } from '../utils/redis';
import CharacterModel from '../models/character.model';
import { getEpisodeName, getSeasonName, parseQuoteMarkup } from '../utils/scrapingHelpers';

const BASE_URL = `https://www.imdb.com`;

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const getFullImageUrl = (url: string): string => {
  const fullImageUrl = url.split('._V1')[0];
  const extension = url.split('.').pop();
  return `${fullImageUrl}.${extension}`;
};

export const getShowDataFromIMDB = {
  name: 'getShowDataFromIMDB',
  type: 'ShowData',
  args: {
    IMDBShowCode: 'String!',
  },
  resolve: async ({ args: { IMDBShowCode } }): Promise<unknown> => {
    try {
      const showPageUrl = `${BASE_URL}/title/${IMDBShowCode}`;
      const showPageHTML = await rp(showPageUrl);
      const scriptTag = $('script[type="application/ld+json"]', showPageHTML).toArray();

      try {
        const JSONData = JSON.parse(accessDeepObject('0.children.0.data', scriptTag));
        const { name, genre, image, datePublished, aggregateRating } = JSONData;

        const rating = parseFloat(aggregateRating.ratingValue);
        const year = new Date(datePublished).getFullYear();
        const type = JSONData['@type'] === 'Movie' ? 'MOVIE' : 'SERIES';

        const ogDescription = $('meta[property="og:description"]', showPageHTML).toArray();

        const description = accessDeepObject('0.attribs.content', ogDescription);
        let episodes = [];
        let seasons = [];

        if (type === 'SERIES') {
          const episodePageUrl = `${BASE_URL}/title/${IMDBShowCode}/episodes`;
          const episodePageHTML = await rp(episodePageUrl);

          $('#bySeason option', episodePageHTML).map((_, x) => seasons.push($(x).val()));

          seasons = seasons
            .map(s => parseInt(s, 10))
            .filter(s => s > 0)
            .sort();

          const seasonsPromises = seasons.map(async season => {
            const seasonPageUrl = `${BASE_URL}/title/${IMDBShowCode}/episodes?season=${season}`;
            const seasonPageHTML = await rp(seasonPageUrl);
            const numberOfEpisodesMetaTag = $('meta[itemprop="numberofEpisodes"]', seasonPageHTML).toArray();

            const numberOfEpisodes = accessDeepObject('0.attribs.content', numberOfEpisodesMetaTag);

            episodes.push({
              season,
              episodes: parseInt(numberOfEpisodes, 10),
            });
          });
          await Promise.all(seasonsPromises);

          episodes.sort((a, b) => a.season - b.season);
        }

        // Upload image
        const imagedata: any = await uploadImage({
          fileUrl: image,
          entityType: 'SHOW',
        });

        const coverPicture = imagedata.cloudinaryUrl;

        const showDetails = {
          name,
          genre: typeof genre === 'string' ? [genre] : genre,
          description,
          coverPicture,
          year,
          rating,
          type,
          seasons: type === 'SERIES' ? seasons.length : undefined,
          episodes: type === 'SERIES' ? episodes : undefined,
          imdbLink: showPageUrl,
        };

        return showDetails;
      } catch (error) {
        console.log('Error while JSON parsing', error);
        return null;
      }
    } catch (error) {
      console.log('error', error);
      return null;
    }
  },
};

export const getCharactersFromIMDB = {
  name: 'getCharactersFromIMDB',
  type: '[IMDBCharacter]',
  args: {
    IMDBShowCode: 'String!',
    type: 'ShowTypeEnum!',
  },
  resolve: async ({ args: { IMDBShowCode, type } }): Promise<unknown> => {
    const castPageUrl = `${BASE_URL}/title/${IMDBShowCode}/fullcredits`;
    const castPageHtml = await rp(castPageUrl);

    const characterRows = $('.cast_list tr', castPageHtml)
      .toArray()
      .slice(1);

    const characters = [];

    const promises = characterRows.map(async el => {
      const imgUrl = accessDeepObject('0.attribs.loadlate', $('img', el));

      if (imgUrl) {
        const aTags = $('td a', el).toArray();
        const numberOfEpisodes = parseInt(accessDeepObject('3.attribs.data-n', aTags), 10);

        if (type === 'MOVIE' || numberOfEpisodes > 5) {
          let coverPicture = null;

          const imagedata: any = await uploadImage({
            fileUrl: getFullImageUrl(imgUrl),
            entityType: 'CHARACTER',
          });

          coverPicture = imagedata.cloudinaryUrl;

          const relativeImdbUrl = accessDeepObject('1.attribs.href', aTags);
          const realName = accessDeepObject('1.children.0.data', aTags);
          const characterName = accessDeepObject('2.children.0.data', aTags);

          const imdbLink = `${BASE_URL}${url.parse(`${relativeImdbUrl}`).pathname}`;

          const imdbBioUrl = `${imdbLink}bio`;

          const bioPageHtml = await rp(imdbBioUrl);

          const dobString = accessDeepObject('0.attribs.datetime', $('time', bioPageHtml));
          let dob;
          try {
            dob = dobString ? new Date(dobString).toISOString() : undefined;
          } catch {
            // do nothing
          }

          const bioMarkup = $('#bio_content p', bioPageHtml).html();

          const character = {
            characterName: characterName.replace(/^\s+|\s+$/g, ''),
            realName: realName.replace(/^\s+|\s+$/g, ''),
            imdbLink,
            dob,
            coverPicture,
            bioMarkup: bioMarkup.replace(/^\s+|\s+$/g, ''),
          };
          characters.push(character);
        }
      }
    });

    await Promise.all(promises);

    return characters;
  },
};

export const getEpisodesFromWikiQuotes = {
  name: 'getEpisodesFromWikiQuotes',
  type: 'String!',
  args: {
    wikiQuotesUrl: 'String!',
  },
  resolve: async ({ args: { wikiQuotesUrl } }): Promise<unknown> => {
    const html = await rp(wikiQuotesUrl);

    const episodeSelector = `h3 .mw-headline`;

    const episodes = $(episodeSelector, html)
      .toArray()
      // @ts-expect-error
      .map(x => $.text(x.children));
    const episodesMap = Object.fromEntries(episodes.map(x => [x, '']));
    return JSON.stringify(episodesMap, null, 2);
  },
};

export const getQuotesFromWikiQuotes = {
  name: 'getQuotesFromWikiQuotes',
  type: '[WikiQuote]',
  args: {
    wikiQuotesUrl: 'String!',
    episodesMap: 'String',
    type: 'ShowTypeEnum!',
    showId: 'String!',
    limit: 'Int!',
    skip: 'Int!',
  },
  resolve: async ({
    args: { wikiQuotesUrl, episodesMap, type, showId, limit, skip },
    context: { redisClient },
  }): Promise<unknown> => {
    const [html] = await Promise.all([
      fetchWikiQuoteHTML(wikiQuotesUrl, redisClient),
      initializeCharacterNames({ showId }),
    ]);

    if (type === 'SERIES') {
      return getAllQuotesFromSeries({ html, showId, episodesMap, skip, limit });
    }

    return getAllQuotesFromMovies({ html, skip, limit, showId });
  },
};

let characterNames;
let charcterNameToIdMap;

async function initializeCharacterNames({ showId }) {
  const characters: any = await CharacterModel.find({ shows: { $in: [showId] } });
  characterNames = characters.map(c => c.characterName);
  charcterNameToIdMap = characters.reduce((acc, curr) => {
    acc[curr.characterName] = curr._id;
    return acc;
  }, {});
}

function getCharacterId({ characterName }) {
  for (const name of characterNames) {
    const re1 = new RegExp(characterName, 'i');
    const re2 = new RegExp(name, 'i');
    if (name.match(re1) !== null || characterName.match(re2) !== null) {
      return charcterNameToIdMap[name];
    }
  }
  return null;
}

async function getAllQuotesFromMovies({ html, skip, limit, showId }) {
  const characterNameSelector = `h2 .mw-headline`;

  const characterNames = $(characterNameSelector, html)
    .toArray()
    .map((x: any) => x.children[0].data);
  const indexOfDialogue = characterNames.indexOf('Dialogue');

  let totalCharacterQuotes = $(characterNameSelector, html)
    .slice(0, indexOfDialogue)
    .toArray()
    .map((x: any) => {
      const characterName = x.children[0].data;
      const parentH2 = x.parent;
      const siblingUL = parentH2.next.next;
      const listItems = siblingUL.children;
      const quotesByThisCharacter = listItems
        .map(({ type, name, children }) =>
          type === 'tag' && name === 'li' ? { characterName, quote: children[0].data } : undefined,
        )
        .filter(x => x && x.quote);
      return quotesByThisCharacter;
    });

  totalCharacterQuotes = flatten(totalCharacterQuotes);

  const characterQuotesAfterLimit = totalCharacterQuotes.slice(skip, skip + limit).map(({ characterName, quote }) => {
    const characterId = getCharacterId({ characterName });
    return {
      raw: quote,
      markup: converter.makeHtml(quote),
      characters: [{ label: characterName, value: characterId }],
      show: showId,
      mainCharacter: { label: characterName, value: characterId },
    };
  });

  if (characterQuotesAfterLimit.length === limit) {
    return characterQuotesAfterLimit;
  }

  const updatedSkip = skip - totalCharacterQuotes.length;
  const updatedLimit = limit - characterQuotesAfterLimit.length;

  const dlTags = $('dl', html)
    .toArray()
    .slice(updatedSkip, updatedSkip + updatedLimit);

  const quotes = [];

  const promises = dlTags.map(async dl => {
    const { quoteMd, characters } = parseQuoteMarkup(dl);
    let charactersWithIds = characters.map(characterName => ({
      label: characterName,
      value: getCharacterId({ characterName }),
    }));
    charactersWithIds = uniq(charactersWithIds.filter(Boolean));
    const quote = {
      raw: quoteMd,
      markup: converter.makeHtml(quoteMd),
      characters: charactersWithIds,
      show: showId,
      mainCharacter: charactersWithIds[0],
    };

    quotes.push(quote);
  });

  await Promise.all(promises);

  return [...characterQuotesAfterLimit, ...quotes];
}

async function getAllQuotesFromSeries({ html, showId, episodesMap, skip, limit }) {
  const seasonSelector = `h2 .mw-headline`;

  const seasons = $(seasonSelector, html)
    .toArray()
    .map((x: any) => x.children[0].data);

  const episodeNameToEpisodeMap = JSON.parse(episodesMap);

  const dlTags = $('dl', html)
    .toArray()
    .slice(skip, skip + limit);
  const quotes = [];

  dlTags.forEach(dl => {
    const { quoteMd, characters } = parseQuoteMarkup(dl);
    const episodeName = getEpisodeName(dl);

    const seasonName = getSeasonName(dl);

    const season = seasons.indexOf(seasonName) + 1;
    const episode = episodeNameToEpisodeMap[episodeName];
    const characterIds = uniq(characters.map(characterName => getCharacterId({ characterName })).filter(Boolean));
    const quote = {
      season,
      episode,
      raw: quoteMd,
      markup: converter.makeHtml(quoteMd),
      characters: characterIds,
      show: showId,
      mainCharacter: characterIds[0],
    };

    quotes.push(quote);
  });

  return quotes;
}

async function fetchWikiQuoteHTML(wikiQuotesUrl: string, redisClient: any): Promise<string> {
  let html = '';
  const data = await redisGet(redisKeys.wikiQuotesPage(wikiQuotesUrl), redisClient);
  if (data) {
    html = data;
  } else {
    html = await rp(wikiQuotesUrl);
    redisSet(redisKeys.wikiQuotesPage(wikiQuotesUrl), html, redisClient);
  }
  return html;
}
