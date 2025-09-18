package br.gov.corregedoria.agentes.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Controller
@RequestMapping("/auth/keycloak")
public class KeycloakAuthController {

    private final OAuth2AuthorizedClientService authorizedClientService;

    @Value("${keycloak.public-base-url}")
    private String keycloakPublicBaseUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
    private String clientSecret;
    @Value("${keycloak.internal-base-url}")
    private String keycloakInternalBaseUrl;

    @Value("${app.frontend.redirect-uri}")
    private String frontendRedirectUri;

    public KeycloakAuthController(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    /**
     * Inicia o fluxo de autenticação OIDC do Keycloak via Spring Security.
     * Redireciona para a rota padrão configurada pelo Spring: /oauth2/authorization/keycloak
     */
    @GetMapping("/login")
    public void iniciarLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.FOUND.value());
        // Propaga a query string (ex.: force=true) para o endpoint do Spring Security
        String qs = request.getQueryString();
        String location = "/oauth2/authorization/keycloak" + (qs != null && !qs.isBlank() ? ("?" + qs) : "");
        response.setHeader("Location", location);
    }

    /**
     * Logout single sign-out: invalida sessão local e chama o logout do Keycloak (RP-initiated logout).
     */
    @GetMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String redirect = frontendRedirectUri;
        String endSession = keycloakPublicBaseUrl + "/realms/" + realm + "/protocol/openid-connect/logout";

        // Para compatibilidade com consoles Keycloak legados, use apenas redirect_uri
        StringBuilder url = new StringBuilder(endSession)
                .append("?client_id=").append(URLEncoder.encode(clientId, StandardCharsets.UTF_8))
                .append("&redirect_uri=").append(URLEncoder.encode(redirect, StandardCharsets.UTF_8));

        // Tenta obter id_token_hint da sessão atual ou do cookie (caso não haja sessão)
        String idTokenHint = null;
        try {
            if (authentication instanceof OAuth2AuthenticationToken oauth2) {
                Object principal = oauth2.getPrincipal();
                if (principal instanceof OidcUser oidcUser && oidcUser.getIdToken() != null) {
                    idTokenHint = oidcUser.getIdToken().getTokenValue();
                }
            }
        } catch (Exception ignored) { }

        if (idTokenHint == null && request.getCookies() != null) {
            for (var c : request.getCookies()) {
                if ("ID_TOKEN_HINT".equals(c.getName())) {
                    idTokenHint = java.net.URLDecoder.decode(c.getValue(), java.nio.charset.StandardCharsets.UTF_8);
                }
            }
        }

        if (idTokenHint != null) {
            url.append("&id_token_hint=").append(URLEncoder.encode(idTokenHint, StandardCharsets.UTF_8));
        }

        // Backchannel logout (encerra sessão no servidor do Keycloak pelo refresh_token, se disponível)
        try {
            if (authentication instanceof OAuth2AuthenticationToken oauth2) {
                String registrationId = oauth2.getAuthorizedClientRegistrationId();
                OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(registrationId, oauth2.getName());
                if (client != null && client.getRefreshToken() != null) {
                    String refreshToken = client.getRefreshToken().getTokenValue();
                    String backchannelUrl = keycloakInternalBaseUrl + "/realms/" + realm + "/protocol/openid-connect/logout";
                    RestTemplate rest = new RestTemplate();
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
                    form.add("client_id", clientId);
                    if (clientSecret != null && !clientSecret.isBlank()) form.add("client_secret", clientSecret);
                    form.add("refresh_token", refreshToken);
                    HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);
                    try { rest.postForEntity(backchannelUrl, entity, String.class); } catch (Exception ignored2) {}
                }
            }
        } catch (Exception ignored) { }

        // Invalida sessão local após capturar tokens
        if (request.getSession(false) != null) {
            try { request.getSession(false).invalidate(); } catch (Exception ignored) {}
        }

        // Remove o client autorizado (acessos em cache)
        if (authentication instanceof OAuth2AuthenticationToken oauth2) {
            String registrationId = oauth2.getAuthorizedClientRegistrationId();
            try { authorizedClientService.removeAuthorizedClient(registrationId, oauth2.getName()); } catch (Exception ignored) {}
        }

        // Apaga cookie auxiliar de id_token
        response.addHeader("Set-Cookie", "ID_TOKEN_HINT=; Path=/auth/keycloak; Max-Age=0; HttpOnly; SameSite=Lax");
        // Sugere ao navegador limpar cookies/armazenamentos do backend (mesmo origin)
        response.setHeader("Clear-Site-Data", "\"cookies\", \"storage\"");

        response.setStatus(HttpStatus.FOUND.value());
        response.setHeader("Location", url.toString());
    }
}
