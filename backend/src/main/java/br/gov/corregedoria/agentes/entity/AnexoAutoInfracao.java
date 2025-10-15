package br.gov.corregedoria.agentes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidade que representa um anexo (documento ou imagem) de um Auto de Infração
 * 
 * RN009 - Anexos: Sistema deve permitir upload de arquivos tipo documentos e imagens
 */
@Entity
@Table(name = "anexo_auto_infracao")
public class AnexoAutoInfracao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "S_ANEXO_AUTO")
    @SequenceGenerator(name = "S_ANEXO_AUTO", sequenceName = "S_ANEXO_AUTO", allocationSize = 1)
    private Long id;
    
    @NotNull(message = "Auto de infração é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auto_infracao_id", nullable = false)
    private AutoInfracao autoInfracao;
    
    @NotBlank(message = "Nome do arquivo é obrigatório")
    @Size(max = 255, message = "Nome do arquivo deve ter no máximo 255 caracteres")
    @Column(name = "nome_arquivo", nullable = false, length = 255)
    private String nomeArquivo;
    
    @NotBlank(message = "Nome original do arquivo é obrigatório")
    @Size(max = 255, message = "Nome original deve ter no máximo 255 caracteres")
    @Column(name = "nome_original", nullable = false, length = 255)
    private String nomeOriginal;
    
    @NotBlank(message = "Tipo do arquivo é obrigatório")
    @Size(max = 100, message = "Tipo do arquivo deve ter no máximo 100 caracteres")
    @Column(name = "tipo_arquivo", nullable = false, length = 100)
    private String tipoArquivo;
    
    @NotNull(message = "Tamanho do arquivo é obrigatório")
    @Min(value = 1, message = "Tamanho do arquivo deve ser maior que 0")
    @Max(value = 10485760, message = "Tamanho do arquivo deve ser menor que 10MB")
    @Column(name = "tamanho_arquivo", nullable = false)
    private Long tamanhoArquivo;
    
    @NotBlank(message = "Caminho do arquivo é obrigatório")
    @Size(max = 500, message = "Caminho deve ter no máximo 500 caracteres")
    @Column(name = "caminho_arquivo", nullable = false, length = 500)
    private String caminhoArquivo;
    
    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    @Column(name = "descricao", length = 500)
    private String descricao;
    
    @CreationTimestamp
    @Column(name = "data_upload", nullable = false, updatable = false)
    private LocalDateTime dataUpload;
    
    @NotBlank(message = "Usuário do upload é obrigatório")
    @Size(max = 100, message = "Usuário deve ter no máximo 100 caracteres")
    @Column(name = "usuario_upload", nullable = false, updatable = false, length = 100)
    private String usuarioUpload;
    
    // === CONSTRUTORES ===
    
    public AnexoAutoInfracao() {}
    
    public AnexoAutoInfracao(AutoInfracao autoInfracao, String nomeArquivo, String nomeOriginal, 
                           String tipoArquivo, Long tamanhoArquivo, String caminhoArquivo, 
                           String usuarioUpload) {
        this.autoInfracao = autoInfracao;
        this.nomeArquivo = nomeArquivo;
        this.nomeOriginal = nomeOriginal;
        this.tipoArquivo = tipoArquivo;
        this.tamanhoArquivo = tamanhoArquivo;
        this.caminhoArquivo = caminhoArquivo;
        this.usuarioUpload = usuarioUpload;
    }
    
    // === MÉTODOS DE NEGÓCIO ===
    
    /**
     * Verifica se o arquivo é uma imagem
     */
    public boolean isImagem() {
        return tipoArquivo != null && 
               (tipoArquivo.startsWith("image/") || 
                tipoArquivo.equals("application/octet-stream") && 
                nomeOriginal != null && 
                (nomeOriginal.toLowerCase().endsWith(".jpg") ||
                 nomeOriginal.toLowerCase().endsWith(".jpeg") ||
                 nomeOriginal.toLowerCase().endsWith(".png") ||
                 nomeOriginal.toLowerCase().endsWith(".gif")));
    }
    
    /**
     * Verifica se o arquivo é um documento
     */
    public boolean isDocumento() {
        return tipoArquivo != null && 
               (tipoArquivo.equals("application/pdf") ||
                tipoArquivo.equals("application/msword") ||
                tipoArquivo.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                tipoArquivo.equals("text/plain"));
    }
    
    /**
     * Retorna o tamanho formatado em KB ou MB
     */
    public String getTamanhoFormatado() {
        if (tamanhoArquivo == null) return "0 KB";
        
        if (tamanhoArquivo < 1024) {
            return tamanhoArquivo + " bytes";
        } else if (tamanhoArquivo < 1024 * 1024) {
            return String.format("%.1f KB", tamanhoArquivo / 1024.0);
        } else {
            return String.format("%.1f MB", tamanhoArquivo / (1024.0 * 1024.0));
        }
    }
    
    // === GETTERS E SETTERS ===
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public AutoInfracao getAutoInfracao() {
        return autoInfracao;
    }
    
    public void setAutoInfracao(AutoInfracao autoInfracao) {
        this.autoInfracao = autoInfracao;
    }
    
    public String getNomeArquivo() {
        return nomeArquivo;
    }
    
    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }
    
    public String getNomeOriginal() {
        return nomeOriginal;
    }
    
    public void setNomeOriginal(String nomeOriginal) {
        this.nomeOriginal = nomeOriginal;
    }
    
    public String getTipoArquivo() {
        return tipoArquivo;
    }
    
    public void setTipoArquivo(String tipoArquivo) {
        this.tipoArquivo = tipoArquivo;
    }
    
    public Long getTamanhoArquivo() {
        return tamanhoArquivo;
    }
    
    public void setTamanhoArquivo(Long tamanhoArquivo) {
        this.tamanhoArquivo = tamanhoArquivo;
    }
    
    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }
    
    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public LocalDateTime getDataUpload() {
        return dataUpload;
    }
    
    public void setDataUpload(LocalDateTime dataUpload) {
        this.dataUpload = dataUpload;
    }
    
    public String getUsuarioUpload() {
        return usuarioUpload;
    }
    
    public void setUsuarioUpload(String usuarioUpload) {
        this.usuarioUpload = usuarioUpload;
    }
}
