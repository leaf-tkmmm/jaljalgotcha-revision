import { Video } from './video';

export interface GachaRequest {
  minutes: number; // 1-1000
}

export interface GachaResponse {
  videos: Video[];
  totalDuration: number; // 秒単位
  remainingSeconds: number;
}