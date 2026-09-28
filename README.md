# 💰 Gestão Financeira

Aplicativo de **gestão financeira pessoal** desenvolvido para facilitar o controle de receitas, despesas, metas e contas, permitindo ao usuário acompanhar sua vida financeira de forma simples e intuitiva.

O projeto possui suporte à sincronização com **Firebase** e funcionamento offline, permitindo registrar e consultar informações mesmo sem conexão com a internet.

---

## 🚀 Funcionalidades

### 💵 Receitas

* Cadastro de receitas;
* Salário como renda principal;
* Cadastro de outras fontes de renda;
* Investimentos;
* Vendas;
* Bicos e trabalhos extras;
* Categorização das receitas.

### 💸 Despesas

* Cadastro de despesas;
* Categorias personalizadas;
* Controle de valores e datas;
* Identificação de despesas realizadas no cartão de crédito;
* Edição e exclusão de movimentações.

### 🔄 Despesas recorrentes

* Cadastro de despesas recorrentes;
* Geração/controle automático das ocorrências futuras;
* Periodicidade mensal, semanal ou anual;
* Possibilidade de pausar, retomar e encerrar recorrências;
* Consideração automática das despesas recorrentes nos cálculos financeiros.

### 💳 Cartão de crédito

As despesas podem ser identificadas como gastos realizados no cartão de crédito.

Essa informação permite gerar futuramente relatórios específicos, como:

* Total gasto no cartão;
* Gastos por categoria;
* Gastos por período;
* Evolução dos gastos no cartão.

A arquitetura também foi preparada para futuras funcionalidades relacionadas a cartões, como faturas, limites e parcelamentos.

### 🎯 Metas financeiras

* Criação de metas;
* Definição de valor objetivo;
* Registro de contribuições;
* Acompanhamento do progresso;
* Data limite opcional.

### 📊 Relatórios

* Receitas x despesas;
* Despesas por categoria;
* Evolução do saldo;
* Evolução das despesas;
* Evolução das receitas;
* Gastos no cartão de crédito;
* Acompanhamento das metas.

### 🏦 Contas

* Cadastro de contas financeiras;
* Conta corrente;
* Poupança;
* Carteira;
* Bancos digitais;
* Investimentos;
* Controle de saldo por conta.

### 📋 Extrato

* Visualização das movimentações;
* Filtros por período;
* Filtros por categoria;
* Filtros por conta;
* Filtro de gastos no cartão;
* Edição e exclusão de movimentações.

---

## 📱 Dashboard

A tela inicial apresenta um resumo da situação financeira do usuário:

* Saldo atual;
* Receitas;
* Despesas;
* Despesas recorrentes;
* Gastos no cartão;
* Principais categorias de despesas;
* Metas em andamento;
* Últimas movimentações.

---

## ☁️ Firebase

O projeto utiliza o **Firebase** para autenticação e armazenamento dos dados.

Cada usuário possui seus próprios dados financeiros, garantindo isolamento entre as contas.

Principais recursos utilizados:

* Firebase Authentication;
* Cloud Firestore;
* Regras de segurança por usuário.

---

## 📡 Funcionamento offline

O aplicativo foi projetado para continuar funcionando mesmo quando não houver conexão com a internet.

Enquanto estiver offline, o usuário poderá:

* Consultar seus dados;
* Cadastrar receitas;
* Cadastrar despesas;
* Cadastrar despesas recorrentes;
* Criar metas;
* Registrar contribuições;
* Editar informações;
* Excluir movimentações.

As alterações realizadas offline serão armazenadas localmente e sincronizadas com o Firebase quando a conexão for restabelecida.

### Status de sincronização

O aplicativo deverá indicar estados como:

* 🟢 Online;
* 🔴 Offline;
* 🔄 Sincronizando;
* ✅ Sincronizado.

---

## 🛠️ Tecnologias

* **React Native**
* **Expo**
* **TypeScript**
* **Firebase**
* **Cloud Firestore**
* **Firebase Authentication**
* **AsyncStorage / armazenamento local**
* Biblioteca de gráficos
* Biblioteca de navegação

---

## 🗂️ Estrutura do projeto

O projeto segue uma estrutura modular, buscando separar as responsabilidades da aplicação.

```text
src/
├── components/
├── screens/
├── navigation/
├── services/
│   ├── firebase/
│   └── storage/
├── hooks/
├── contexts/
├── models/
├── types/
├── utils/
└── theme/
```

A estrutura poderá evoluir conforme novas funcionalidades forem adicionadas.

---

## 🎨 Interface

O aplicativo utiliza uma abordagem **mobile-first**, priorizando:

* Interface limpa;
* Navegação simples;
* Componentes reutilizáveis;
* Feedback visual;
* Hierarquia de informações;
* Formatação brasileira de valores e datas.

Valores monetários seguem o padrão:

```text
R$ 1.234,56
```

Datas seguem o padrão:

```text
DD/MM/AAAA
```

---

## 🔮 Próximas funcionalidades

Algumas funcionalidades planejadas para versões futuras:

* [ ] Controle completo de cartões de crédito;
* [ ] Faturas;
* [ ] Limite de cartão;
* [ ] Compras parceladas;
* [ ] Investimentos;
* [ ] Notificações;
* [ ] Exportação de relatórios;
* [ ] Backup e restauração;
* [ ] Importação de dados;

---

## ⚙️ Instalação

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
```

Entre na pasta:

```bash
cd seu-repositorio
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npx expo start
```

---

## 🔐 Configuração do Firebase

Para executar o projeto localmente, será necessário configurar um projeto no Firebase e adicionar as respectivas credenciais/configurações.

As informações sensíveis não devem ser versionadas no Git.

Utilize variáveis de ambiente ou o mecanismo recomendado pelo Expo para armazenar configurações sensíveis.

---

## 📌 Status do projeto

🚧 **Em desenvolvimento**

O projeto está sendo desenvolvido de forma incremental, começando pelas funcionalidades principais de gestão financeira e evoluindo posteriormente para recursos mais avançados.

---

## 👨‍💻 Autor

Desenvolvido por **Alison Silva**.

---

## 📄 Licença

Este projeto ainda não possui uma licença definida.
