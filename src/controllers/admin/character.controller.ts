import rp from 'request-promise';
import $ from 'cheerio';
import { uploadImage } from '../../utils/uploadImage';
import { accessDeepObject } from '../../utils/commonHelpers';

const BASE_URL = `https://www.imdb.com`;

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
          genre,
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
