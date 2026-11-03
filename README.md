# Loja Compre Bem

Repositório com as duas partes do projeto:

- `api/`: API REST em Spring Boot (Java), com listagem de produtos paginada.
- `app/`: app mobile em React Native com Expo, que consome a API.

## Como rodar

1. Suba a API primeiro:

   ```bash
   cd api
   ./mvnw spring-boot:run
   ```

   A API fica em `http://localhost:8080/api/v1/produtos` e já cria 60 produtos de teste.
   A documentação do Swagger fica em `http://localhost:8080/swagger-ui.html`.

2. Em outro terminal, rode o app:

   ```bash
   cd app
   npm install
   npx expo start
   ```

O endereço da API usado pelo app fica no topo de `app/api.ts`.
No emulador Android ele usa `10.0.2.2:8080`. No celular com Expo Go, troque pelo IP do computador na rede.
