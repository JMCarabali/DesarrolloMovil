import { useEffect, useState } from "react";
import axios from "axios";
import { searchGifs } from "./api/giphy";
import "./App.css";

const LIMIT = 24;

function App() {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  // Búsqueda nueva (con debounce y cancelación)
  useEffect(() => {
    const term = query.trim();

    if (!term) {
      setGifs([]);
      setHasMore(false);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await searchGifs(term, {
          signal: controller.signal,
          limit: LIMIT,
          offset: 0,
        });
        setGifs(data);
        setHasMore(data.length === LIMIT);
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(err.message);
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Siguiente página: offset = cuántos GIFs ya tenemos
  async function handleLoadMore() {
    try {
      setLoadingMore(true);
      setError(null);
      const data = await searchGifs(query.trim(), {
        limit: LIMIT,
        offset: gifs.length,
      });
      setGifs((prev) => {
        const ids = new Set(prev.map((g) => g.id));
        return [...prev, ...data.filter((g) => !ids.has(g.id))];
      });
      setHasMore(data.length === LIMIT);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="app">
      <h1>Giphy Search</h1>

      <input
        type="search"
        placeholder="Busca un GIF... (ej: smile)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {loading && <p className="status">Cargando...</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && query.trim() && gifs.length === 0 && (
        <p className="status">Sin resultados</p>
      )}

      <section className="grid">
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_height.url}
            alt={gif.title}
            loading="lazy"
          />
        ))}
      </section>

      {hasMore && !loading && (
        <button className="more" onClick={handleLoadMore} disabled={loadingMore}>
          {loadingMore ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </main>
  );
}

export default App;