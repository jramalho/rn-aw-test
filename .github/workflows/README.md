# 🤖 GitHub Agentic Workflows

Este diretório contém workflows inteligentes baseados em IA para automatizar tarefas do projeto React Native.

## 📱 BrowserStack Testing Workflow

### `browserstack-testing.md`

Workflow agentic que executa testes E2E automatizados no BrowserStack em dispositivos móveis reais.

#### ✨ Funcionalidades:

- **🔄 Execução Automática**: Roda em pushes e PRs
- **📱 Multiplataforma**: iOS e Android
- **🎯 Testes Seletivos**: Diferentes suites (smoke, critical, pokemon, auth)
- **📊 Relatórios Inteligentes**: Comentários automáticos e issues para falhas
- **🔧 Configurável**: Escolha dispositivos e parâmetros via UI

#### 🚀 Como Usar:

##### Automático:

- Push para `main`/`develop` → executa automaticamente
- Abrir PR → executa automaticamente com comentário de resultados

##### Manual:

1. **Actions** → **"BrowserStack Mobile App Testing"**
2. **"Run workflow"**
3. Configure parâmetros:
   - **Platform**: iOS, Android ou ambos
   - **Device**: iPhone 15, Pixel 8, etc.
   - **Test Suite**: all, smoke, critical, pokemon, auth, tournament
4. **"Run workflow"**

#### 🔧 Configuração Necessária:

```bash
# Secrets do GitHub (obrigatório)
BROWSERSTACK_USERNAME=seu_username
BROWSERSTACK_ACCESS_KEY=sua_access_key
```

#### 📊 O que o Workflow Faz:

1. **✅ Valida** credenciais BrowserStack
2. **🔨 Compila** apps iOS/Android para release
3. **📤 Faz upload** dos apps para BrowserStack
4. **🧪 Executa** testes E2E com Detox
5. **📱 Testa** em dispositivos reais especificados
6. **📋 Coleta** screenshots, vídeos e logs
7. **💬 Comenta** resultados em PRs
8. **🚨 Cria issues** para falhas críticas

#### 📱 Dispositivos Suportados:

**iOS:**

- iPhone 15, 14, 13
- iPad Air, iPad Pro
- iOS 16, 17

**Android:**

- Google Pixel 8, 7, 6
- Samsung Galaxy S24, S23, S22
- OnePlus 11, 10T
- Android 12, 13, 14

#### 🧪 Suites de Teste:

- **`all`**: Todos os testes (7 arquivos)
- **`smoke`**: Testes básicos (app-launch)
- **`critical`**: Testes críticos (app-launch + auth)
- **`pokemon`**: Features Pokemon (pokemon + team-building)
- **`auth`**: Autenticação (authentication)
- **`tournament`**: Sistema de torneios (tournament-system)

#### 📈 Resultados:

**Pull Requests:**

```markdown
## 📱 BrowserStack Test Results

### Test Summary

- Platform(s): both
- Total Tests: 7
- Passed: 6
- Failed: 1
- Status: ❌ FAILED

### Device Configuration

- iOS Device: iPhone 15
- Android Device: Google Pixel 8
- Test Suite: critical

### BrowserStack Session

🔗 [View Test Sessions](https://app-automate.browserstack.com/dashboard/v2/builds/xxx)
```

**Issues Automáticos:**

- Criados para falhas em push/manual
- Incluem logs detalhados e próximos passos
- Tags: `automation`, `testing`, `browserstack`, `e2e`

#### 🛠️ Teste Local:

```bash
# Configurar credenciais
export BROWSERSTACK_USERNAME="seu_username"
export BROWSERSTACK_ACCESS_KEY="sua_key"

# Testar script local
chmod +x scripts/test-browserstack-local.sh
./scripts/test-browserstack-local.sh android smoke "Samsung Galaxy S23"

# Ou usar npm scripts
npm run test:browserstack:local
```

#### 📁 Arquivos Relacionados:

```
.github/workflows/
├── browserstack-testing.md        # Workflow principal

.detoxrc.browserstack.js           # Config Detox para BrowserStack
ios/ExportOptions.plist             # Config export iOS
scripts/test-browserstack-local.sh  # Script teste local
docs/BROWSERSTACK_INTEGRATION.md    # Documentação completa

package.json                        # Scripts npm adicionados:
├── test:browserstack:android
├── test:browserstack:ios
├── test:browserstack:local
├── browserstack:upload:android
└── browserstack:upload:ios
```

## 🔄 Outros Workflows

### `ci.yml`

Workflow tradicional de CI com lint, testes e builds.

### `daily-progress.md`

Workflow agentic que gera relatórios diários de progresso do projeto.

### `weekly-research.md`

Workflow agentic que pesquisa novas tecnologias e tendências React Native.

## 📚 Documentação

### Recursos Úteis:

- **[GitHub Agentic Workflows Docs](./../instructions/github-agentic-workflows.instructions.md)** - Guia completo
- **[BrowserStack Integration](./../../docs/BROWSERSTACK_INTEGRATION.md)** - Setup e uso detalhado
- **[E2E Testing](./../../e2e/README.md)** - Testes Detox existentes

### Como Funcionam os Workflows Agentic:

1. **Trigger** → Evento GitHub (push, PR, manual)
2. **IA Analysis** → Claude analisa contexto e requisitos
3. **Tool Execution** → Executa comandos bash, APIs, etc.
4. **Smart Reporting** → Gera relatórios inteligentes
5. **Safe Outputs** → Cria issues/comentários automaticamente

### Vantagens vs Workflows Tradicionais:

| Tradicional              | Agentic               |
| ------------------------ | --------------------- |
| ❌ Scripts estáticos     | ✅ Lógica adaptável   |
| ❌ Configuração complexa | ✅ Natural language   |
| ❌ Debugging difícil     | ✅ Logs inteligentes  |
| ❌ Relatórios básicos    | ✅ Análise contextual |
| ❌ Manutenção manual     | ✅ Auto-improving     |

## 🔐 Segurança

- **Safe Outputs**: Controle automático de permissões
- **Network Allowlist**: Apenas domínios necessários
- **Secret Management**: Uso seguro de credentials
- **Tool Restrictions**: Comandos limitados e validados

## 🎯 Próximos Passos

1. **Configure** as credenciais BrowserStack
2. **Execute** o workflow manualmente para testar
3. **Monitore** resultados nos PRs
4. **Customize** dispositivos conforme necessário
5. **Expanda** para outras integrações (Firebase, App Store, etc.)

---

**🚀 Automatização inteligente para desenvolvimento React Native de qualidade!**
