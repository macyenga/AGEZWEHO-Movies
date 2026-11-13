import { createContext, useContext, useState, useCallback } from 'react';
import TrailerModal from '../components/TrailerModal';

const TrailerContext = createContext({
  activeMovie: null,
  openTrailer: () => {},
  closeTrailer: () => {},
});

export function TrailerProvider({ children }) {
  const [activeMovie, setActiveMovie] = useState(null);

  const openTrailer = useCallback((movie) => {
    if (!movie) return;
    setActiveMovie(movie);
  }, []);

  const closeTrailer = useCallback(() => {
    setActiveMovie(null);
  }, []);

  return (
    <TrailerContext.Provider value={{ activeMovie, openTrailer, closeTrailer }}>
      {children}
      <TrailerModal movie={activeMovie} onClose={closeTrailer} />
    </TrailerContext.Provider>
  );
}

export function useTrailer() {
  return useContext(TrailerContext);
}
