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

    @Value("${app.dev-base-url}")
    private String devBaseUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sistema de Gestão de Agentes Voluntários")
                        .description("API para gestão de agentes voluntários da infância e juventude")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Corregedoria")
                                .email("suporte@corregedoria.tjmg.jus.br"))
                        .license(new License()
                                .name("Propriedade da Corregedoria")
                                .url(baseUrl)))
                .servers(List.of(
                        new Server().url(baseUrl).description("Servidor de Produção"),
                        new Server().url(devBaseUrl).description("Servidor de Desenvolvimento")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT obtido via Keycloak")));
    }
}
