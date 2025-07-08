package br.gov.corregedoria.agentes.util;

import br.gov.corregedoria.agentes.entity.LogAuditoria;
import br.gov.corregedoria.agentes.repository.LogAuditoriaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class AuditoriaUtil {

    @Autowired
    private LogAuditoriaRepository logRepository;

    /**
     * Registra um log de auditoria
     * RNF003 - Toda ação realizada no sistema deve ser registrada em logs de auditoria
     */
    public void registrarLog(String usuario, String tipoOperacao, String detalhes) {
        String ipOrigem = obterIpOrigem();
        
        LogAuditoria log = new LogAuditoria(usuario, tipoOperacao, detalhes, ipOrigem);
        logRepository.save(log);
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

