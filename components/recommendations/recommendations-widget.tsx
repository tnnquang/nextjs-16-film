'use client';

import { useQuery } from '@tanstack/react-query';
import { MovieCard } from '@/components/movies/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export function RecommendationsWidget() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/recommendations?limit=10');
      if (!response.ok) return null;
      const data = await response.json();
      return data.data.recommendations;
    },
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Recommended for You
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3]" />
          ))}
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        Recommended for You
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendations.slice(0, 10).map((rec: any) => (
          <div key={rec.movieSlug} className="relative">
            <div className="text-xs text-muted-foreground mb-1">
              {Math.round(rec.recommendationScore * 100)}% match
            </div>
            {/* Movie card would go here - need to fetch movie data */}
            <div className="aspect-[2/3] bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}
