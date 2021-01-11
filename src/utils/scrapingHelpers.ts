import $ from 'cheerio';

export const getPrevSiblingOfType = ({ element, siblingType }) => {
  if (!element) return null;

  if (element.name === siblingType) return element;

  return getPrevSiblingOfType({ element: element.prev, siblingType });
};

export const getEpisodeName = element => {
  const h3Tag = getPrevSiblingOfType({ element, siblingType: 'h3' });

  // @ts-expect-error
  const episodeName = $.text($('.mw-headline', h3Tag));

  return episodeName;
};

export const getSeasonName = element => {
  const h2Tag = getPrevSiblingOfType({ element, siblingType: 'h2' });
  // @ts-expect-error
  const seasonName = $('.mw-headline', h2Tag)[0].children[0].data;
  return seasonName;
};

export const parseQuoteMarkup = element => {
  if (element.name !== 'dl') {
    throw new Error('element must be of dl type');
  }

  const ddTags = $('dd', element).toArray();

  let quote = '';
  const characters = [];

  ddTags.forEach(dd => {
    dd.children.forEach((e: any) => {
      // Handle text
      if (e.type === 'text') {
        quote += `${e.data}`;
      } else if (e.name === 'b') {
        const text = ($ as any).text(e.children);
        quote += `**${text}**`;
        characters.push(text.replace(':', ''));
      } else if (e.name === 'i') {
        const text = ($ as any).text(e.children);
        quote += `*${text}*`;
      } else {
        const text = ($ as any).text(e.children);
        quote += `${text}`;
      }
    });
    quote += `\n\n`;
  });
  return {
    quoteMd: `\n\n${quote}\n\n`,
    characters,
  };
};
