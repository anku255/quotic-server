import rp from 'request-promise';
import $ from 'cheerio';
import url from 'url';
import { uploadImage } from '../utils/uploadImage';
import { accessDeepObject } from '../utils/commonHelpers';

const BASE_URL = `https://www.imdb.com`;

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

          $('#bySeason option', episodePageHTML).map((i, x) => seasons.push($(x).val()));

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
    type: "ShowTypeEnum!",
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
