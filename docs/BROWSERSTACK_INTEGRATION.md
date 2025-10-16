# 📱 BrowserStack Integration para React Native

Guia completo para configurar e usar testes automatizados no BrowserStack com GitHub Agentic Workflows.

## 🎯 Visão Geral

O BrowserStack permite executar testes E2E em dispositivos móveis reais na nuvem. Nossa integração oferece:

- **Testes em dispositivos reais** iOS e Android
- **Execução automática** em PRs e pushes
- **Relatórios detalhados** com screenshots e vídeos
- **Múltiplas configurações** de dispositivos e OS
- **Integração com Detox** para testes E2E robustos

## 🚀 Configuração Inicial

### 1. Conta BrowserStack

Primeiro, você precisa de uma conta BrowserStack:

1. Acesse [BrowserStack](https://www.browserstack.com/)
2. Crie uma conta ou faça login
3. Vá para **Account > Settings**
4. Copie seu **Username** e **Access Key**

### 2. Configurar Secrets no GitHub

Adicione as credenciais como secrets no GitHub:

1. Vá para **Settings > Secrets and variables > Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

```
Nome: BROWSERSTACK_USERNAME
Valor: seu_username_browserstack

Nome: BROWSERSTACK_ACCESS_KEY
Valor: sua_access_key_browserstack
```

### 3. Configurar Team ID (iOS)

Para builds iOS, edite `ios/ExportOptions.plist`:

```xml
<key>teamID</key>
<string>SEU_TEAM_ID_AQUI</string>
```

Para encontrar seu Team ID:

1. Abra Xcode
2. Vá para **Preferences > Accounts**
3. Selecione sua conta Apple Developer
4. Copie o Team ID

## 📋 Estrutura dos Arquivos

### Arquivos Criados/Modificados:

```
.github/workflows/
├── browserstack-testing.md         # Workflow principal do GitHub Agentic

ios/
├── ExportOptions.plist             # Configuração para export iOS

.detoxrc.browserstack.js            # Configuração Detox para BrowserStack

e2e/
├── *.test.ts                       # Testes E2E existentes (compatíveis)
└── jest.config.js                  # Configuração Jest (existente)
```

## 🎮 Como Usar o Workflow

### Execução Automática

O workflow executa automaticamente quando:

- **Push** para branches `main` ou `develop`
- **Pull Request** é aberto, sincronizado ou marcado como "ready for review"

### Execução Manual

1. Vá para **Actions** no GitHub
2. Selecione **"BrowserStack Mobile App Testing"**
3. Clique em **"Run workflow"**
4. Configure os parâmetros:

| Parâmetro          | Opções                                                      | Padrão           | Descrição                 |
| ------------------ | ----------------------------------------------------------- | ---------------- | ------------------------- |
| **Platform**       | `ios`, `android`, `both`                                    | `both`           | Plataforma(s) para testar |
| **iOS Device**     | iPhone 15, iPhone 14, etc.                                  | `iPhone 15`      | Dispositivo iOS           |
| **Android Device** | Pixel 8, Galaxy S24, etc.                                   | `Google Pixel 8` | Dispositivo Android       |
| **Test Suite**     | `all`, `smoke`, `critical`, `pokemon`, `auth`, `tournament` | `all`            | Conjunto de testes        |

5. Clique em **"Run workflow"**

## 📱 Dispositivos Suportados

### iOS Devices

- iPhone 15, iPhone 15 Pro, iPhone 15 Pro Max
- iPhone 14, iPhone 14 Pro, iPhone 14 Pro Max
- iPhone 13, iPhone 13 Pro, iPhone 13 Pro Max
- iPad Air (5th generation)
- iPad Pro 12.9 (6th generation)

### Android Devices

- Google Pixel 8, Pixel 7, Pixel 6
- Samsung Galaxy S24, S23, S22
- OnePlus 11, OnePlus 10T
- Xiaomi 13, Xiaomi 12

### Versões de OS

- **iOS**: 16.0, 17.0, 17.1, 17.2
- **Android**: 12.0, 13.0, 14.0

## 🧪 Suites de Teste

### `all` - Todos os Testes

Executa todos os arquivos de teste em `e2e/`:

- `app-launch.test.ts`
- `pokemon-features.test.ts`
- `team-building-battle.test.ts`
- `authentication.test.ts`
- `tournament-system.test.ts`
- `notifications.test.ts`
- `theme-settings.test.ts`

### `smoke` - Testes Básicos

Testa funcionalidades essenciais:

- Inicialização do app
- Navegação básica

### `critical` - Testes Críticos

Funcionalidades críticas do negócio:

- Inicialização + Autenticação
- Fluxos principais

### `pokemon` - Funcionalidades Pokemon

Testes específicos das features Pokemon:

- Lista e busca de Pokémon
- Detalhes e favoritos
- Sistema de time e batalhas

### `auth` - Autenticação

Testes de login/logout:

- Fluxo de login
- Registro de usuário
- Logout

### `tournament` - Sistema de Torneio

Testes do sistema de torneios:

- Criação de torneios
- Navegação de brackets
- Progressão de torneios

## 📊 Relatórios e Monitoramento

### Durante a Execução

1. **Actions Tab**: Acompanhe o progresso em tempo real
2. **BrowserStack Dashboard**: Veja as sessões ativas
3. **Logs**: Logs detalhados no GitHub Actions

### Resultados

#### Pull Requests

- **Comentário automático** com resumo dos resultados
- **Status check** pass/fail no PR
- **Links diretos** para sessões BrowserStack

#### Falhas

- **Issue automático** criado para falhas
- **Screenshots** dos pontos de falha
- **Logs detalhados** para debugging
- **Vídeos** das sessões de teste

### BrowserStack Dashboard

Acesse: https://app-automate.browserstack.com/dashboard

No dashboard você pode:

- **Ver sessões ativas** e históricas
- **Assistir vídeos** dos testes
- **Baixar logs** detalhados
- **Analisar network** requests
- **Inspecionar crashes** do app

## 🔧 Configuração Avançada

### Personalizar Dispositivos

Edite o workflow para adicionar novos dispositivos:

```yaml
# Em .github/workflows/browserstack-testing.md
workflow_dispatch:
  inputs:
    device_ios:
      options:
        - iPhone 15
        - iPhone 14
        - iPad Air 5 # Adicionar novo dispositivo
```

### Configurar Build Customizado

Para iOS, customize `ios/ExportOptions.plist`:

```xml
<dict>
    <key>method</key>
    <string>ad-hoc</string>              <!-- Para distribuição interna -->

    <key>provisioningProfiles</key>
    <dict>
        <key>org.reactjs.native.example.rnAwTest</key>
        <string>SEU_PROVISIONING_PROFILE</string>
    </dict>
</dict>
```

### Adicionar Capabilities Especiais

Edite `.detoxrc.browserstack.js` para adicionar capabilities:

```javascript
capabilities: {
  'browserstack.debug': true,
  'browserstack.video': true,
  'browserstack.networkLogs': true,
  'browserstack.appiumLogs': true,
  'browserstack.local': false,           // Para testes locais
  'browserstack.localIdentifier': 'Test', // ID do túnel local
  'autoGrantPermissions': true,
  'autoAcceptAlerts': true,
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Failed - iOS

```
Error: No profiles for 'org.reactjs.native.example.rnAwTest'
```

**Solução:**

- Configure o Team ID em `ios/ExportOptions.plist`
- Verifique se tem certificados de desenvolvimento
- Use método `development` ou `ad-hoc`

#### 2. Build Failed - Android

```
Error: Task :app:assembleRelease FAILED
```

**Solução:**

- Verifique se `android/gradle.properties` está configurado
- Confirme que as keys de signing estão corretas
- Teste o build localmente: `cd android && ./gradlew assembleRelease`

#### 3. Upload Failed

```
Error: Failed to upload app to BrowserStack
```

**Solução:**

- Verifique as credenciais `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY`
- Confirme que o arquivo APK/IPA foi gerado corretamente
- Teste o upload manualmente com curl

#### 4. Tests Timeout

```
Error: Test execution timeout after 5 minutes
```

**Solução:**

- Aumente o timeout em `.detoxrc.browserstack.js`
- Verifique se o app está respondendo
- Simplifique os testes para suites menores

### Logs e Debugging

#### GitHub Actions Logs

```bash
# Ver logs detalhados
# Actions > Workflow run > Job > Step
```

#### BrowserStack Console Logs

```bash
# No dashboard BrowserStack:
# Session > Console Logs
# Session > Network Logs
# Session > Appium Logs
```

#### Logs Locais (Detox)

```bash
# Executar localmente para debug
export BROWSERSTACK_USERNAME="seu_username"
export BROWSERSTACK_ACCESS_KEY="sua_key"
export IOS_APP_URL="bs://seu_app_id"

npx detox test --configuration ios.browserstack
```

## 💡 Dicas e Melhores Práticas

### Performance

1. **Use suites específicas** para PRs (ex: `smoke`, `critical`)
2. **Execute `all` apenas** em releases
3. **Configure timeouts apropriados** para cada tipo de teste
4. **Use paralelização limitada** (maxWorkers: 1) para estabilidade

### Confiabilidade

1. **Adicione waits explícitos** em pontos críticos
2. **Use seletores estáveis** (testID ao invés de texto)
3. **Implemente retry logic** para operações de rede
4. **Configure auto-grant permissions** para reduzir flakiness

### Custos

1. **Use device quotas** do BrowserStack eficientemente
2. **Execute testes críticos primeiro** para feedback rápido
3. **Configure fail-fast** para parar em primeira falha crítica
4. **Use cache** para builds quando possível

### Manutenção

1. **Monitore device availability** no BrowserStack
2. **Atualize device lists** periodicamente
3. **Revise test suites** baseado em feedback
4. **Mantenha builds otimizados** para reduzir tempo de upload

## 📈 Métricas e KPIs

### Acompanhe:

- **Taxa de sucesso** dos testes por plataforma
- **Tempo médio** de execução por suite
- **Cobertura** de dispositivos testados
- **Frequência** de falhas por tipo de teste
- **Tempo** de feedback em PRs

### Relatórios Mensais:

1. **Device coverage** - quais dispositivos mais testados
2. **Test stability** - testes com maior taxa de falha
3. **Performance trends** - tempo de execução ao longo do tempo
4. **Cost analysis** - minutos consumidos vs valor gerado

## 🤝 Suporte

### Recursos:

- **BrowserStack Docs**: https://www.browserstack.com/docs/app-automate
- **Detox Docs**: https://wix.github.io/Detox/
- **GitHub Agentic Workflows**: Documentação interna

### Contato:

- **Issues do GitHub**: Para problemas específicos do projeto
- **BrowserStack Support**: Para questões da plataforma
- **Team DevOps**: Para configurações de CI/CD

---

**✅ Configuração completa! Seu app React Native agora roda testes automatizados em dispositivos reais do BrowserStack com relatórios inteligentes e feedback instantâneo.**
