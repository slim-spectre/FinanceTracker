import { type Transaction } from "../types/Transaction";
const API_URL = import.meta.env.VITE_API_URL || "";

export const fetchTransactions = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/transactions`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error(`Http Error! Status code: ${response.status}`);
  const data = await response.json() as { transactions: Transaction[] };
  return data;
}