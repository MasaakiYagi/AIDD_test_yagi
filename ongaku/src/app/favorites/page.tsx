'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SongList } from '@/components/SongList';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Song {
  id: number;
  title: string;
  url: string;
  artist: {
    id: number;
    name: string;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (songId: number) => {
    try {
      const response = await fetch(`/api/favorites?songId=${songId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFavorites(favorites.filter(song => song.id !== songId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <main>
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Your Favorites</h1>
          {favorites.length === 0 ? (
            <p className="mt-4 text-gray-500">No favorite songs yet.</p>
          ) : (
            <SongList
              songs={favorites}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites.map(song => song.id)}
            />
          )}
        </div>
      </div>
    </main>
  );
} 