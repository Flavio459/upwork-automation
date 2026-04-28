import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpworkFeedCollector } from '../../services/upwork-feed-collector';
import { createPageMock, createContextMock } from '../harness/browser-mock';

// Mock do BrowserManager
vi.mock('../../services/browser-manager', () => {
  return {
    BrowserManager: class {
      init = vi.fn().mockImplementation(async () => {
        const pageMock = createPageMock();
        pageMock.url = vi.fn().mockReturnValue('https://www.upwork.com/nx/find-work/best-matches');
        pageMock.bringToFront = vi.fn().mockResolvedValue(null);
        pageMock.title = vi.fn().mockResolvedValue('Upwork - Best Matches');
        
        const locatorMock = pageMock.locator();
        locatorMock.count = vi.fn().mockResolvedValue(1);
        locatorMock.evaluate = vi.fn().mockResolvedValue({
          title: 'Mock Job Title',
          text: 'Mock Job Description',
          href: 'https://www.upwork.com/jobs/~12345',
          opportunityId: '12345',
          budget: '$500',
        });

        const contextMock = createContextMock();
        contextMock.pages = vi.fn().mockReturnValue([pageMock]);
        return contextMock;
      });
      close = vi.fn().mockResolvedValue(null);
      getUpworkWebSocketUrl = vi.fn().mockResolvedValue(null);
    }
  };
});

describe('UpworkFeedCollector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve coletar oportunidades com sucesso', async () => {
    const collector = new UpworkFeedCollector({ maxScrollRounds: 1, maxOpportunities: 1 });
    const opportunities = await collector.collectBestMatchesOpportunities();

    expect(opportunities).toBeDefined();
    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities[0].title).toBe('Mock Job Title');
    expect(opportunities[0].budget).toBe('$500');
  });
});
