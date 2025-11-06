// Configuração base da API
const API_BASE_URL = "http://localhost:8080";

// Função para requisições que não precisam de autenticação (login, cadastro)
const makePublicRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Verifica o Content-Type da resposta
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Tenta extrair mensagem de erro
      let errorMessage = `Erro HTTP: ${response.status}`;
      
      if (typeof data === 'object' && data.message) {
        errorMessage += ` - ${data.message}`;
      } else if (typeof data === 'string') {
        errorMessage += ` - ${data}`;
      }
      
      console.log('📝 Mensagem de erro processada:', errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição para', endpoint + ':', error);
    throw error;
  }
};

// Função para requisições que precisam de autenticação (todas as outras)
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Sempre adiciona o token JWT para requisições autenticadas
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Token de autenticação não encontrado. Faça login novamente.");
  }
  
  defaultOptions.headers.Authorization = `Bearer ${token}`;

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Verifica o Content-Type da resposta
    const contentType = response.headers.get("content-type");
    let data;

    // Se a resposta contém JSON, faz parse como JSON
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Senão, trata como texto
      data = await response.text();
    }

    if (!response.ok) {
      // Trata mensagens de erro específicas do backend
      let errorMessage = `Erro HTTP: ${response.status}`;
      
      if (typeof data === 'object' && data) {
        // Diferentes possibilidades de estrutura de erro
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.details) {
          errorMessage = data.details;
        } else if (data.body) {
          errorMessage = data.body;
        } else if (data.description) {
          errorMessage = data.description;
        } else if (data.status && data.message) {
          // Estrutura ApiResponseUtil: {status: "Erro", message: "..."}
          errorMessage = data.message;
        } else if (data.status && typeof data.status === 'string' && data.status !== 'success') {
          // Se status é uma string de erro
          errorMessage = data.status;
        } else if (data["Erro"]) {
          // Estrutura específica do seu backend: {"Erro": "mensagem"}
          errorMessage = data["Erro"];
        } else if (data["Error"]) {
          // Possível variação em inglês: {"Error": "mensagem"}
          errorMessage = data["Error"];
        } else {
          // Se nenhum campo conhecido, tenta pegar o primeiro valor string
          const values = Object.values(data);
          const firstStringValue = values.find(v => typeof v === 'string' && v.trim());
          if (firstStringValue) {
            errorMessage = firstStringValue;
          }
        }
      } else if (typeof data === 'string' && data.trim()) {
        // Se retornou texto simples
        errorMessage = data;
      }
      
      console.log("📝 Mensagem de erro processada:", errorMessage);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// Serviços da API
export const apiService = {
  // Usuários
  usuarios: {
    // Cadastro de usuário (público - não precisa de token)
    cadastrar: (userData) => {
      const payload = {
        nome: userData.name,
        email: userData.email,
        celular: userData.phone, // Mantém formatação como no backend
        cpf: userData.cpf.replace(/\D/g, ""), // Remove formatação do CPF
        senha: userData.password
      };
      
      return makePublicRequest("/usuario/cadastrar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    // Login (público - não precisa de token)
    login: (credentials) => {
      const params = new URLSearchParams({
        email: credentials.email,
        senha: credentials.senha
      });
      return makePublicRequest(`/usuario/login?${params.toString()}`, {
        method: "POST"
      });
    },

    // Alterar senha (requer token)
    alterarSenha: (senhaData) =>
      makeAuthenticatedRequest("/usuario/alterar-senha", {
        method: "PUT",
        body: JSON.stringify(senhaData),
      }),

    // Recuperar senha (público - não precisa de token)
    recuperarSenha: (email) => {
      const params = new URLSearchParams({
        email: email
      });
      return makePublicRequest(`/usuario/recuperar-senha?${params.toString()}`, {
        method: "POST"
      });
    },

    // Redefinir senha com token (público - não precisa de token de autenticação)
    redefinirSenha: (token, novaSenha, confirmarSenha) =>
      makePublicRequest("/usuario/redefinir-senha", {
        method: "PUT",
        body: JSON.stringify({ 
          token: token,
          senha: novaSenha,
          confirmarSenha: confirmarSenha
        }),
      }),

    // Listar todos os usuários (admin - requer token)
    listar: () => makeAuthenticatedRequest("/usuario"),

    // Deletar usuário (admin)
    deletar: (id) =>
      makeAuthenticatedRequest(`/usuario/${id}`, {
        method: "DELETE",
      }),
  },

  // Agendamentos
  agendamentos: {
    // Criar agendamento
    criar: (agendamentoData) =>
      makeAuthenticatedRequest("/agendamentos", {
        method: "POST",
        body: JSON.stringify(agendamentoData),
      }),

    // Listar agendamentos do usuário
    meus: () => makeAuthenticatedRequest("/agendamentos/meus"),

    // Listar todos os agendamentos (admin)
    listar: () => makeAuthenticatedRequest("/agendamentos"),

    // Buscar agendamento por ID
    buscarPorId: (id) => makeAuthenticatedRequest(`/agendamentos/${id}`),

    // Atualizar agendamento
    atualizar: (id, agendamentoData) =>
      makeAuthenticatedRequest(`/agendamentos/${id}`, {
        method: "PUT",
        body: JSON.stringify(agendamentoData),
      }),

    // Cancelar agendamento
    cancelar: (id) =>
      makeAuthenticatedRequest(`/agendamentos/${id}/cancelar`, {
        method: "PUT",
      }),

    // Deletar agendamento (admin)
    deletar: (id) =>
      makeAuthenticatedRequest(`/agendamentos/${id}`, {
        method: "DELETE",
      }),
  },

  // Serviços
  servicos: {
    // Listar serviços
    listar: () => makeAuthenticatedRequest("/servico/listar"),

    // Criar serviço (admin)
    criar: (servicoData) =>
      makeAuthenticatedRequest("/servico/cadastrar", {
        method: "POST",
        body: JSON.stringify(servicoData),
      }),

    // Atualizar serviço (admin)
    atualizar: (id, servicoData) =>
      makeAuthenticatedRequest(`/servico/${id}`, {
        method: "PUT",
        body: JSON.stringify(servicoData),
      }),

    // Deletar serviço (admin)
    deletar: (id) =>
      makeAuthenticatedRequest(`/servico/${id}`, {
        method: "DELETE",
      }),
  },

  // Profissionais
  profissionais: {
    // Listar profissionais
    listar: () => makeAuthenticatedRequest("/profissionais"),

    // Criar profissional (admin)
    criar: (profissionalData) =>
      makeAuthenticatedRequest("/profissionais", {
        method: "POST",
        body: JSON.stringify(profissionalData),
      }),

    // Atualizar profissional (admin)
    atualizar: (id, profissionalData) =>
      makeAuthenticatedRequest(`/profissionais/${id}`, {
        method: "PUT",
        body: JSON.stringify(profissionalData),
      }),

    // Deletar profissional (admin)
    deletar: (id) =>
      makeAuthenticatedRequest(`/profissionais/${id}`, {
        method: "DELETE",
      }),
  },

  // Dashboard/Estatísticas (admin)
  dashboard: {
    // Estatísticas gerais
    estatisticas: () => makeAuthenticatedRequest("/dashboard/estatisticas"),

    // Agendamentos por período
    agendamentosPorPeriodo: (periodo) =>
      makeAuthenticatedRequest(`/dashboard/agendamentos-periodo?periodo=${periodo}`),

    // Serviços mais populares
    servicosPopulares: () => makeAuthenticatedRequest("/dashboard/servicos-populares"),

    // Receita por período
    receita: (periodo) =>
      makeAuthenticatedRequest(`/dashboard/receita?periodo=${periodo}`),
  },
};

export default apiService;
