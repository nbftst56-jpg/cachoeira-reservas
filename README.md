# 🏖️ Sistema de Reservas - Versão Firebase

## 📋 Arquivos do Projeto

- `index.html` - Página de login
- `app.html` - Sistema principal (em desenvolvimento)
- `README.md` - Este arquivo

## 🚀 Como Usar Localmente

### 1. Abrir o Sistema

Basta abrir o arquivo `index.html` em um navegador moderno:

```bash
# No navegador, abra:
file:///caminho/para/cachoeira-firebase/index.html
```

### 2. Fazer Login

Use as credenciais que você criou no Firebase Console:
- Email: seu-email@exemplo.com
- Senha: sua-senha

### 3. Usar o Sistema

Após o login, você será redirecionado para `app.html` onde poderá:
- Gerenciar reservas
- Visualizar calendário
- Adicionar contatos
- Tudo sincronizado na nuvem!

## ☁️ Deploy para Produção

### Opção 1: Firebase Hosting (Recomendado)

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login no Firebase
firebase login

# 3. Inicializar projeto
firebase init hosting

# Escolha:
# - Use an existing project: cachoeira-reservas
# - Public directory: . (ponto)
# - Configure as single-page app: No
# - Set up automatic builds: No

# 4. Deploy
firebase deploy --only hosting
```

Seu site estará em: `https://cachoeira-reservas.web.app`

### Opção 2: Netlify (Alternativa Simples)

1. Acesse: https://app.netlify.com
2. Arraste a pasta `cachoeira-firebase` para o Netlify
3. Pronto! URL gerada automaticamente

### Opção 3: Vercel (Alternativa Rápida)

1. Acesse: https://vercel.com
2. Importe o projeto
3. Deploy automático

## 🔐 Segurança

### Regras do Firestore

As regras já estão configuradas para permitir acesso apenas a usuários autenticados:

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

### Adicionar Novos Usuários

1. Acesse: https://console.firebase.google.com
2. Vá para Authentication > Users
3. Clique em "Add user"
4. Digite email e senha
5. Pronto!

## 📊 Estrutura do Banco de Dados

### Coleções:

#### `reservas`
```javascript
{
  id: "timestamp",
  cliente: "Nome do Cliente",
  whatsapp: "(71) 98765-4321",
  pais: "Brasil",
  email: "cliente@email.com",
  unidade: "UN01",
  checkin: "2025-12-01",
  checkout: "2025-12-10",
  status: "Confirmada",
  valor: 5000.00,
  valorSinal: 1500.00,
  dataPagamento: "2025-11-15",
  formaPagamento: "PIX",
  observacoes: "Cliente preferencial",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `contatos`
```javascript
{
  id: "timestamp",
  nome: "Nome do Contato",
  whatsapp: "(71) 98765-4321",
  pais: "Brasil",
  email: "contato@email.com",
  observacoes: "Notas adicionais",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔄 Sincronização

- **Tempo Real**: Mudanças aparecem instantaneamente
- **Offline**: Funciona offline e sincroniza quando voltar online
- **Multi-dispositivo**: Acesse de qualquer lugar

## 💾 Backup

**Não é mais necessário fazer backup manual!**

✅ Todos os dados estão seguros no Firebase  
✅ Backup automático do Google  
✅ Histórico de versões  
✅ Recuperação de desastres  

## 🐛 Solução de Problemas

### Erro: "User not found"
- Verifique se criou o usuário no Firebase Console
- Confirme o email digitado

### Erro: "Wrong password"
- Verifique a senha
- Senha deve ter no mínimo 6 caracteres

### Erro: "Network error"
- Verifique sua conexão com a internet
- Verifique se o Firebase está configurado corretamente

### Página em branco após login
- Abra o Console do navegador (F12)
- Verifique se há erros
- Confirme que app.html está na mesma pasta

## 📱 Compatibilidade

### Navegadores Suportados:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos:
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablets (Android, iPad)
- ✅ Smartphones (Android, iPhone)

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Consulte a documentação do Firebase: https://firebase.google.com/docs
3. Verifique o Console do navegador para erros

## 📝 Notas de Versão

### Versão 1.0 (Firebase)
- ✅ Autenticação com email/senha
- ✅ Banco de dados Firestore
- ✅ Sincronização em tempo real
- ✅ CRUD de reservas
- ✅ CRUD de contatos
- ✅ Calendário visual
- ✅ Responsivo (mobile-friendly)

## 🔮 Próximas Funcionalidades

- [ ] Timeline de reservas
- [ ] Gestão de limpeza e manutenção
- [ ] Relatórios em PDF
- [ ] Notificações push
- [ ] App mobile nativo

---

**Desenvolvido para Cachoeira do Bom Jesus**  
**Temporada 2025/2026** 🏖️

