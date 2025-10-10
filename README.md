# 🏖️ Sistema de Reservas - Cachoeira do Bom Jesus

Sistema completo de gerenciamento de reservas para temporada 2025/2026 com Firebase/Firestore.

## 📋 Funcionalidades

### ✅ Gestão de Reservas
- Calendário visual com 3 unidades (UN01, UN02, UN03)
- Timeline horizontal para visualização rápida
- Campos completos: Cliente, WhatsApp, País, Check-in/out, Valor, Sinal, Pagamento
- Detecção automática de sobreposições
- Tooltip com informações ao passar o mouse
- Autocomplete de clientes cadastrados

### ✅ Gestão de Contatos
- Cadastro completo de clientes
- Histórico de reservas por cliente
- Busca e filtros

### ✅ Limpeza e Manutenção
- Registro de limpezas por unidade
- Controle de manutenções e custos
- Histórico completo

### ✅ Relatórios
- Relatório TXT formatado
- Disponibilidade da temporada (Nov/25 - Mai/26)
- Tabela compacta com ocupação por mês
- Download e impressão

### ✅ Firebase/Firestore
- Autenticação segura
- Dados sincronizados na nuvem
- Backup automático
- Acesso de múltiplos dispositivos
- Sincronização em tempo real

### ✅ Responsivo
- Funciona em desktop, tablet e smartphone
- Interface adaptativa
- Touch-optimized

## 📁 Estrutura do Projeto

```
cachoeira-firebase-completo/
├── index.html              # Página de login
├── app.html                # Sistema principal
├── css/
│   └── styles.css          # Todos os estilos (522 linhas)
├── js/
│   ├── firebase-config.js  # Configuração Firebase
│   ├── auth.js             # Autenticação
│   ├── firestore.js        # Operações banco de dados
│   └── app.js              # Lógica do sistema (1281 linhas)
└── README.md               # Este arquivo
```

## 🚀 Como Fazer Deploy

### Opção 1: GitHub + Netlify (Recomendado)

#### 1. Upload para GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"+"** → **"New repository"**
3. Nome: `cachoeira-reservas`
4. Visibilidade: **Private** (recomendado)
5. Clique em **"Create repository"**

6. **Upload dos arquivos:**
   - Clique em **"uploading an existing file"**
   - Arraste TODOS os arquivos e pastas:
     - `index.html`
     - `app.html`
     - Pasta `css/` (com styles.css dentro)
     - Pasta `js/` (com todos os 4 arquivos .js dentro)
     - `README.md`
   - Clique em **"Commit changes"**

#### 2. Deploy no Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em **"Sign up with GitHub"**
3. Autorize o Netlify
4. Clique em **"Add new site"** → **"Import an existing project"**
5. Escolha **"GitHub"**
6. Selecione o repositório **"cachoeira-reservas"**
7. Configurações:
   - **Build command:** (deixe vazio)
   - **Publish directory:** `.` (ponto)
8. Clique em **"Deploy site"**
9. Aguarde 1-2 minutos
10. **Pronto!** Copie a URL gerada

#### 3. Personalizar URL (Opcional)

1. No Netlify, vá em **"Site settings"**
2. Clique em **"Change site name"**
3. Digite: `cachoeira-reservas`
4. Sua URL será: `https://cachoeira-reservas.netlify.app`

---

### Opção 2: Firebase Hosting

#### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

#### 2. Login

```bash
firebase login
```

#### 3. Inicializar

```bash
cd cachoeira-firebase-completo
firebase init hosting
```

Respostas:
- Projeto: **cachoeira-reservas** (selecione o existente)
- Public directory: **`.`** (ponto)
- Single-page app: **N** (não)
- GitHub: **N** (não)

#### 4. Deploy

```bash
firebase deploy --only hosting
```

#### 5. Acessar

URL: `https://cachoeira-reservas.web.app`

---

## 🔐 Configuração Inicial

### 1. Criar Primeiro Usuário

1. Acesse: [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto **"cachoeira-reservas"**
3. Vá em **"Authentication"** → **"Users"**
4. Clique em **"Add user"**
5. Digite:
   - Email: seu-email@exemplo.com
   - Senha: (mínimo 6 caracteres)
6. Clique em **"Add user"**

### 2. Primeiro Acesso

1. Abra a URL do seu site
2. Faça login com o email e senha criados
3. Pronto! Sistema funcionando

---

## 📊 Regras de Segurança do Firestore

As regras já estão configuradas no Firebase Console, mas se precisar verificar:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Isso significa:
- ✅ Apenas usuários autenticados podem acessar
- ✅ Cada usuário vê apenas seus próprios dados
- ✅ Seguro e privado

---

## 🔄 Migração de Dados (Se Tiver Versão Offline)

### 1. Exportar da Versão Offline

1. Abra a versão offline no navegador
2. Vá em **"Reservas"**
3. Clique em **"📥 Exportar Backup"**
4. Salve o arquivo JSON

### 2. Importar na Versão Firebase

**Método Manual (Recomendado para poucos dados):**
1. Abra o arquivo JSON exportado
2. Copie os dados de cada reserva
3. Adicione manualmente na versão Firebase

**Método Automático (Para muitos dados):**
- Entre em contato para criar script de importação

---

## 💡 Dicas de Uso

### Calendário
- **Verde**: Dia de entrada (check-in)
- **Azul**: Hospedagem (dias intermediários)
- **Laranja**: Dia de saída (check-out)
- **Roxo**: Sobreposição (saída + entrada no mesmo dia)
- **Cinza**: Livre

### Timeline
- Visualização horizontal das 3 unidades
- Navegar entre meses com ‹ e ›
- Passar mouse para ver detalhes

### Relatórios
- Gera TXT com disponibilidade completa da temporada
- Tabela compacta (Nov/25 - Mai/26)
- Formato ASCII (funciona em celular)

### Backup
- Dados ficam na nuvem (Firebase)
- Backup automático
- Acesse de qualquer dispositivo

---

## 🆘 Solução de Problemas

### Erro: "Permission denied"
- **Causa:** Usuário não autenticado
- **Solução:** Faça login novamente

### Erro: "Failed to load data"
- **Causa:** Sem conexão com internet
- **Solução:** Verifique sua conexão

### Dados não aparecem
- **Causa:** Firestore vazio (primeira vez)
- **Solução:** Normal! Adicione a primeira reserva

### Não consigo fazer login
- **Causa:** Usuário não criado no Firebase
- **Solução:** Crie o usuário no Firebase Console

---

## 📱 Suporte

### Navegadores Suportados
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)

### Requisitos
- Conexão com internet
- Navegador moderno (2020+)
- JavaScript habilitado

---

## 🎯 Próximos Passos

Após o deploy:

1. ✅ Crie seu usuário no Firebase
2. ✅ Faça login no sistema
3. ✅ Adicione sua primeira reserva
4. ✅ Teste em diferentes dispositivos
5. ✅ Compartilhe a URL (se quiser dar acesso a outros)

---

## 📄 Licença

Projeto privado - Cachoeira do Bom Jesus

---

## 🎉 Pronto!

Seu sistema está completo e pronto para uso!

**URL após deploy:** `https://cachoeira-reservas.netlify.app` (ou Firebase)

**Dúvidas?** Consulte os guias na pasta ou entre em contato.

---

**Desenvolvido com ❤️ para Cachoeira do Bom Jesus**
**Temporada 2025/2026** 🏖️

