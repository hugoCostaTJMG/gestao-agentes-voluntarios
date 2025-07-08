package br.gov.corregedoria.agentes.service;

import br.gov.corregedoria.agentes.dto.AgenteVoluntarioResponseDTO;
import br.gov.corregedoria.agentes.dto.LoginGovBrDTO;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Transactional
public class GovBrAuthService {

    @Autowired
    private AgenteVoluntarioRepository agenteRepository;

    @Autowired
    private AgenteVoluntarioService agenteService;

    @Autowired
    private AuditoriaUtil auditoriaUtil;

    @Value("${app.govbr.api-url:https://sso.staging.acesso.gov.br}")
    private String govBrApiUrl;

    @Value("${app.govbr.client-id}")
    private String clientId;

    @Value("${app.govbr.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Autentica um agente via gov.br
     * RN008 - Validação de CPF gov.br
     */
    public AgenteVoluntarioResponseDTO autenticarViaGovBr(LoginGovBrDTO loginDto) {
        try {
            // 1. Validar token com gov.br e obter dados do usuário
            Map<String, Object> dadosGovBr = validarTokenGovBr(loginDto.getGovBrToken());
            
            String cpfGovBr = (String) dadosGovBr.get("cpf");
            String nomeGovBr = (String) dadosGovBr.get("name");
            String emailGovBr = (String) dadosGovBr.get("email");

            // 2. Verificar se o CPF existe na base de agentes
            AgenteVoluntario agente = agenteRepository.findByCpf(cpfGovBr)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "CPF não encontrado na base de agentes voluntários"));

            // 3. Registrar log de autenticação
            auditoriaUtil.registrarLog(cpfGovBr, "LOGIN_GOVBR", 
                    "Login realizado via gov.br - Agente: " + agente.getId());

            // 4. Retornar dados do agente
            return agenteService.buscarPorId(agente.getId());

        } catch (Exception e) {
            // Registrar tentativa de login falhada
            auditoriaUtil.registrarLog(loginDto.getCpf(), "LOGIN_GOVBR_FALHA", 
                    "Falha no login via gov.br: " + e.getMessage());
            throw new IllegalArgumentException("Falha na autenticação via gov.br: " + e.getMessage());
        }
    }

    /**
     * Valida o token do gov.br e retorna os dados do usuário
     */
    private Map<String, Object> validarTokenGovBr(String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    govBrApiUrl + "/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new IllegalArgumentException("Token inválido ou expirado");
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Erro ao validar token gov.br: " + e.getMessage());
        }
    }

    /**
     * Verifica se um CPF está cadastrado como agente voluntário
     */
    @Transactional(readOnly = true)
    public boolean cpfCadastradoComoAgente(String cpf) {
        return agenteRepository.existsByCpf(cpf);
    }

    /**
     * Gera URL de redirecionamento para o gov.br
     */
    public String gerarUrlAutorizacaoGovBr(String redirectUri) {
        return String.format(
                "%s/authorize?response_type=code&client_id=%s&redirect_uri=%s&scope=openid+email+profile+govbr_empresa",
                govBrApiUrl, clientId, redirectUri
        );
    }

    /**
     * Troca o código de autorização por um token de acesso
     */
    public String trocarCodigoPorToken(String code, String redirectUri) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(clientId, clientSecret);
            headers.add("Content-Type", "application/x-www-form-urlencoded");

            String body = String.format(
                    "grant_type=authorization_code&code=%s&redirect_uri=%s",
                    code, redirectUri
            );

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    govBrApiUrl + "/token",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            } else {
                throw new IllegalArgumentException("Erro ao obter token de acesso");
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Erro na troca do código por token: " + e.getMessage());
        }
    }
}

