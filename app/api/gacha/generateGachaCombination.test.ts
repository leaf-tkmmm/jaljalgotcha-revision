import { Video } from '@/models/video';
import { generateGachaCombination } from './route';


describe('generateGachaCombination', () => {
  const mockVideos: Video[] = [
    {
      id: '1',
      title: 'Video 1',
      duration: 30,
      url: 'https://example.com/1',
      thumbnail: 'thumb1.jpg',
      channel_id: 'channel1'
    },
    {
      id: '2',
      title: 'Video 2',
      duration: 90,
      url: 'https://example.com/2',
      thumbnail: 'thumb2.jpg',
      channel_id: 'channel2'
    },
    {
      id: '3',
      title: 'Video 3',
      duration: 120,
      url: 'https://example.com/3',
      thumbnail: 'thumb3.jpg',
      channel_id: 'channel3'
    },
    {
      id: '4',
      title: 'Video 4',
      duration: 180,
      url: 'https://example.com/4',
      thumbnail: 'thumb4.jpg',
      channel_id: 'channel4'
    }
  ];

  beforeEach(() => {
    // Math.randomをモックして一貫性のあるテスト結果を得る
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('正常なケース: 300秒（5分）の目標時間', () => {
    const result = generateGachaCombination(300, mockVideos);
    
    expect(result.videos).toBeDefined();
    expect(result.totalDuration).toBeLessThanOrEqual(300);
    expect(result.remainingSeconds).toBeGreaterThanOrEqual(0);
    expect(result.remainingSeconds).toBeLessThanOrEqual(60);
    expect(result.totalDuration + result.remainingSeconds).toBe(300);
  });

  test('短い目標時間: 60秒未満', () => {
    const result = generateGachaCombination(50, mockVideos);
    
    expect(result.videos).toHaveLength(0);
    expect(result.totalDuration).toBe(0);
    expect(result.remainingSeconds).toBe(50);
  });

  test('空の動画配列', () => {
    const result = generateGachaCombination(300, []);
    
    expect(result.videos).toHaveLength(0);
    expect(result.totalDuration).toBe(0);
    expect(result.remainingSeconds).toBe(300);
  });

  test('すべての動画が目標時間より長い場合', () => {
    const longVideos: Video[] = [
      {
        id: '1',
        title: 'Long Video 1',
        duration: 400,
        url: 'https://example.com/1',
        thumbnail: 'thumb1.jpg',
        channel_id: 'channel1'
      }
    ];
    
    const result = generateGachaCombination(300, longVideos);
    
    expect(result.videos).toHaveLength(0);
    expect(result.totalDuration).toBe(0);
    expect(result.remainingSeconds).toBe(300);
  });

  test('同じ動画が重複選択されないこと', () => {
    const singleVideo: Video[] = [
      {
        id: '1',
        title: 'Single Video',
        duration: 100,
        url: 'https://example.com/1',
        thumbnail: 'thumb1.jpg',
        channel_id: 'channel1'
      }
    ];
    
    const result = generateGachaCombination(300, singleVideo);
    
    expect(result.videos).toHaveLength(1);
    expect(result.totalDuration).toBe(100);
    expect(result.remainingSeconds).toBe(200);
  });

  test('残り時間が60秒未満になった時点で終了すること', () => {
    // 260秒の動画を選択後、残り40秒で他の動画は選択されない
    const videos: Video[] = [
      {
        id: '1',
        title: 'Video 1',
        duration: 260,
        url: 'https://example.com/1',
        thumbnail: 'thumb1.jpg',
        channel_id: 'channel1'
      },
      {
        id: '2',
        title: 'Video 2',
        duration: 100,
        url: 'https://example.com/2',
        thumbnail: 'thumb2.jpg',
        channel_id: 'channel2'
      }
    ];
    
    const result = generateGachaCombination(300, videos);
    
    expect(result.videos).toHaveLength(1);
    expect(result.totalDuration).toBe(260);
    expect(result.remainingSeconds).toBe(40);
    expect(result.remainingSeconds).toBeLessThan(60);
  });

  test('返されるレスポンスの型が正しいこと', () => {
    const result = generateGachaCombination(300, mockVideos);
    
    expect(typeof result.totalDuration).toBe('number');
    expect(typeof result.remainingSeconds).toBe('number');
    expect(Array.isArray(result.videos)).toBe(true);
    
    result.videos.forEach(video => {
      expect(video).toHaveProperty('id');
      expect(video).toHaveProperty('title');
      expect(video).toHaveProperty('duration');
      expect(video).toHaveProperty('url');
      expect(video).toHaveProperty('thumbnail');
      expect(video).toHaveProperty('channel_id');
    });
  });

  test('大きな目標時間でも正しく動作すること', () => {
    const result = generateGachaCombination(3600, mockVideos); // 1時間
    
    expect(result.videos).toBeDefined();
    expect(result.totalDuration).toBeLessThanOrEqual(3600);
    expect(result.remainingSeconds).toBeGreaterThanOrEqual(0);
    expect(result.totalDuration + result.remainingSeconds).toBe(3600);
  });
});