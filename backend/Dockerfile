# Dockerfile para Backend - Otimizado para Oracle Cloud Infrastructure
# Sistema de Gestão de Agentes Voluntários v2.0

# Estágio 1: Build da aplicação
FROM maven:3.9.4-eclipse-temurin-17 AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do Maven
COPY pom.xml .
COPY src ./src

# Build da aplicação (pular testes para build mais rápido)
RUN mvn clean package -DskipTests

# Estágio 2: Runtime otimizado
FROM eclipse-temurin:17-jre-alpine

# Metadados da imagem
LABEL maintainer="TJMG - Corregedoria da Infância e Juventude"
LABEL version="2.0"
LABEL description="Sistema de Gestão de Agentes Voluntários - Backend"
LABEL oracle.cloud.compatible="true"

# Instalar dependências necessárias
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configurar timezone para São Paulo
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Criar diretórios necessários
RUN mkdir -p /app/logs /app/.oci /app/uploads && \
    chown -R appuser:appgroup /app

# Definir diretório de trabalho
WORKDIR /app

# Copiar JAR da aplicação do estágio de build
COPY --from=builder /app/target/agentes-voluntarios-*.jar app.jar

# Copiar script de inicialização
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && \
    chown appuser:appgroup /app/docker-entrypoint.sh

# Configurar permissões
RUN chown -R appuser:appgroup /app

# Mudar para usuário não-root
USER appuser

# Expor porta da aplicação
EXPOSE 8080

# Configurar variáveis de ambiente para JVM
ENV JAVA_OPTS="-Xms512m -Xmx1g -XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENV SPRING_PROFILES_ACTIVE=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Comando de inicialização
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["java", "-jar", "app.jar"]

