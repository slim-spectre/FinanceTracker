import type { WatchlistCredentials } from "../types/WatchlistCredentials";
const API_URL = import.meta.env.VITE_API_URL || "";

export const fetchWatchlists = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/watchlist`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Server returned status ${response.status}`);
  const data = await response.json();
  return data.watchlist;
}

export const addWatchlist = async (credentials: WatchlistCredentials) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/watchlist/add`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) throw new Error(`Server returned status ${response.status}`);
  return await response.json();
}

export const deleteWatchlist = async (credentials: WatchlistCredentials) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/watchlist/remove`, {
    method: "DELETE",
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) throw new Error(`Server returned status ${response.status}`);
  return await response.json();
}