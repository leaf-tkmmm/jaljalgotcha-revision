import { NextRequest, NextResponse } from 'next/server';
import { GachaRequest, GachaResponse } from '@/models/gacha';
import { Video } from '@/models/video';
import fs from 'fs';
import path from 'path';

let cachedVideos: Video[] | null = null;

function loadVideos(): Video[] {
  if (cachedVideos) {
    return cachedVideos;
  }
  
  const videosPath = path.join(process.cwd(), 'public', 'videos.json');
  const videosData = fs.readFileSync(videosPath, 'utf8');
  const videos: Video[] = JSON.parse(videosData);
  
  // duration昇順でソート
  cachedVideos = videos.sort((a, b) => a.duration - b.duration);
  return cachedVideos;
}

function generateGachaCombination(targetSeconds: number, videos: Video[]): GachaResponse {
  const usedVideoIds = new Set<string>();
  const selectedVideos: Video[] = [];
  let totalDuration = 0;
  
  while (true) {
    // 残り時間を計算
    const remainingTime = targetSeconds - totalDuration;
    
    // 残り時間が60秒未満なら終了
    if (remainingTime < 60) {
      break;
    }
    
    // 残り時間内に収まる未使用の動画を候補として抽出
    const candidates = videos.filter(video => 
      !usedVideoIds.has(video.id) && video.duration <= remainingTime
    );
    
    // 候補がない場合は終了
    if (candidates.length === 0) {
      break;
    }
    
    // 候補からランダム選択
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const selectedVideo = candidates[randomIndex];
    
    // 選択した動画を結果に追加
    selectedVideos.push(selectedVideo);
    usedVideoIds.add(selectedVideo.id);
    totalDuration += selectedVideo.duration;
  }
  
  const remainingSeconds = targetSeconds - totalDuration;
  
  return {
    videos: selectedVideos,
    totalDuration,
    remainingSeconds
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GachaRequest = await request.json();
    
    // バリデーション: 1-1000分の範囲チェック
    if (!body.minutes || typeof body.minutes !== 'number' || body.minutes < 1 || body.minutes > 1000) {
      return NextResponse.json(
        { error: '入力値は1〜1000分の範囲で指定してください' },
        { status: 400 }
      );
    }
    
    // 目標時間を秒に変換
    const targetSeconds = body.minutes * 60;
    
    // 動画データを読み込み
    const videos = loadVideos();
    
    // ガチャアルゴリズムを実行
    const result = generateGachaCombination(targetSeconds, videos);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Gacha API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}