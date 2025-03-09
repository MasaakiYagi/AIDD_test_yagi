'use client';

import { useState } from 'react';
import { PlayIcon, PauseIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

interface Song {
  id: number;
  title: string;
  url: string;
  artist: {
    id: number;
    name: string;
  };
}

interface SongListProps {
  songs: Song[];
  onToggleFavorite: (songId: number) => void;
  favorites: number[];
}

export function SongList({ songs, onToggleFavorite, favorites }: SongListProps) {
  const { data: session } = useSession();
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePlayPause = (song: Song) => {
    if (playingSongId === song.id) {
      audio?.pause();
      setPlayingSongId(null);
      setAudio(null);
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.url);
      newAudio.play();
      setPlayingSongId(song.id);
      setAudio(newAudio);
    }
  };

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {songs.map((song) => (
          <div
            key={song.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
              <button
                onClick={() => handlePlayPause(song)}
                className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:scale-105 transition-transform duration-200"
              >
                {playingSongId === song.id ? (
                  <PauseIcon className="h-8 w-8 text-indigo-600" />
                ) : (
                  <PlayIcon className="h-8 w-8 text-indigo-600" />
                )}
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {song.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {song.artist.name}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {playingSongId === song.id ? 'Now Playing' : 'Click to play'}
                </div>
                <button
                  onClick={() => onToggleFavorite(song.id)}
                  className="flex-none"
                >
                  {favorites.includes(song.id) ? (
                    <HeartSolidIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 