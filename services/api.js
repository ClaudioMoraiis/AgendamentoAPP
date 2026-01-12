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
      
      if (typeof data === 'object') {
        // Verifica se tem campo "Erro" (formato do backend)
        if (data.Erro) {
          errorMessage = data.Erro;
        } else if (data.message) {
          errorMessage += ` - ${data.message}`;
        } else {
          errorMessage += ` - ${JSON.stringify(data)}`;
        }
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
  
  console.log('🔑 Token sendo enviado:', token.substring(0, 20) + '...');
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

    // Atualizar status online/offline
    atualizarStatusOnline: async (userId, isOnline) => {
      console.log(`🟢 API - Atualizar status online do usuário ${userId}: ${isOnline}`);
      try {
        const resultado = await makeAuthenticatedRequest(`/usuario/online/${userId}?mOnline=${isOnline}`, {
          method: "PATCH"
        });
        console.log(`✅ Status atualizado com sucesso para ${userId}:`, resultado);
        return resultado;
      } catch (error) {
        console.error(`❌ Erro ao atualizar status para ${userId}:`, error);
        throw error;
      }
    },

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
    listar: async () => {
      const resultado = await makeAuthenticatedRequest("/usuario/listar");
      console.log('📋 DEBUG API - Resposta completa de /usuario/listar:', JSON.stringify(resultado, null, 2));
      return resultado;
    },

    // Alterar usuário (admin - requer token)
    alterar: (id, userData) => {
      console.log('🔄 API alterar - ID:', id, 'Dados:', userData);
      return makeAuthenticatedRequest(`/usuario/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: userData.nome,
          email: userData.email,
          celular: userData.telefone, // Componente usa 'telefone', API usa 'celular'
          cpf: userData.cpf
        }),
      });
    },

    // Deletar usuário (admin)
    deletar: (id) => {
      console.log('🗑️ API deletar - ID:', id);
      return makeAuthenticatedRequest(`/usuario/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Agendamentos
  agendamentos: {
    // Criar agendamento
    criar: (agendamentoData) =>
      makeAuthenticatedRequest("/agendamentos", {
        method: "POST",
        body: JSON.stringify(agendamentoData),
      }),
    // Registrar agendamento via rota alternativa usada pelo admin
    // This helper returns an object { status, data } (does not throw on HTTP error)
    registrar: async (agendamentoData) => {
      const url = `${API_BASE_URL}/agendamento/register`;
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");

      console.log('🔑 Token sendo enviado:', token.substring(0, 20) + '...');

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(agendamentoData),
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Do not throw here; return status + data so caller can decide how to handle 2xx/202/4xx
        return { status: response.status, data };
      } catch (error) {
        console.error('Erro na requisição para /agendamento/register:', error);
        throw error;
      }
    },

    // Listar agendamentos do usuário
    meus: () => makeAuthenticatedRequest("/agendamentos/meus"),

    // Listar todos os agendamentos (admin)
    listar: () => makeAuthenticatedRequest("/agendamento/listar"),

    // Buscar agendamento por ID
    buscarPorId: (id) => makeAuthenticatedRequest(`/agendamentos/${id}`),

    // Atualizar agendamento
    atualizar: async (id, agendamentoData) => {
      const url = `${API_BASE_URL}/agendamento/${id}`;
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Token de autenticação não encontrado. Faça login novamente.");

      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(agendamentoData),
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return { status: response.status, data };
      } catch (error) {
        console.error('Erro na requisição de atualizar agendamento:', error);
        throw error;
      }
    },

    // Cancelar agendamento
    cancelar: (id) =>
      makeAuthenticatedRequest(`/agendamentos/${id}/cancelar`, {
        method: "PUT",
      }),

    // Deletar agendamento (admin)
    deletar: (id) =>
      makeAuthenticatedRequest(`/agendamento/${id}`, {
        method: "DELETE",
      }),

    // Buscar horários disponíveis
    horariosDisponiveis: (profissionalId, servicoId, data) => {
      const params = new URLSearchParams({
        profissionalId: String(profissionalId),
        servicoId: String(servicoId),
        data: data
      });
      return makeAuthenticatedRequest(`/agendamento/horarios-disponiveis?${params.toString()}`);
    },

    // Cadastrar agendamento (cliente)
    cadastrar: (agendamentoData) =>
      makeAuthenticatedRequest("/agendamento/register", {
        method: "POST",
        body: JSON.stringify(agendamentoData),
      }),

    // Listar agendamentos por cliente
    listarPorCliente: (usuarioId) =>
      makeAuthenticatedRequest(`/agendamento/list/${usuarioId}`),

    // Cancelar agendamento por ID
    cancelar: (id) =>
      makeAuthenticatedRequest(`/agendamento/cancel/${id}`, {
        method: "PUT",
      }),
  },

  // Serviços
  servicos: {
    // Listar serviços
    listar: () => makeAuthenticatedRequest("/servico/listar"),

    // Buscar ID do serviço por nome e preço (ex: /servico/id?name=BARBA&price=35)
    buscarIdPorNomePreco: (name, price) => {
      const params = new URLSearchParams({ name: name, price: String(price) });
      return makeAuthenticatedRequest(`/servico/id?${params.toString()}`);
    },

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
    // Listar profissionais (admin - requer token)
    listar: () => makeAuthenticatedRequest("/profissional/listar"),
    // Buscar profissional por código/nome (ex: /profissional/claudio1)
    buscarPorCodigo: (codigo) => makeAuthenticatedRequest(`/profissional/${encodeURIComponent(codigo)}`),

    // Criar profissional (admin - requer token)
    // Endpoint solicitado: POST /profissional/cadastrar
    criar: (profissionalData) => {
      const ativoFlag = profissionalData.status === 'ativo' || profissionalData.ativo === true;
      const payload = {
        nome: profissionalData.nome,
        telefone: profissionalData.telefone,
        especialidade: profissionalData.especialidade,
        email: profissionalData.email,
        // include boolean 'ativo' as requested by backend integration
        ativo: !!ativoFlag
      };
      console.log('🔄 API profissional cadastrar - Payload:', payload);
      return makeAuthenticatedRequest("/profissional/cadastrar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    // Atualizar profissional (admin)
    atualizar: (id, profissionalData) => {
      const ativoFlag = profissionalData.status === 'ativo' || profissionalData.ativo === true;
      const payload = {
        nome: profissionalData.nome,
        telefone: profissionalData.telefone,
        especialidade: profissionalData.especialidade,
        email: profissionalData.email,
        ativo: !!ativoFlag
      };
      console.log('🔄 API profissional atualizar - ID:', id, 'Payload:', payload);
      return makeAuthenticatedRequest(`/profissional/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    // Deletar profissional (admin)
    deletar: (id) =>
      makeAuthenticatedRequest(`/profissional/${id}`, {
        method: "DELETE",
      }),
  },

  // Especialidades
  especialidades: {
    // Listar especialidades (admin - requer token)
    listar: () => makeAuthenticatedRequest("/especialidade/listar"),

    // Criar especialidade (admin - requer token)
    criar: (especialidadeData) => {
      console.log('➕ API especialidade cadastrar - Payload:', especialidadeData);
      return makeAuthenticatedRequest("/especialidade/cadastrar", {
        method: "POST",
        body: JSON.stringify(especialidadeData),
      });
    },

    // Atualizar especialidade (admin)
    atualizar: (id, especialidadeData) => {
      console.log('🔄 API especialidade atualizar - ID:', id, 'Payload:', especialidadeData);
      return makeAuthenticatedRequest(`/especialidade/${id}`, {
        method: "PUT",
        body: JSON.stringify(especialidadeData),
      });
    },

    // Deletar especialidade (admin)
    deletar: (id) => {
      console.log('🗑️ API especialidade deletar - ID:', id);
      return makeAuthenticatedRequest(`/especialidade/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Horários de Profissionais
  horarios: {
    // Listar horários (admin - requer token)
    listar: () => makeAuthenticatedRequest("/profissional-horario/list"),

    // Criar horário (admin - requer token)
    criar: (horarioData) => {
      console.log('➕ API horário cadastrar - Payload:', horarioData);
      return makeAuthenticatedRequest("/profissional-horario/register", {
        method: "POST",
        body: JSON.stringify(horarioData),
      });
    },

    // Atualizar horário (admin)
    atualizar: (id, horarioData) => {
      console.log('🔄 API horário atualizar - ID:', id, 'Payload:', horarioData);
      return makeAuthenticatedRequest(`/profissional-horario/${id}`, {
        method: "PUT",
        body: JSON.stringify(horarioData),
      });
    },

    // Deletar horário (admin)
    deletar: (id) => {
      console.log('🗑️ API horário deletar - ID:', id);
      return makeAuthenticatedRequest(`/profissional-horario/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Usuário/Autenticação
  usuario: {
    /**
     * Busca dados do usuário atual (logado) a partir do token
     * Retorna informações incluindo se é admin
     * @returns {Promise} - Retorna objeto do usuário
     */
    me: () => {
      console.log('👤 API Usuario - Buscar dados do usuário atual');
      return makeAuthenticatedRequest('/api/usuario/me');
    },

    /**
     * Busca o role (tipo) do usuário pelo ID
     * @param {number} userId - ID do usuário
     * @returns {Promise} - Retorna o role do usuário (ADMIN, CLIENTE, etc)
     */
    getRole: (userId) => {
      console.log(`🎭 API Usuario - Buscar role do usuário ID: ${userId}`);
      return makeAuthenticatedRequest(`/usuario/role/${userId}`);
    },
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

  // Chat/Mensagens
  chat: {
    /**
     * Lista mensagens de uma conversa com paginação
     * @param {number} clienteId - ID do cliente
     * @param {number} usuarioId - ID do usuário logado
     * @param {number} page - Número da página (padrão: 0)
     * @param {number} size - Tamanho da página (padrão: 20)
     * @returns {Promise} - Retorna objeto com mensagens paginadas
     */
    listarMensagens: (clienteId, usuarioId, page = 0, size = 20) => {
      console.log(`📬 API Chat - Listar mensagens do cliente ${clienteId} (usuário ${usuarioId}, página ${page}, tamanho ${size})`);
      return makeAuthenticatedRequest(
        `/mensagem/mensagens?mClienteId=${clienteId}&mUsuarioId=${usuarioId}&mPage=${page}&mSize=${size}`
      );
    },

    /**
     * Cria/envia uma nova mensagem
     * @param {Object} mensagemData - Dados da mensagem
     * @param {string} mensagemData.conteudo - Conteúdo da mensagem
     * @param {number} mensagemData.remetenteId - ID do remetente
     * @param {number} mensagemData.destinatarioId - ID do destinatário
     * @returns {Promise}
     */
    enviarMensagem: (mensagemData) => {
      console.log('📤 API Chat - Enviar mensagem:', mensagemData);
      return makeAuthenticatedRequest('/mensagem/cadastrar', {
        method: 'POST',
        body: JSON.stringify(mensagemData),
      });
    },

    /**
     * Marca uma mensagem específica como lida
     * @param {number} mensagemId - ID da mensagem
     * @param {number} idUsuarioDestino - ID do usuário destinatário
     * @returns {Promise}
     */
    marcarComoLida: (mensagemId, idUsuarioDestino) => {
      console.log(`✅ API Chat - Marcar mensagem ${mensagemId} como lida para usuário ${idUsuarioDestino}`);
      return makeAuthenticatedRequest(
        `/mensagem/${mensagemId}/${idUsuarioDestino}/lida`,
        { method: 'PATCH' }
      );
    },

    /**
     * Marca várias mensagens de um cliente como lidas
     * @param {number} idCliente - ID do cliente
     * @returns {Promise}
     */
    marcarVariasComoLidas: (idCliente) => {
      console.log(`✅ API Chat - Marcar todas mensagens do cliente ${idCliente} como lidas`);
      return makeAuthenticatedRequest(
        `/mensagem/lidas?idCliente=${idCliente}`,
        { method: 'PUT' }
      );
    },

    /**
     * Deleta uma mensagem específica
     * @param {number} mensagemId - ID da mensagem
     * @param {number} userId - ID do usuário logado
     * @returns {Promise}
     */
    deletarMensagem: (mensagemId, userId) => {
      console.log(`🗑️ API Chat - Deletar mensagem ${mensagemId} (usuário ${userId})`);
      return makeAuthenticatedRequest(
        `/mensagem/${mensagemId}/${userId}`,
        { method: 'DELETE' }
      );
    },

    /**
     * Deletar todas as mensagens de uma conversa (cliente)
     * @param {number} idCliente - ID do cliente
     * @param {number} userId - ID do usuário logado
     * @returns {Promise}
     */
    deletarVariasMensagens: (idCliente, userId) => {
      console.log(`🗑️ API Chat - Deletar todas mensagens do cliente ${idCliente} (usuário ${userId})`);
      return makeAuthenticatedRequest(
        `/mensagem/deletarVarias/${idCliente}/${userId}`,
        { method: 'DELETE' }
      );
    },

    /**
     * Conta total de mensagens não lidas
     * @returns {Promise<{total: number}>}
     */
    contarNaoLidas: () => {
      console.log('📊 API Chat - Contar mensagens não lidas');
      return makeAuthenticatedRequest('/mensagem/nao-lidas/count');
    },
  },
};

export default apiService;
