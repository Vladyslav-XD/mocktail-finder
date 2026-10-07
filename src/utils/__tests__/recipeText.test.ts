import { buildShareMessage, splitInstructions } from '../recipeText';
import { translate, Language, Translate } from '../../i18n';

const tFor = (lang: Language): Translate => (key, params) => translate(lang, key, params);

describe('splitInstructions', () => {
  it('splits sentences, keeps decimals, handles a missing space', () => {
    expect(splitInstructions('Mix 1.5 oz juice. Serve.')).toEqual(['Mix 1.5 oz juice.', 'Serve.']);
    expect(splitInstructions('Add ice.Add juice')).toEqual(['Add ice.', 'Add juice.']);
  });

  it('splits Ukrainian sentences too', () => {
    expect(splitInstructions('Змішайте.Подавайте з льодом.')).toEqual(['Змішайте.', 'Подавайте з льодом.']);
  });
});

describe('buildShareMessage', () => {
  const recipe = {
    title: 'Afterglow',
    ingredients: ['1 part Grenadine'],
    instructions: 'Mix. Serve over ice.',
    imageUrl: 'https://example.com/a.jpg',
  };

  it('English', () => {
    expect(buildShareMessage(recipe, tFor('en'))).toBe(
      [
        'Afterglow — a non-alcoholic recipe from Mocktail Finder',
        '',
        'Ingredients:',
        '• 1 part Grenadine',
        '',
        'Preparation Steps:',
        '1. Mix.',
        '2. Serve over ice.',
        '',
        'https://example.com/a.jpg',
        '',
        'Get Mocktail Finder: https://apps.apple.com/app/id6811610325',
      ].join('\n')
    );
  });

  it('Ukrainian headings; written steps are kept whole', () => {
    const text = buildShareMessage(
      { title: 'Маргарита', ingredients: ['50 мл сік'], steps: ['Перше речення. Друге речення.', 'Третє.'] },
      tFor('uk')
    );
    expect(text).toContain('Інгредієнти:');
    expect(text).toContain('Приготування:\n1. Перше речення. Друге речення.\n2. Третє.');
    // A bundled photo has no address to share.
    expect(text).not.toContain('http://');
  });
});
