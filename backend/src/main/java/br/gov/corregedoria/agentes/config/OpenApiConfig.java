package br.gov.corregedoria.agentes.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${app.base-url}")
    private String baseUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sistema de Gestão de Agentes Voluntários")
                        .description("API para gestão de agentes voluntários da infância e juventude")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Corregedoria")
                                .email("suporte@corregedoria.gov.br"))
                        .license(new License()
                                .name("Propriedade da Corregedoria")
                                .url("https://corregedoria.gov.br")))
                .servers(List.of(
                        new Server().url(baseUrl).description("Servidor de Produção"),
                        new Server().url("http://localhost:8080").description("Servidor de Desenvolvimento")))
                .addSecurityItem(new SecurityRequirement()
                        .addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .description("Insira um bearer token valido para prosseguir")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .name("security")
                                        .description("Token JWT obtido via Keycloak")));
    }
}

