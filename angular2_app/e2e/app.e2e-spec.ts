import { GatheringThingsTogetherPage } from './app.po';

describe('gathering-things-together App', function() {
  let page: GatheringThingsTogetherPage;

  beforeEach(() => {
    page = new GatheringThingsTogetherPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
