# Estoque Simples - Sistema de Gestão de Estoque

O **Estoque Simples** é uma aplicação web moderna para controle de inventário, desenvolvida para ser simples, eficiente e fácil de implantar. O sistema conta com um dashboard visual, listagem completa de produtos e persistência de dados segura.

## 🤖 Feito com Vibecoding

Este projeto é um exemplo de **Vibecoding** — uma abordagem de desenvolvimento acelerado onde a estrutura Full Stack (Frontend, Backend, Banco de Dados e Docker) foi gerada com auxílio de Inteligência Artificial para garantir velocidade e qualidade de código.

**Estado Atual:**
O sistema entrega as **funcionalidades básicas** essenciais para um MVP (Produto Mínimo Viável) de gestão de estoque.

📢 **Quer ver este projeto evoluir?**
Se você gostaria de ver este sistema aprimorado com recursos avançados (como autenticação de usuários, exportação de relatórios em PDF, leitura de código de barras, etc.), **deixe seu comentário e uma estrela no repositório!** O feedback da comunidade definirá as próximas atualizações.

---

## 🚀 Funcionalidades

- **Dashboard Interativo**: Visualização gráfica do status do estoque, valor total e alertas.
- **Gestão de Produtos**: Adicionar, Editar e Excluir produtos.
- **Entrada e Saída**: Controle rápido de movimentações de estoque.
- **Relatórios**: Histórico detalhado de todas as movimentações.
- **Categorização**: Organização por categorias (Eletrônicos, Móveis, etc).
- **Alertas de Estoque**: Indicadores visuais automáticos para produtos com estoque baixo.
- **Persistência de Dados**: Banco de dados SQLite robusto e leve.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, Vite.
- **Backend**: Node.js, Express.
- **Banco de Dados**: SQLite (via `better-sqlite3`).
- **Infraestrutura**: Docker e Docker Compose.

---

## 📦 Instalação e Uso (Para Usuários Não-Técnicos)

A maneira mais fácil de rodar o Estoque Simples é utilizando o **Docker**. Isso garante que tudo funcione sem precisar instalar várias ferramentas no seu computador.

### Pré-requisitos
1. Baixe e instale o **Docker Desktop** no seu computador (Windows, Mac ou Linux).
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Passo a Passo

1. **Baixe o código**: Faça o download deste projeto e extraia a pasta no seu computador.
2. **Abra o Terminal**:
   - No Windows: Abra a pasta do projeto, clique com o botão direito e selecione "Abrir no Terminal" (ou use o PowerShell).
   - No Mac/Linux: Abra o Terminal e navegue até a pasta do projeto (`cd caminho/da/pasta`).
3. **Inicie o Sistema**: Digite o seguinte comando e aperte Enter:
   ```bash
   docker-compose up
   ```
   *A primeira vez pode levar alguns minutos pois o sistema irá baixar e configurar tudo automaticamente.*

4. **Acesse o Sistema**:
   - Abra seu navegador (Chrome, Edge, Firefox).
   - Digite o endereço: **http://localhost:3000**

Pronto! O sistema está rodando. Seus dados serão salvos automaticamente na pasta `backend/data` dentro do projeto.

---

## 💻 Instalação Manual (Para Desenvolvedores)

Se você preferir rodar sem Docker para desenvolvimento:

### Backend
1. Navegue até a pasta `backend`: `cd backend`
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm start`
   - O servidor rodará em `http://localhost:3001`.

### Frontend
1. Na raiz do projeto: `cd ..`
2. Instale as dependências: `npm install`
3. Inicie o Vite: `npm run dev`
4. Acesse `http://localhost:3000` (ou a porta indicada pelo Vite).

## 📂 Estrutura do Projeto

```
/
├── backend/            # API Node.js e Banco de Dados
│   ├── data/           # Arquivo do SQLite (gerado automaticamente)
│   ├── server.ts       # Código do servidor
│   └── schema.sql      # Estrutura do banco de dados
├── components/         # Componentes React (Dashboard, Forms, etc)
├── services/           # Comunicação com API
├── types.ts            # Definições de tipos TypeScript
├── docker-compose.yml  # Configuração dos containers
└── README.md           # Este arquivo
```

## ⚠️ Notas Importantes

- **Dados Persistentes**: O banco de dados SQLite é salvo localmente. Se você deletar a pasta do projeto, pode perder os dados, a menos que faça backup da pasta `backend/data`.
- **Portas**: O sistema usa as portas `3000` (Frontend) e `3001` (Backend). Certifique-se de que elas não estão sendo usadas por outros programas.