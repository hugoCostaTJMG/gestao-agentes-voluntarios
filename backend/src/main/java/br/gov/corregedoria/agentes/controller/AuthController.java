package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.dto.UsuarioDTO;
import br.gov.corregedoria.agentes.entity.AgenteVoluntario;
import br.gov.corregedoria.agentes.repository.AgenteVoluntarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import br.gov.corregedoria.agentes.util.DocumentoUtil;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Informações do usuário autenticado")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AgenteVoluntarioRepository agenteRepository;

    public AuthController(AgenteVoluntarioRepository agenteRepository) {
        this.agenteRepository = agenteRepository;
    }

    @Operation(summary = "Dados do usuário atual")
    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> me(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }

        UsuarioDTO dto = new UsuarioDTO();
        dto.setKeycloakId(jwt.getSubject());

        // nome e email do token (quando disponíveis)
        String name = getStringClaim(jwt, "name");
        if (name == null) {
            String given = getStringClaim(jwt, "given_name");
            String family = getStringClaim(jwt, "family_name");
            name = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
        }
        dto.setNome(name != null ? name : "");
        dto.setEmail(getStringClaim(jwt, "email", ""));

        // extrai roles para determinar o perfil funcional
        Set<String> roles = extractRoles(jwt);
        if (roles.contains("CORREGEDORIA")) {
            dto.setPerfil("CORREGEDORIA");
        } else if (roles.contains("COMARCA")) {
            dto.setPerfil("COMARCA");
        } else if (roles.contains("AGENTE")) {
            dto.setPerfil("AGENTE");
        } else {
            dto.setPerfil(roles.stream().findFirst().orElse(""));
        }

        // tenta obter CPF do token
        String cpf = getStringClaim(jwt, "cpf");
        if (cpf == null) {
            // fallback para possíveis mapeamentos customizados
            cpf = getStringClaim(jwt, "documento");
        }
        String cpfClean = DocumentoUtil.cleanDigits(cpf);
        dto.setCpf(cpfClean);

        // Se perfil AGENTE, valida existência no banco por CPF
        if ("AGENTE".equalsIgnoreCase(dto.getPerfil())) {
            if (cpfClean == null || cpfClean.isBlank()) {
                return ResponseEntity.status(404).build();
            }
            return agenteRepository.findByCpf(cpfClean)
                    .map(agente -> {
                        fillFromAgente(dto, agente);
                        return ResponseEntity.ok(dto);
                    })
                    .orElseGet(() -> ResponseEntity.status(404).build());
        }

        // Não-AGENTE: retorna informações básicas do token
        return ResponseEntity.ok(dto);
    }

    private static void fillFromAgente(UsuarioDTO dto, AgenteVoluntario agente) {
        dto.setId(agente.getId());
        if (agente.getNomeCompleto() != null && !agente.getNomeCompleto().isBlank()) {
            dto.setNome(agente.getNomeCompleto());
        }
        if (agente.getEmail() != null && !agente.getEmail().isBlank()) {
            dto.setEmail(agente.getEmail());
        }
        dto.setTelefone(agente.getTelefone());
    }

    private static String getStringClaim(Jwt jwt, String name) {
        Object v = jwt.getClaims().get(name);
        return v instanceof String ? (String) v : null;
    }

    private static String getStringClaim(Jwt jwt, String name, String def) {
        String v = getStringClaim(jwt, name);
        return v != null ? v : def;
    }

    private static Set<String> extractRoles(Jwt jwt) {
        Set<String> roles = new HashSet<>();
        Object realmAccess = jwt.getClaims().get("realm_access");
        if (realmAccess instanceof Map<?, ?> map && map.get("roles") instanceof Collection<?> rs) {
            for (Object r : rs) if (r instanceof String s) roles.add(s.toUpperCase());
        }
        Object resourceAccess = jwt.getClaims().get("resource_access");
        if (resourceAccess instanceof Map<?, ?> res) {
            for (Object v : res.values()) {
                if (v instanceof Map<?, ?> m && m.get("roles") instanceof Collection<?> r2) {
                    for (Object r : r2) if (r instanceof String s) roles.add(s.toUpperCase());
                }
            }
        }
        return roles;
    }
}
