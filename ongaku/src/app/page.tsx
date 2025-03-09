'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { SongList } from '@/components/SongList';

interface Song {
  id: number;
  title: string;
  url: string;
  artist: {
    id: number;
    name: string;
  };
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
    fetchFavorites();
  }, []);

  const fetchSongs = async (query?: string) => {
    try {
      const url = query ? `/api/songs?q=${encodeURIComponent(query)}` : '/api/songs';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.map((song: Song) => song.id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleSearch = (query: string) => {
    setIsLoading(true);
    fetchSongs(query);
  };

  const handleToggleFavorite = async (songId: number) => {
    try {
      if (favorites.includes(songId)) {
        const response = await fetch(`/api/favorites?songId=${songId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setFavorites(favorites.filter(id => id !== songId));
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songId }),
        });
        if (response.ok) {
          setFavorites([...favorites, songId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <main>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Music Stream
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Discover and listen to your favorite music.
          </p>
          <div className="mt-8">
            <SearchBar onSearch={handleSearch} />
          </div>
          {isLoading ? (
            <p className="mt-8">Loading...</p>
          ) : (
            <SongList
              songs={songs}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
            />
          )}
        </div>
      </div>
    </main>
  );
}
