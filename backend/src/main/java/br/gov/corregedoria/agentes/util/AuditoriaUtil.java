package br.gov.corregedoria.agentes.util;

import br.gov.corregedoria.agentes.entity.LogAuditoria;
import br.gov.corregedoria.agentes.repository.LogAuditoriaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class AuditoriaUtil {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditoriaUtil.class);

    @Autowired
    private LogAuditoriaRepository logRepository;

    /**
     * Registra um log de auditoria
     * RNF003 - Toda ação realizada no sistema deve ser registrada em logs de auditoria
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarLog(String usuario, String tipoOperacao, String detalhes) {
        String ipOrigem = obterIpOrigem();
        try {
            LogAuditoria log = new LogAuditoria(usuario, tipoOperacao, detalhes, ipOrigem);
            // salva e força flush para capturar erros aqui e não no commit da transação chamadora
            logRepository.saveAndFlush(log);
        } catch (Exception e) {
            // Não deve derrubar o fluxo de negócio por falha de auditoria (ex.: schema incorreto em DEV)
            try {
                LOGGER.warn("Falha ao registrar auditoria ({} - {}): {}", usuario, tipoOperacao, e.getMessage());
            } catch (Exception ignored) {
                // Evita qualquer ruído adicional
            }
        }
    }

    /**
     * Obtém o IP de origem da requisição atual
     */
    private String obterIpOrigem() {
        try {
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attr.getRequest();
            
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }
            
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "IP_NAO_DISPONIVEL";
        }
    }
}
