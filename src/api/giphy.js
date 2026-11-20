import axios from "axios";

// Una instancia por backend (slide 28): base URL, timeout y api_key en un solo lugar
const giphy = axios.create({
  baseURL: "https://api.giphy.com/v1/gifs",
  timeout: 10000,
  params: { api_key: import.meta.env.VITE_GIPHY_API_KEY },
});

// Interceptor de respuesta (slide 30): unifica los mensajes de error
giphy.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status;
    error.message = status
      ? `Giphy error ${status}`
      : "Sin conexión o tiempo agotado";
    return Promise.reject(error);
  }
);

export async function searchGifs(query, { signal, limit = 25, offset = 0 } = {}) {
  const { data } = await giphy.get("/search", {
    params: { q: query, limit, offset, rating: "g", lang: "en" },
    signal,
  });
  return data.data;
}