# 📚 Sistema de Gerenciamento de Biblioteca

Sistema web simples e funcional para gerenciamento de livros e empréstimos em uma biblioteca escolar. Desenvolvido com **HTML**, **CSS** e **JavaScript puro**, utiliza o `localStorage` para armazenar dados de forma persistente no navegador.

Acesse em: https://emanuelmgww.github.io/site_tcc/

---

## 🔧 Funcionalidades Principais

### ✅ Login
- Autenticação básica com usuários pré-definidos:
  - `admin / admin123`
  - `bibliotecario / biblio123`
  - `usuario / user123`
- Após o login, o usuário tem acesso completo ao sistema.

### 📘 Cadastro de Livros
- Adição de livros com os seguintes campos:
  - Título
  - Autor
  - ISBN (com formatação automática)
  - Ano
  - Gênero
  - Número de exemplares (mínimo de 2)
- Funções para **editar**, **excluir** e **pesquisar** livros por título, autor ou gênero.

### 📗 Gerenciamento de Empréstimos
- Registro de novos empréstimos:
  - Escolha do livro (com campo de busca)
  - Nome do usuário
  - Datas de empréstimo e devolução (7 dias úteis por padrão)
  - Status: `Emprestado`, `Atrasado` ou `Devolvido`
- Ações disponíveis:
  - Editar, devolver e excluir empréstimos
  - Busca por nome do usuário, livro ou status

### 📦 Controle de Disponibilidade
- Visualização em tempo real da quantidade de exemplares disponíveis.
- Impede empréstimos se não houver exemplares suficientes.
- O **último exemplar** de cada livro não pode ser emprestado.

### 📊 Visualização com Cores Indicativas
- Tabelas com cores para facilitar a identificação de status:
  - 🟢 Verde: Disponível
  - 🟠 Amarelo: Alerta
  - 🔴 Vermelho: Indisponível ou em atraso

---

## 📋 Regras de Negócio

- **Login**: Acesso restrito a usuários com credenciais válidas.
- **Cadastro de Livros**:
  - ISBN deve conter **13 dígitos únicos**.
  - Cada livro deve possuir **pelo menos 2 exemplares**.
- **Exclusão de Livro**:
  - Só permitida quando **não houver empréstimos ativos** associados ao livro.
- **Empréstimos**:
  - Prazo padrão de **7 dias úteis**.
- **Disponibilidade**:
  - O **último exemplar** nunca pode ser emprestado.
- **Devolução**:
  - O status muda automaticamente para `Devolvido`.
- **Atraso**:
  - Status muda para `Atrasado` se a devolução não for feita até a data prevista.

---

## 💾 Persistência de Dados

- Utiliza o `localStorage` do navegador:
  - Registros de livros e empréstimos permanecem após recarregar a página.
  - Sessão de login permanece ativa durante a navegação.

---

## 📱 Responsividade

- Layout adaptado para:
  - 🖥️ Desktops
  - 📱 Dispositivos móveis
  - 📟 Tablets

Todos os elementos da interface são reorganizados para garantir boa usabilidade em qualquer tamanho de tela.

---

## 🛠️ Tecnologias Utilizadas

- `HTML5`: Estrutura da interface
- `CSS3`: Estilização e responsividade
- `JavaScript (ES6)`: Lógica e interatividade
- `localStorage`: Armazenamento no navegador

---

## 📌 Observação

Este sistema é voltado para fins educacionais e pode ser expandido com novas funcionalidades como banco de dados real, autenticação segura, histórico de empréstimos, entre outros.

---
