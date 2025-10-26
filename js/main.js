// ===============================
// SPA + Templates + Validação + Armazenamento Local + Modal + Newsletter
// ===============================

// ---- Sistema de Rotas (SPA) ----
const Router = {
  routes: {},
  rootEl: null,
  init(rootSelector = '#app') {
    // Busca o elemento principal
    this.rootEl = document.querySelector(rootSelector) || document.querySelector('main') || document.body;
    
    // Configuração do Router e Listeners
    window.addEventListener('popstate', () => this.load(location.pathname));
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-link]');
      if (a) {
        e.preventDefault();
        this.navigate(a.getAttribute('href'));
      }
    });
    // Carrega a rota inicial
    this.load(location.pathname); 
  },
  add(path, handler) {
    this.routes[path] = handler;
  },
  navigate(path) {
    history.pushState({}, '', path);
    this.load(path);
  },
  load(path) {
    // Tratamento para URLs completas ou sem .html (para SPA)
    let cleanPath = path.endsWith('.html') ? '/' + path.split('/').pop().replace('.html', '') : path;
    if (cleanPath === '/index' || cleanPath === '') cleanPath = '/';
    
    const handler = this.routes[cleanPath] || this.routes['/404'] || this.routes['/'];
    if (typeof handler === 'function') {
      handler(this.rootEl);
    } else {
      this.rootEl.innerHTML = '<p>Rota inválida</p>';
    }
  }
};

// ---- Armazenamento Local ----
const Storage = {
  prefix: 'ong_literatura_',
  save(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  },
  load(key) {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : null;
  },
  pushToArray(key, item) {
    const arr = this.load(key) || [];
    arr.push(item);
    this.save(key, arr);
  }
};

// ---- Sistema de Validação (WCAG 2.1 Acessível) ----
const Validation = {
  patterns: {
    email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/,
    telefone: /^\(\d{2}\)\s\d{4,5}\-\d{4}$/,
    cep: /^\d{5}\-\d{3}$/
  },

  showError(input, msg) {
    input.classList.add('error-field');
    input.setAttribute('aria-invalid', 'true'); // WCAG: Indica o estado de erro
    
    const errorId = input.getAttribute('aria-describedby');
    let err = errorId ? document.getElementById(errorId) : null;
    
    if (err && err.classList.contains('field-error')) {
        err.textContent = msg; 
    } else {
      // Fallback para elementos não atualizados no HTML
      err = input.nextElementSibling;
      if (!err || !err.classList.contains('field-error')) {
        err = document.createElement('div');
        err.className = 'field-error';
        input.parentNode.insertBefore(err, input.nextSibling);
      }
      err.textContent = msg;
    }
  },
  
  clearError(input) {
    input.classList.remove('error-field');
    input.removeAttribute('aria-invalid'); 
    
    // Limpa o span de erro dedicado
    const errorId = input.getAttribute('aria-describedby');
    const err = errorId ? document.getElementById(errorId) : null;
    if (err && err.classList.contains('field-error')) {
        err.textContent = '';
    }
    
    // Limpa o elemento de erro criado via fallback
    const nextErr = input.nextElementSibling;
    if (nextErr && nextErr.classList.contains('field-error')) nextErr.textContent = '';
  },

  validateField(input) {
    this.clearError(input);
    const value = input.value.trim();
    const name = input.name;
    const isRequired = input.hasAttribute('required');

    if (isRequired && !value) {
      this.showError(input, 'Este campo é obrigatório.');
      return false;
    }
    
    if (value && this.patterns[name] && !this.patterns[name].test(value)) {
      this.showError(input, `Formato inválido.`);
      return false;
    }

    return true;
  },

  validateForm(form) {
    let isValid = true;
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
        // Mover o foco para o primeiro campo com erro
        if (!isValid && !document.activeElement.classList.contains('error-field')) {
          input.focus();
        }
      }
    });
    return isValid;
  }
};

// ---- Utilidades UI (Acessibilidade Modal) ----

let lastFocusedElement = null;

function openModalSucesso(form) {
    const modal = document.getElementById('modal-sucesso');
    const closeButton = document.getElementById('fechar-modal');
    
    if (modal) {
        lastFocusedElement = document.activeElement; // Salva o elemento que ativou o modal

        modal.style.display = 'flex'; // Usar flex para centralizar
        modal.setAttribute('aria-hidden', 'false');
        
        // Mover o foco para o elemento dentro do modal
        if (closeButton) {
            closeButton.focus();
        } else {
            modal.focus(); // Fallback
        }
        
        // Adicionar o listener para fechar o modal
        closeButton?.addEventListener('click', () => {
            closeModalSucesso();
        }, { once: true });

        // Adicionar o listener para fechar com ESC
        document.addEventListener('keydown', handleEscapeKey);
    }
}

function closeModalSucesso() {
    const modal = document.getElementById('modal-sucesso');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', handleEscapeKey);

        // Retorna o foco para o elemento que o ativou
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeModalSucesso();
    }
}


function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastEl = document.createElement('div');
  toastEl.className = `toast ${type}`;
  toastEl.textContent = msg;
  toastEl.setAttribute('role', 'status'); 
  toastEl.setAttribute('aria-live', 'polite'); 

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.remove();
  }, 5000);
}

// ---- Templates (Mantidos simples, focando na funcionalidade) ----
const Templates = {
  home: (rootEl) => {
    // Aqui deveria ser o HTML completo do index.html (SPA).
    rootEl.innerHTML = `
      <h1>Página Inicial (Simulado SPA)</h1>
      <p>Navegue pelas rotas. O formulário abaixo é de exemplo.</p>
      <section id="voluntarios">
        <h2>Cadastro Rápido</h2>
        <form id="formVoluntario" class="card">
          <label for="nomeVol">Nome:</label><input type="text" id="nomeVol" name="nome" required>
          <label for="emailVol">Email:</label><input type="email" id="emailVol" name="email" required>
          <button type="submit" class="button">Cadastrar</button>
        </form>
      </section>
    `;
    
    const formVoluntario = document.getElementById('formVoluntario');
    if (formVoluntario) {
        formVoluntario.addEventListener('submit', ev => {
            ev.preventDefault();
            if (!Validation.validateForm(formVoluntario)) {
                toast('Preencha corretamente os campos obrigatórios.', 'error');
                return;
            }
            toast('Cadastro rápido concluído com sucesso!', 'success');
            formVoluntario.reset();
        });
    }

  },
  
  projetos: (rootEl) => {
    // Aqui deveria ser o HTML completo do projetos.html (SPA).
    rootEl.innerHTML = `
      <h1>Projetos Ativos (Simulado SPA)</h1>
      <article><h3>Leitura para Todos</h3></article>
      <article><h3>Clube do Livro</h3></article>
    `;
  },
  
  // O Template de cadastro que deve ser carregado pelo SPA
  cadastro: (rootEl) => {
    // O template de cadastro (cadastro.html) não é injetado, ele é uma página dedicada.
    // Se o projeto for SPA, o conteúdo do cadastro.html deve ser injetado aqui.
    rootEl.innerHTML = `
      <section id="cadastro-spa">
          <h2>Seja Voluntário / Cadastre-se</h2>
          <p>Esta seção deveria ter o formulário completo do cadastro.html se o projeto fosse 100% SPA. Mantemos o código estático para o HTML original.</p>
      </section>
    `;
  }
};


// ---- Inicialização SPA e Listeners de Acessibilidade (Troca de Tema) ----
document.addEventListener('DOMContentLoaded', () => {
  // Inicialização SPA (Desativada se o projeto usar páginas HTML separadas)
  // Router.init('#app'); 
  // Router.add('/', Templates.home);
  // Router.add('/projetos', Templates.projetos);
  // Router.add('/cadastro', Templates.cadastro);
  
  // Acessibilidade: Listeners para troca de tema
  const body = document.body;
  const toggleDark = document.getElementById('toggleDark');
  const toggleContrast = document.getElementById('toggleContrast');

  toggleDark?.addEventListener('click', () => body.classList.toggle('dark-mode'));
  toggleContrast?.addEventListener('click', () => body.classList.toggle('high-contrast'));
  
  // Lógica de Submissão para o formulário no cadastro.html (página estática)
  const formCadastro = document.getElementById('form-cadastro');
  if (formCadastro) {
      formCadastro.addEventListener('submit', ev => {
        ev.preventDefault();
        if (!Validation.validateForm(formCadastro)) {
            toast('Preencha corretamente os campos obrigatórios.', 'error');
            return;
        }
        const dados = Object.fromEntries(new FormData(formCadastro));
        Storage.pushToArray('voluntarios', dados);
        if (dados.newsletter === 'sim') Storage.pushToArray('newsletter', { email: dados.email });
        
        toast('Cadastro realizado com sucesso!', 'success');
        formCadastro.reset();
        
        // Abre o modal de sucesso (com gestão de foco)
        openModalSucesso(formCadastro); 
      });
  }
});