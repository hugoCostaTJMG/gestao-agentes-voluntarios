package br.gov.corregedoria.agentes.controller;

import br.gov.corregedoria.agentes.entity.AnexoAutoInfracao;
import br.gov.corregedoria.agentes.entity.AutoInfracao;
import br.gov.corregedoria.agentes.repository.AnexoAutoInfracaoRepository;
import br.gov.corregedoria.agentes.repository.AutoInfracaoRepository;
import br.gov.corregedoria.agentes.util.AuditoriaUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Tag(name = "Anexos", description = "Upload e download de anexos de Autos de Infração")
@CrossOrigin(origins = "*")
public class AnexoAutoInfracaoController {

    private final AnexoAutoInfracaoRepository anexoRepo;
    private final AutoInfracaoRepository autoRepo;
    private final AuditoriaUtil auditoriaUtil;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    private static final long MAX_SIZE = 10L * 1024L * 1024L; // 10MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/gif"
    );

    public AnexoAutoInfracaoController(AnexoAutoInfracaoRepository anexoRepo,
                                       AutoInfracaoRepository autoRepo,
                                       AuditoriaUtil auditoriaUtil) {
        this.anexoRepo = anexoRepo;
        this.autoRepo = autoRepo;
        this.auditoriaUtil = auditoriaUtil;
    }

    @Operation(summary = "Listar anexos do auto")
    @GetMapping("/autos/{autoId}/anexos")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<List<AnexoAutoInfracao>> listar(@PathVariable Long autoId) {
        List<AnexoAutoInfracao> anexos = anexoRepo.findByAutoInfracao_IdOrderByDataUploadDesc(autoId);
        return ResponseEntity.ok(anexos);
    }

    @Operation(summary = "Upload de anexo para auto")
    @PostMapping(value = "/autos/{autoId}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<AnexoAutoInfracao> upload(@PathVariable Long autoId,
                                                    @RequestParam("arquivo") MultipartFile arquivo,
                                                    @RequestParam(value = "descricao", required = false) String descricao,
                                                    Authentication authentication) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (arquivo.getSize() > MAX_SIZE) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        AutoInfracao auto = autoRepo.findById(autoId)
                .orElseThrow(() -> new EntityNotFoundException("Auto não encontrado: " + autoId));

        // Gera pasta e nome do arquivo
        Path basePath = Paths.get(uploadsDir, "autos", String.valueOf(autoId));
        Files.createDirectories(basePath);
        String original = StringUtils.cleanPath(arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "arquivo");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String nomeArmazenado = UUID.randomUUID() + ext;
        Path destino = basePath.resolve(nomeArmazenado);
        Files.copy(arquivo.getInputStream(), destino);

        AnexoAutoInfracao anexo = new AnexoAutoInfracao();
        anexo.setAutoInfracao(auto);
        anexo.setNomeArquivo(nomeArmazenado);
        anexo.setNomeOriginal(original);
        anexo.setTipoArquivo(contentType);
        anexo.setTamanhoArquivo(arquivo.getSize());
        anexo.setCaminhoArquivo(destino.toString());
        anexo.setDescricao(descricao);
        anexo.setUsuarioUpload(authentication != null ? authentication.getName() : "anon");
        anexo.setDataUpload(LocalDateTime.now());

        AnexoAutoInfracao salvo = anexoRepo.save(anexo);
        auditoriaUtil.registrarLog(anexo.getUsuarioUpload(), "UPLOAD_ANEXO", "Auto: " + autoId + ", anexo: " + salvo.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @Operation(summary = "Download de anexo")
    @GetMapping("/anexos/{anexoId}/download")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<byte[]> download(@PathVariable Long anexoId) throws IOException {
        AnexoAutoInfracao anexo = anexoRepo.findById(anexoId)
                .orElseThrow(() -> new EntityNotFoundException("Anexo não encontrado: " + anexoId));
        Path path = Paths.get(anexo.getCaminhoArquivo());
        if (!Files.exists(path)) {
            return ResponseEntity.notFound().build();
        }
        byte[] bytes = Files.readAllBytes(path);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(anexo.getTipoArquivo()));
        headers.setContentLength(bytes.length);
        headers.setContentDispositionFormData("attachment", anexo.getNomeOriginal());
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @Operation(summary = "Excluir anexo")
    @DeleteMapping("/anexos/{anexoId}")
    @PreAuthorize("hasRole('CORREGEDORIA') or hasRole('AGENTE')")
    public ResponseEntity<Void> excluir(@PathVariable Long anexoId, Authentication authentication) throws IOException {
        AnexoAutoInfracao anexo = anexoRepo.findById(anexoId)
                .orElseThrow(() -> new EntityNotFoundException("Anexo não encontrado: " + anexoId));
        Path path = Paths.get(anexo.getCaminhoArquivo());
        try {
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } finally {
            anexoRepo.delete(anexo);
        }
        String user = authentication != null ? authentication.getName() : "anon";
        auditoriaUtil.registrarLog(user, "EXCLUIR_ANEXO", "Anexo: " + anexoId + " removido");
        return ResponseEntity.noContent().build();
    }
}
