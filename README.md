# Weather App

Aplicação web de previsão do tempo com interface elegante, animada e totalmente responsiva.

## Sobre o projeto

O Weather App é uma aplicação web desenvolvida para consultar as condições climáticas atuais e a previsão do tempo de qualquer cidade do mundo. O projeto combina dados meteorológicos em tempo real com uma interface visual cuidadosamente construída, incluindo cards com borda animada, fundo dinâmico de acordo com o clima e gráfico de temperatura.

## Funcionalidades

- Pesquisa de cidades
- Localização atual
- Temperatura atual
- Sensação térmica
- Previsão por hora
- Previsão dos próximos dias
- Umidade
- Velocidade do vento
- Pressão atmosférica
- Índice UV
- Visibilidade
- Nascer e pôr do sol
- Gráfico de temperatura
- Alternância Celsius/Fahrenheit
- Interface responsiva
- Estados visuais de clima
- Animações de chuva/tempestade

## Tecnologias

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) (componente `Card`)
- [Recharts](https://recharts.org/) — gráfico de temperatura
- [Lucide React](https://lucide.dev/) — ícones
- [Vercel Analytics](https://vercel.com/analytics)
- API de clima: [Open-Meteo](https://open-meteo.com/)

## API

O projeto consome a [Open-Meteo API](https://open-meteo.com/), uma API pública e gratuita de dados meteorológicos que **não exige chave de autenticação**:

- `GET https://geocoding-api.open-meteo.com/v1/search` — busca e geocodificação de cidades
- `GET https://api.open-meteo.com/v1/forecast` — condições atuais e previsões horária e diária

Toda a integração fica isolada em `services/weatherService.ts`, atrás de uma interface `WeatherService`, o que facilita trocar de provedor no futuro sem alterar componentes ou hooks.

Caso a rede esteja indisponível (modo offline, bloqueio ou limite de requisições), a aplicação cai automaticamente para um gerador de dados mockado determinístico, garantindo que a interface nunca quebre.

É possível forçar o modo mockado (útil para desenvolvimento offline) através de uma variável de ambiente opcional, definida em um arquivo `.env.local` (não versionado):

```bash
NEXT_PUBLIC_USE_MOCK_WEATHER=1
```

Nenhuma chave de API ou credencial é necessária para rodar o projeto.

## Instalação

```bash
git clone https://github.com/seu-usuario/weather-app.git
cd weather-app
npm install
npm run dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

### Build de produção

```bash
npm run build
npm run start
```
