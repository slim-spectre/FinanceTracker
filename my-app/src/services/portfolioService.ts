const fetchUserPortfolio = async () => {
  // 1. Дістаємо збережений JWT токен
  const token = localStorage.getItem('token'); 

  const response = await fetch("/api/portfolio", {
    method: "GET",
    headers: {
      // 2. Передаємо токен у форматі Bearer
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    }
  });

  // 3. ЯКЩО сервер повернув 401, 403 або 500 — штучно викликаємо помилку
  if (!response.ok) {
    throw new Error(`Сервер повернув статус ${response.status}`);
  }

  // Якщо все ок (200), повертаємо чистий масив акцій
  return await response.json(); 
};

export default fetchUserPortfolio;