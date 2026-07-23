# Guia de Configuração: Register Keys System

Este documento contém as instruções passo a passo para configurar o backend, criar o usuário administrador e publicar o site utilizando o GitHub Pages.

## Passo 1: Deployando o Backend (Render.com)

O backend gerencia as chaves e o login do administrador. Vamos hospedá-lo gratuitamente no Render.com.

1. Acesse [Render.com](https://render.com/) e crie uma conta gratuita (pode usar sua conta do GitHub).
2. Clique em **New** > **Web Service**.
3. Conecte sua conta do GitHub e selecione o repositório `register-keys-system`.
4. Configure o Web Service:
   - **Name:** `register-keys-api`
   - **Region:** `Oregon` (ou a mais próxima)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && node server.js`
   - **Instance Type:** `Free`
5. Clique em **Advanced** e adicione as seguintes variáveis de ambiente:
   - `ADMIN_EMAIL`: O e-mail que você quer usar para entrar no Painel ADM (ex: `admin@meusite.com`).
   - `ADMIN_PASSWORD`: A senha que você quer usar para entrar no Painel ADM (ex: `minhasenha123`).
   - `JWT_SECRET`: Uma chave secreta aleatória (pode digitar qualquer coisa aleatória, ex: `chave-super-secreta-123`).
6. Clique em **Create Web Service**.
7. Aguarde o deploy terminar. Ao finalizar, o Render fornecerá uma URL para o seu backend (ex: `https://register-keys-api.onrender.com`). **Copie essa URL**, você precisará dela no próximo passo.

## Passo 2: Publicando o Frontend no GitHub Pages

O GitHub Pages hospedará as páginas do Painel ADM e do Gerador.

1. Certifique-se de que todos os arquivos estão no seu repositório do GitHub.
2. Acesse o seu repositório no GitHub.
3. Clique em **Settings** (Configurações) no topo da página do repositório.
4. No menu lateral esquerdo, clique em **Pages**.
5. Em **Source**, certifique-se de que está selecionada a opção **Deploy from a branch**.
6. Em **Branch**, selecione a branch **main** (ou master) e a pasta **/ (root)**.
7. Clique em **Save** (Salvar).
8. O GitHub fornecerá um link na parte superior da página (ex: `https://seu-usuario.github.io/register-keys-system/`).

## Passo 3: Configurando o Painel ADM

1. Acesse a URL do seu Painel ADM (ex: `https://seu-usuario.github.io/register-keys-system/admin.html`).
2. No formulário de login, haverá um campo chamado **URL da API**. Cole a URL do backend que você copiou no Render.com (ex: `https://register-keys-api.onrender.com`).
3. A URL será salva automaticamente no seu navegador.
4. Insira o e-mail e a senha que você configurou nas variáveis de ambiente no Render.com (`ADMIN_EMAIL` e `ADMIN_PASSWORD`).
5. Clique em **Entrar**.

## Passo 4: Compartilhando o Gerador

1. Dentro do Painel ADM, você verá a seção **URL do Gerador**.
2. Copie essa URL. O sistema está configurado para passar automaticamente a URL da API para os usuários.
3. Compartilhe essa URL com os usuários. Eles poderão verificar se há chaves disponíveis e gerar novas chaves, que serão registradas automaticamente no seu backend no Render.com.
