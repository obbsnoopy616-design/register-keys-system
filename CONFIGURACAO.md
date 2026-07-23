# Guia de Configuração: Register Keys System

Este documento contém as instruções passo a passo para configurar o Firebase, criar o banco de dados, configurar o usuário administrador e publicar o site utilizando o GitHub Pages.

## Passo 1: Configuração do Firebase

O Firebase será utilizado para armazenar as Register Keys e gerenciar o acesso do administrador.

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e clique em **Adicionar projeto**.
2. Dê um nome ao seu projeto (ex: `register-keys-system`) e siga as instruções para concluí-lo.
3. Após a criação do projeto, clique no ícone do **Web** (representado por `</>`) para adicionar um aplicativo web.
4. Dê um apelido ao aplicativo (ex: `site`) e registre-o.
5. **Importante:** O Firebase fornecerá um bloco de código contendo as credenciais (`apiKey`, `authDomain`, `projectId`, etc.). Copie esse bloco, pois você precisará dele nos próximos passos.

## Passo 2: Configuração do Banco de Dados (Firestore)

O Firestore será o banco de dados onde as Register Keys serão armazenadas.

1. No menu lateral esquerdo do Console do Firebase, clique em **Criação** > **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha o local mais próximo de você (ex: `southamerica-east1` para Brasil) e selecione **Iniciar no modo de teste**.
4. Clique em **Ativar**.
5. **Regras de Segurança:** Vá na aba **Regras** do Firestore e substitua as regras padrão pelas regras abaixo para garantir que qualquer pessoa possa ler/escrever (necessário pois o site é estático e não possui backend próprio para validação de tokens):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
*Clique em **Publicar** para salvar as regras.*

## Passo 3: Configuração da Autenticação (Firebase Auth)

A autenticação será usada para proteger o Painel ADM.

1. No menu lateral esquerdo do Console do Firebase, clique em **Criação** > **Authentication**.
2. Clique em **Vamos começar**.
3. Na aba **Provedores de login**, clique em **Adicionar novo provedor**.
4. Escolha **E-mail/senha** e ative a opção de **E-mail/senha**. Salve.
5. Ainda na aba **Authentication**, clique em **Usuários** e depois em **Adicionar usuário**.
6. Crie o e-mail e a senha que você usará para acessar o Painel ADM (ex: `admin@meusite.com` / `minhasenha123`).
7. Clique em **Adicionar usuário**.

## Passo 4: Atualizando as Credenciais no Código

Você precisa inserir as credenciais do Firebase nos arquivos do projeto para que eles possam se comunicar com o banco de dados.

1. Abra o arquivo `admin.html` no seu projeto.
2. Localize a seção `firebaseConfig`:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

3. Substitua os valores (`SUA_API_KEY`, etc.) pelas credenciais que você copiou no Passo 1.
4. Abra o arquivo `index.html` e faça exatamente a mesma substituição na seção `firebaseConfig`.

## Passo 5: Publicando no GitHub Pages

O GitHub Pages permitirá que você hospede o site gratuitamente.

1. Certifique-se de que todos os arquivos estão no seu repositório do GitHub.
2. Acesse o seu repositório no GitHub.
3. Clique em **Settings** (Configurações) no topo da página do repositório.
4. No menu lateral esquerdo, clique em **Pages**.
5. Em **Source**, certifique-se de que está selecionada a opção **Deploy from a branch**.
6. Em **Branch**, selecione a branch **main** (ou master) e a pasta **/ (root)**.
7. Clique em **Save** (Salvar).

O GitHub irá processar a publicação. Em alguns minutos, ele fornecerá um link na parte superior da página (ex: `https://seu-usuario.github.io/nome-do-repositorio/`).

## Passo 6: Utilizando o Sistema

1. Acesse o link do seu site no navegador.
2. Adicione `/admin.html` ao final da URL para acessar o painel (ex: `https://seu-usuario.github.io/nome-do-repositorio/admin.html`).
3. Faça login com o e-mail e senha criados no Passo 3.
4. No Painel ADM, adicione algumas Register Keys usando o campo de texto ou o lote.
5. Copie a "URL do Gerador" exibida no painel.
6. Compartilhe essa URL com os usuários. Quando eles acessarem, passarão pela verificação e poderão gerar uma key, que será automaticamente marcada como usada no Firebase.
