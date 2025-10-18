// Configuração base da API
const API_BASE_URL = "http://localhost:8080";

// Função auxiliar para fazer requisições
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Adiciona token de autorização se existir
  const token = localStorage.getItem("authToken");
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

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
    // Cadastro de usuário
    cadastrar: (userData) => {
      const payload = {
        nome: userData.name,
        email: userData.email,
        celular: userData.phone, // Mantém formatação como no backend
        cpf: userData.cpf.replace(/\D/g, ""), // Remove formatação do CPF
        senha: userData.password
      };
      
      return makeRequest("/usuario/cadastrar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    // Login
    login: (credentials) =>
      makeRequest("/usuario/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          senha: credentials.password,
        }),
      }),

    // Alterar senha
    alterarSenha: (senhaData) =>
      makeRequest("/usuario/alterar-senha", {
        method: "PUT",
        body: JSON.stringify(senhaData),
      }),

    // Recuperar senha
    recuperarSenha: (email) =>
      makeRequest("/usuario/recuperar-senha", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    // Listar todos os usuários (admin)
    listar: () => makeRequest("/usuario"),

    // Deletar usuário (admin)
    deletar: (id) =>
      makeRequest(`/usuario/${id}`, {
        method: "DELETE",
      }),
  },

  // Agendamentos
  agendamentos: {
    // Criar agendamento
    criar: (agendamentoData) =>
      makeRequest("/agendamentos", {
        method: "POST",
        body: JSON.stringify(agendamentoData),
      }),

    // Listar agendamentos do usuário
    meus: () => makeRequest("/agendamentos/meus"),

    // Listar todos os agendamentos (admin)
    listar: () => makeRequest("/agendamentos"),

    // Buscar agendamento por ID
    buscarPorId: (id) => makeRequest(`/agendamentos/${id}`),

    // Atualizar agendamento
    atualizar: (id, agendamentoData) =>
      makeRequest(`/agendamentos/${id}`, {
        method: "PUT",
        body: JSON.stringify(agendamentoData),
      }),

    // Cancelar agendamento
    cancelar: (id) =>
      makeRequest(`/agendamentos/${id}/cancelar`, {
        method: "PUT",
      }),

    // Deletar agendamento (admin)
    deletar: (id) =>
      makeRequest(`/agendamentos/${id}`, {
        method: "DELETE",
      }),
  },

  // Serviços
  servicos: {
    // Listar serviços
    listar: () => makeRequest("/servicos"),

    // Criar serviço (admin)
    criar: (servicoData) =>
      makeRequest("/servicos", {
        method: "POST",
        body: JSON.stringify(servicoData),
      }),

    // Atualizar serviço (admin)
    atualizar: (id, servicoData) =>
      makeRequest(`/servicos/${id}`, {
        method: "PUT",
        body: JSON.stringify(servicoData),
      }),

    // Deletar serviço (admin)
    deletar: (id) =>
      makeRequest(`/servicos/${id}`, {
        method: "DELETE",
      }),
  },

  // Profissionais
  profissionais: {
    // Listar profissionais
    listar: () => makeRequest("/profissionais"),

    // Criar profissional (admin)
    criar: (profissionalData) =>
      makeRequest("/profissionais", {
        method: "POST",
        body: JSON.stringify(profissionalData),
      }),

    // Atualizar profissional (admin)
    atualizar: (id, profissionalData) =>
      makeRequest(`/profissionais/${id}`, {
        method: "PUT",
        body: JSON.stringify(profissionalData),
      }),

    // Deletar profissional (admin)
    deletar: (id) =>
      makeRequest(`/profissionais/${id}`, {
        method: "DELETE",
      }),
  },

  // Dashboard/Estatísticas (admin)
  dashboard: {
    // Estatísticas gerais
    estatisticas: () => makeRequest("/dashboard/estatisticas"),

    // Agendamentos por período
    agendamentosPorPeriodo: (periodo) =>
      makeRequest(`/dashboard/agendamentos-periodo?periodo=${periodo}`),

    // Serviços mais populares
    servicosPopulares: () => makeRequest("/dashboard/servicos-populares"),

    // Receita por período
    receita: (periodo) =>
      makeRequest(`/dashboard/receita?periodo=${periodo}`),
  },
};

export default apiService;