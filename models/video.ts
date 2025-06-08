export interface Video {
  id: string;
  title: string;
  duration: number; // 秒単位
  url: string;
  thumbnail: string;
  channel_id: string;
}