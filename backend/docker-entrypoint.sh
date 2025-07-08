#!/bin/sh

# Script de inicialização para container Docker
# Sistema de Gestão de Agentes Voluntários v2.0
# Compatível com Oracle Cloud Infrastructure

set -e

# Função para log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando Sistema de Gestão de Agentes Voluntários v2.0"

# Verificar variáveis de ambiente obrigatórias
check_required_env() {
    local required_vars=(
        "ORACLE_DB_HOST"
        "ORACLE_DB_USER"
        "ORACLE_DB_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log "ERRO: Variável de ambiente $var não definida"
            exit 1
        fi
    done
}

# Aguardar banco de dados ficar disponível
wait_for_database() {
    log "Aguardando banco de dados Oracle ficar disponível..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if java -cp app.jar org.springframework.boot.loader.JarLauncher \
           --spring.datasource.url="jdbc:oracle:thin:@${ORACLE_DB_HOST}:${ORACLE_DB_PORT:-1521}:${ORACLE_DB_SERVICE:-ORCL}" \
           --spring.datasource.username="${ORACLE_DB_USER}" \
           --spring.datasource.password="${ORACLE_DB_PASSWORD}" \
           --spring.datasource.driver-class-name=oracle.jdbc.OracleDriver \
           --spring.jpa.hibernate.ddl-auto=validate \
           --logging.level.root=ERROR \
           --spring.main.web-application-type=none \
           --spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration 2>/dev/null; then
            log "Banco de dados Oracle está disponível!"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Banco não disponível, aguardando 10s..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log "ERRO: Não foi possível conectar ao banco de dados após $max_attempts tentativas"
    exit 1
}

# Configurar OCI se credenciais estiverem disponíveis
setup_oci() {
    if [ -f "/app/.oci/config" ]; then
        log "Configuração OCI encontrada, configurando cliente..."
        export OCI_CONFIG_FILE="/app/.oci/config"
        export OCI_CONFIG_PROFILE="${OCI_PROFILE:-DEFAULT}"
    else
        log "Configuração OCI não encontrada, usando variáveis de ambiente"
    fi
}

# Configurar logs
setup_logging() {
    # Criar diretório de logs se não existir
    mkdir -p /app/logs
    
    # Configurar rotação de logs
    export LOGGING_FILE_NAME="/app/logs/agentes-voluntarios.log"
    export LOGGING_PATTERN_FILE="%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{traceId}] %logger{36} - %msg%n"
}

# Configurar JVM para container
setup_jvm() {
    # Configurações específicas para container
    export JAVA_OPTS="$JAVA_OPTS -Djava.security.egd=file:/dev/./urandom"
    export JAVA_OPTS="$JAVA_OPTS -Dspring.jmx.enabled=false"
    export JAVA_OPTS="$JAVA_OPTS -Dmanagement.endpoints.jmx.exposure.exclude=*"
    
    # Configurações para Oracle JDBC
    export JAVA_OPTS="$JAVA_OPTS -Doracle.jdbc.fanEnabled=false"
    export JAVA_OPTS="$JAVA_OPTS -Doracle.net.disableOob=true"
    
    # Configurações de timezone
    export JAVA_OPTS="$JAVA_OPTS -Duser.timezone=America/Sao_Paulo"
    
    log "JVM configurada: $JAVA_OPTS"
}

# Função principal
main() {
    log "Verificando configuração..."
    check_required_env
    
    log "Configurando ambiente..."
    setup_oci
    setup_logging
    setup_jvm
    
    log "Verificando conectividade com banco de dados..."
    wait_for_database
    
    log "Iniciando aplicação Spring Boot..."
    
    # Executar comando passado como parâmetro
    exec "$@"
}

# Executar função principal com todos os argumentos
main "$@"

