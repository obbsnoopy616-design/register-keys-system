# Register Keys System

Sistema completo de gerenciamento e distribuição de Register Keys.

## Funcionalidades

### Painel ADM (`admin.html`)
- Login protegido com autenticação Firebase
- Adicionar Register Keys (individual ou em lote)
- Visualizar todas as keys com filtros (Todas, Disponíveis, Usadas)
- Contador em tempo real de keys disponíveis e usadas
- Excluir keys
- Copiar URL do Gerador para compartilhar com usuários

### Gerador (`index.html`)
- Página pública para usuários
- Etapa de verificação antes de gerar
- Geração automática de uma key disponível
- Proteção contra race conditions (transação Firebase)
- A key é automaticamente marcada como usada após entrega

## Tecnologias

- **HTML5 / CSS3 / JavaScript (ES6+)**
- **Firebase Authentication** (login do admin)
- **Firebase Firestore** (banco de dados)
- **GitHub Pages** (hospedagem gratuita)

## Estrutura do Projeto

```
register-keys-system/
├── index.html          ← Gerador (página pública)
├── admin.html          ← Painel ADM (protegido por login)
├── style.css           ← Estilos globais (moderno e responsivo)
├── _config.yml         ← Configuração do GitHub Pages
├── .gitignore          ← Arquivos ignorados pelo Git
└── README.md           ← Este arquivo
```

## Configuração Rápida

1. Crie um projeto no Firebase em [console.firebase.google.com](https://console.firebase.google.com)
2. Ative **Authentication** (e-mail/senha) e crie seu usuário administrador
3. Ative **Firestore Database** em modo de teste
4. Configure as regras de segurança do Firestore para: `allow read, write: if true;`
5. Copie as credenciais do Firebase
6. Substitua os valores em `index.html` e `admin.html` na seção `firebaseConfig`
7. Crie um repositório no GitHub e envie os arquivos
8. Ative o **GitHub Pages** nas configurações do repositório (Settings > Pages > branch: main)

## Instruções Completas

Consulte o arquivo `CONFIGURACAO.md` para o guia detalhado passo a passo.

## Links

- **Gerador:** `https://seu-usuario.github.io/register-keys-system/`
- **Painel ADM:** `https://seu-usuario.github.io/register-keys-system/admin.html`
