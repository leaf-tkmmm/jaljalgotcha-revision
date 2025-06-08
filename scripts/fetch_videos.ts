import axios from 'axios';
import { promises as fs } from 'fs';
import { parse as parseIso, toSeconds } from 'iso8601-duration';
import 'dotenv/config';

const { YOUTUBE_API_KEY: API_KEY, YOUTUBE_CHANNEL_ID: CHANNEL_ID } = process.env;
if (!API_KEY || !CHANNEL_ID) throw new Error('Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID');

interface Video {
  id: string;
  title: string;
  duration: number;          // seconds
  url: string;
  thumbnail: string;
  channel_id: string;
}

/** Get the channel’s “uploads” playlist ID */
async function fetchUploadsPlaylistId(): Promise<string> {
  const { data } = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
    params: { key: API_KEY, id: CHANNEL_ID, part: 'contentDetails', maxResults: 1 }
  });
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error('Could not find uploads playlist');
  return uploadsId;
}

/** Collect *all* videoIds from the uploads playlist */
async function fetchAllVideoIds(playlistId: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken = '';
  do {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        key: API_KEY,
        playlistId,
        part: 'contentDetails',
        maxResults: 50,
        pageToken
      }
    });
    const newIds = (data.items ?? [])
      .map((it: any) => it.contentDetails?.videoId)
      .filter(Boolean);
    ids.push(...newIds);
    pageToken = data.nextPageToken ?? '';
  } while (pageToken);
  return ids;
}

/** Batch-fetch metadata & shape it */
async function fetchVideos(ids: string[]): Promise<Video[]> {
  const videos: Video[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50).join(',');
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: { key: API_KEY, id: batch, part: 'snippet,contentDetails' }
    });
    for (const item of data.items ?? []) {
      videos.push({
        id: item.id,
        title: item.snippet.title,
        duration: toSeconds(parseIso(item.contentDetails.duration)),
        url: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnail: `https://img.youtube.com/vi/${item.id}/0.jpg`,
        channel_id: CHANNEL_ID!
      });
    }
  }
  return videos;
}

async function main() {
  console.log('Resolving uploads playlist…');
  const uploadsId = await fetchUploadsPlaylistId();

  console.log('Gathering every video ID…');
  const ids = await fetchAllVideoIds(uploadsId);
  console.log(`Found ${ids.length} videos.`);

  console.log('Fetching metadata batches…');
  const videos = await fetchVideos(ids);
  videos.sort((a, b) => a.duration - b.duration);

  await fs.mkdir('public', { recursive: true });
  await fs.writeFile('public/videos.json', JSON.stringify(videos, null, 2), 'utf-8');
  console.log('✅ Done – videos.json updated');
}

main().catch(err => { console.error(err); process.exit(1); });
