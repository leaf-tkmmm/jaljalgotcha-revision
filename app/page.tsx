"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Shuffle } from "lucide-react"
import { Video } from "@/models/video"
import { GachaResponse } from "@/models/gacha"



export default function JarujaruGacha() {
  const [duration, setDuration] = useState("")
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([])
  const [isGachaMode, setIsGachaMode] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleGacha = async () => {
    const targetMinutes = Number.parseInt(duration)
    if (!targetMinutes || targetMinutes < 1 || targetMinutes > 1000) {
      alert('1〜1000分の範囲で入力してください')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minutes: targetMinutes }),
      })

      if (!response.ok) {
        throw new Error('ガチャAPIエラー')
      }

      const result: GachaResponse = await response.json()
      
      setSelectedVideos(result.videos)
      setTotalDuration(Math.round(result.totalDuration / 60 * 100) / 100) // 秒を分に変換して小数点2桁
      setRemainingSeconds(result.remainingSeconds)
      setIsGachaMode(true)
    } catch (error) {
      console.error('ガチャエラー:', error)
      alert('ガチャに失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const resetGacha = () => {
    setIsGachaMode(false)
    setSelectedVideos([])
    setDuration("")
    setTotalDuration(0)
    setRemainingSeconds(0)
  }

  if (!isGachaMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Shuffle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ジャルジャルのガチャするやつ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">何分耐久しますか？</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="分単位で入力"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="text-center text-lg py-6 border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                    min="1"
                    max="1000"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <Button
                  onClick={handleGacha}
                  disabled={!duration || Number.parseInt(duration) < 1 || Number.parseInt(duration) > 1000 || isLoading}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  {isLoading ? "ガチャ中..." : "ガチャる"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ジャルジャルのガチャするやつ
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              目標: {duration}分
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              実際: {totalDuration}分
            </Badge>
            {remainingSeconds > 0 && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                残り: {Math.round(remainingSeconds / 60 * 100) / 100}分
              </Badge>
            )}
            <Badge variant="default" className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500">
              {selectedVideos.length}本選出
            </Badge>
          </div>
          <Button
            onClick={resetGacha}
            variant="outline"
            className="mb-6 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            もう一度ガチャる
          </Button>
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左サイドバー（広告エリア） */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 border-dashed border-2 border-gray-300">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold mb-2">広告</div>
                  <div className="text-sm">Advertisement</div>
                </div>
              </CardContent>
            </Card>
            <Card className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 border-dashed border-2 border-gray-300">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold mb-2">広告</div>
                  <div className="text-sm">Advertisement</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 動画グリッド */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedVideos.map((video) => (
                <Card
                  key={video.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm"
                  onClick={() => window.open(video.url, '_blank')}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300 rounded-t-lg flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-6 h-6 text-purple-600 ml-1" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                        {video.title}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 右サイドバー（広告エリア） */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 border-dashed border-2 border-gray-300">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold mb-2">広告</div>
                  <div className="text-sm">Advertisement</div>
                </div>
              </CardContent>
            </Card>
            <Card className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 border-dashed border-2 border-gray-300">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-semibold mb-2">広告</div>
                  <div className="text-sm">Advertisement</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
