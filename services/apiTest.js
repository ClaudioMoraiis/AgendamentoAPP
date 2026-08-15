import { API_BASE_URL } from "../constants/api";

// Teste simples de conectividade com a API
export const testApiConnection = async () => {
  try {
    console.log("🧪 Testando conectividade com a API...");
    
    // Teste 1: GET simples (não deve dar CORS)
    const response = await fetch(`${API_BASE_URL}/usuario/cadastrar`, {
      method: "HEAD", // Só headers, sem body
    });
    
    console.log("📊 Resultado do teste HEAD:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response.status;
  } catch (error) {
    console.error("❌ Erro no teste de conectividade:", error);
    return null;
  }
};

// Teste específico para CORS
export const testCORS = async () => {
  try {
    console.log("🌐 Testando CORS...");
    
    const response = await fetch(`${API_BASE_URL}/usuario/cadastrar`, {
      method: "OPTIONS",
      headers: {
        "Origin": "http://localhost:5175",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
      }
    });
    
    console.log("🔍 Resultado do teste OPTIONS:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("❌ Erro no teste CORS:", error);
    return false;
  }
};