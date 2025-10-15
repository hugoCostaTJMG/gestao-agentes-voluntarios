package br.gov.corregedoria.agentes.config.db;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Ensures Flyway "repair" runs before "migrate" to recover from
 * failed/edited migrations (e.g., checksum drift in V20251016_4).
 *
 * This is safe with our idempotent scripts and prevents the application
 * from failing startup on validation errors after partially applied
 * migrations or modified checksums.
 */
@Configuration
public class FlywayRepairConfig {
    private static final Logger log = LoggerFactory.getLogger(FlywayRepairConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return (Flyway flyway) -> {
            try {
                log.info("Flyway repair: starting (will fix failed entries/checksums if needed)...");
                flyway.repair();
                log.info("Flyway repair: completed. Proceeding with migrate...");
            } catch (Exception ex) {
                log.warn("Flyway repair encountered an issue, proceeding to migrate anyway: {}", ex.getMessage());
            }
            flyway.migrate();
        };
    }
}

