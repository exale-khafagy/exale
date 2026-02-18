import { contentMap, type ContentBlock } from '../api';

describe('contentMap', () => {
  it('maps blocks to key-value record', () => {
    const blocks: ContentBlock[] = [
      { id: '1', key: 'hero_title', value: 'Hello', type: 'text', section: 'home' },
      { id: '2', key: 'hero_subtitle', value: 'World', type: 'text', section: 'home' },
    ];
    const result = contentMap(blocks);
    expect(result).toEqual({ hero_title: 'Hello', hero_subtitle: 'World' });
  });

  it('returns empty object for empty blocks', () => {
    expect(contentMap([])).toEqual({});
  });
});
