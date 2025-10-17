import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Comarca, AreaAtuacao, AgenteVoluntarioDTO } from '../../models/interfaces';
import { DropdownOption } from '../../shared/components/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { TextAreaComponent } from '../../shared/components/text-area/text-area.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { CpfMaskDirective } from '../../shared/directives/cpf-mask.directive';
import { PhoneMaskDirective } from '../../shared/directives/phone-mask.directive';
import { RgMaskDirective } from '../../shared/directives/rg-mask.directive';

interface Estado {
  sigla: string;
  nome: string;
}

@Component({
  selector: 'app-agente-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ButtonComponent, TextInputComponent, TextAreaComponent, SelectComponent, AlertComponent, CpfMaskDirective, PhoneMaskDirective, RgMaskDirective],
  templateUrl: './agente-cadastro.component.html',
  styleUrls: ['./agente-cadastro.component.scss']
})
export class AgenteCadastroComponent implements OnInit {
  agenteForm: FormGroup;
  comarcas: Comarca[] = [];
  areasAtuacao: AreaAtuacao[] = [];
  comarcasOptions: DropdownOption[] = [];
  areasOptions: DropdownOption[] = [];
  estados: Estado[] = [];
  loading = false;
  isEditMode = false;
  agenteId?: number;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.agenteForm = this.createForm();
  }

  ngOnInit(): void {
    this.carregarComarcas();
    this.carregarAreasAtuacao();
    this.carregarEstados();
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.agenteId = Number(id);
        this.carregarAgente(this.agenteId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, this.cpfValidator()]],
      telefone: ['', [Validators.required, this.telefoneValidator()]],
      email: ['', [Validators.required, Validators.email]],
      // Novos campos
      dataNascimento: [''],
      nacionalidade: [''],
      numeroCarteiraIdentidade: [''],
      dataExpedicaoCI: [''],
      uf: [''],
      naturalidade: [''],
      filiacaoPai: [''],
      filiacaoMae: [''],
      disponibilidade: [''],
      // Agora cada select permite apenas 1 opção; mantemos os nomes para compatibilidade,
      // mas o valor do form é escalar (number) e convertemos para array no envio.
      comarcasIds: [null, [Validators.required]],
      areasAtuacaoIds: [null, [Validators.required]]
    });
  }

  private minLengthArray(min: number) {
    return (control: any) => {
      if (control.value && control.value.length >= min) {
        return null;
      }
      return { minLengthArray: { requiredLength: min, actualLength: control.value ? control.value.length : 0 } };
    };
  }

  carregarComarcas(): void {
    this.apiService.listarComarcas().subscribe({
      next: (comarcas) => {
        this.comarcas = comarcas;
        this.comarcasOptions = (comarcas || []).map(c => ({ label: c.nomeComarca, value: c.id }));
      },
      error: (error) => {
        console.error('Erro ao carregar comarcas:', error);
        this.mostrarErro('Erro ao carregar lista de comarcas');
      }
    });
  }

  carregarAreasAtuacao(): void {
    this.apiService.listarAreasAtuacao().subscribe({
      next: (areas) => {
        this.areasAtuacao = areas;
        this.areasOptions = (areas || []).map(a => ({ label: a.nomeAreaAtuacao, value: a.id }));
      },
      error: (error) => {
        console.error('Erro ao carregar áreas de atuação:', error);
        this.mostrarErro('Erro ao carregar áreas de atuação');
      }
    });
  }

  carregarEstados(): void {
    // Estados brasileiros
    this.estados = [
      { sigla: 'AC', nome: 'Acre' },
      { sigla: 'AL', nome: 'Alagoas' },
      { sigla: 'AP', nome: 'Amapá' },
      { sigla: 'AM', nome: 'Amazonas' },
      { sigla: 'BA', nome: 'Bahia' },
      { sigla: 'CE', nome: 'Ceará' },
      { sigla: 'DF', nome: 'Distrito Federal' },
      { sigla: 'ES', nome: 'Espírito Santo' },
      { sigla: 'GO', nome: 'Goiás' },
      { sigla: 'MA', nome: 'Maranhão' },
      { sigla: 'MT', nome: 'Mato Grosso' },
      { sigla: 'MS', nome: 'Mato Grosso do Sul' },
      { sigla: 'MG', nome: 'Minas Gerais' },
      { sigla: 'PA', nome: 'Pará' },
      { sigla: 'PB', nome: 'Paraíba' },
      { sigla: 'PR', nome: 'Paraná' },
      { sigla: 'PE', nome: 'Pernambuco' },
      { sigla: 'PI', nome: 'Piauí' },
      { sigla: 'RJ', nome: 'Rio de Janeiro' },
      { sigla: 'RN', nome: 'Rio Grande do Norte' },
      { sigla: 'RS', nome: 'Rio Grande do Sul' },
      { sigla: 'RO', nome: 'Rondônia' },
      { sigla: 'RR', nome: 'Roraima' },
      { sigla: 'SC', nome: 'Santa Catarina' },
      { sigla: 'SP', nome: 'São Paulo' },
      { sigla: 'SE', nome: 'Sergipe' },
      { sigla: 'TO', nome: 'Tocantins' }
    ];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.mostrarErro('Arquivo muito grande. Tamanho máximo: 2MB');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.mostrarErro('Formato inválido. Selecione uma imagem (JPG, PNG)');
        return;
      }
      
      this.selectedFile = file;
    }
  }

  salvarAgente(): void {
    this.hideMessages();

    const formValue = this.agenteForm.getRawValue();

    // Validação específica de CPF primeiro (sem bloquear o botão)
    const cpfLimpo = (formValue.cpf || '').toString().replace(/\D/g, '');
    if (!this.validarCPF(cpfLimpo)) {
      this.agenteForm.get('cpf')?.setErrors({ cpfInvalido: true });
      this.mostrarErro('CPF inválido');
      return;
    }

    // Validação de telefone (10 ou 11 dígitos)
    const telefoneLimpo = (formValue.telefone || '').toString().replace(/\D/g, '');
    if (!this.validarTelefone(telefoneLimpo)) {
      this.agenteForm.get('telefone')?.setErrors({ telefoneInvalido: true });
      this.mostrarErro('Telefone inválido');
      return;
    }

    // Demais validações do formulário (campos obrigatórios etc.)
    if (this.agenteForm.invalid) {
      this.markFormGroupTouched();
      this.mostrarErro('Preencha todos os campos obrigatórios');
      return;
    }

    this.loading = true;

    const agenteData: AgenteVoluntarioDTO = {
      id: this.isEditMode ? this.agenteId : undefined,
      nomeCompleto: String(formValue.nomeCompleto || '').trim(),
      cpf: cpfLimpo,
      telefone: telefoneLimpo,
      email: (formValue.email || '').toString().trim(),
      fotoBase64: undefined,
      numeroCarteiraIdentidade: String(formValue.numeroCarteiraIdentidade || '').trim() || undefined,
      dataExpedicaoCI: formValue.dataExpedicaoCI ? String(formValue.dataExpedicaoCI) : undefined,
      nacionalidade: String(formValue.nacionalidade || '').trim() || undefined,
      naturalidade: String(formValue.naturalidade || '').trim() || undefined,
      uf: formValue.uf ? String(formValue.uf).toUpperCase() : undefined,
      dataNascimento: formValue.dataNascimento ? String(formValue.dataNascimento) : undefined,
      filiacaoPai: String(formValue.filiacaoPai || '').trim() || undefined,
      filiacaoMae: String(formValue.filiacaoMae || '').trim() || undefined,
      disponibilidade: String(formValue.disponibilidade || '').trim() || undefined,
      // Wrap em array para atender o backend
      comarcasIds: (formValue.comarcasIds != null && formValue.comarcasIds !== '') ? [Number(formValue.comarcasIds)] : [],
      areasAtuacaoIds: (formValue.areasAtuacaoIds != null && formValue.areasAtuacaoIds !== '') ? [Number(formValue.areasAtuacaoIds)] : []
    } as AgenteVoluntarioDTO;

    // Converter foto para base64 se selecionada
    const proceed = (dto: AgenteVoluntarioDTO) => {
      if (this.isEditMode && this.agenteId) {
        this.atualizarAgente(this.agenteId, dto);
      } else {
        this.enviarDados(dto);
      }
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        agenteData.fotoBase64 = reader.result as string;
        proceed(agenteData);
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      proceed(agenteData);
    }
  }

  // ===== Validações CPF =====
  private cpfValidator() {
    return (control: any) => {
      const v = (control?.value || '').toString();
      const digits = v.replace(/\D/g, '');
      if (!digits) return { cpfInvalido: true };
      return this.validarCPF(digits) ? null : { cpfInvalido: true };
    };
  }

  private validarCPF(cpf: string): boolean {
    const s = (cpf || '').replace(/\D/g, '');
    if (s.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(s)) return false; // rejeita repetidos
    const calc = (base: string, start: number) => {
      let sum = 0;
      for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (start - i);
      const mod = sum % 11;
      return mod < 2 ? 0 : 11 - mod;
    };
    const d1 = calc(s.substring(0, 9), 10);
    const d2 = calc(s.substring(0, 9) + String(d1), 11);
    return s === s.substring(0, 9) + String(d1) + String(d2);
  }

  // ===== Validações Telefone =====
  private telefoneValidator() {
    return (control: any) => {
      const v = (control?.value || '').toString();
      const digits = v.replace(/\D/g, '');
      if (!digits) return { telefoneInvalido: true };
      return this.validarTelefone(digits) ? null : { telefoneInvalido: true };
    };
  }

  private validarTelefone(digits: string): boolean {
    // Aceita (DD + 8) ou (DD + 9) = 10 ou 11 dígitos
    return /^\d{10,11}$/.test(digits);
  }

  private formatarTelefone(value: string): string {
    const d = (value || '').replace(/\D/g, '').slice(0, 11);
    if (d.length < 3) return d;
    const ddd = d.substring(0, 2);
    if (d.length <= 6) return `(${ddd}) ${d.substring(2)}`;
    if (d.length === 10) return `(${ddd}) ${d.substring(2, 6)}-${d.substring(6)}`;
    if (d.length >= 11) return `(${ddd}) ${d.substring(2, 7)}-${d.substring(7)}`;
    return d;
  }

  private enviarDados(agenteData: AgenteVoluntarioDTO): void {
    this.apiService.cadastrarAgente(agenteData).subscribe({
      next: (response) => {
        this.loading = false;
        this.mostrarSucesso('Agente cadastrado com sucesso! Status inicial: Em Análise');
        this.limparFormulario();
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/agentes']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao cadastrar agente:', error);
        
        if (error.status === 409) {
          this.mostrarErro('CPF já cadastrado no sistema');
        } else if (error.status === 400) {
          this.mostrarErro('Dados inválidos. Verifique os campos obrigatórios');
        } else {
          this.mostrarErro('Erro ao cadastrar agente. Tente novamente');
        }
      }
    });
  }

  private atualizarAgente(id: number, agenteData: AgenteVoluntarioDTO): void {
    this.apiService.atualizarAgente(id, agenteData).subscribe({
      next: () => {
        this.loading = false;
        this.mostrarSucesso('Dados do agente atualizados com sucesso!');
        setTimeout(() => {
          this.router.navigate(['/agentes']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro ao atualizar agente:', error);
        this.mostrarErro('Erro ao atualizar agente. Tente novamente');
      }
    });
  }

  private carregarAgente(id: number): void {
    this.apiService.buscarAgentePorId(id).subscribe({
      next: (agente) => {
        // Mapeia dados do agente para o formulário
        const comarcasIds = (agente.comarcas || []).map(c => Number(c.id));
        const areasIds = (agente.areasAtuacao || []).map(a => Number(a.id));
        this.agenteForm.patchValue({
          nomeCompleto: agente.nomeCompleto || agente.nome || '',
          cpf: (agente.cpf || '').replace(/\D/g, ''),
          telefone: this.formatarTelefone(agente.telefone || ''),
          email: agente.email || '',
          numeroCarteiraIdentidade: (agente as any).numeroCarteiraIdentidade || (agente as any).numeroCI || '',
          dataExpedicaoCI: (agente as any).dataExpedicaoCI || '',
          nacionalidade: (agente as any).nacionalidade || '',
          naturalidade: (agente as any).naturalidade || '',
          uf: (agente as any).uf || '',
          dataNascimento: (agente as any).dataNascimento || '',
          filiacaoPai: (agente as any).filiacaoPai || (agente as any).filiacao_pai || '',
          filiacaoMae: (agente as any).filiacaoMae || (agente as any).filiacao_mae || '',
          disponibilidade: agente.disponibilidade || '',
          // Seleciona o primeiro item (single-select)
          comarcasIds: comarcasIds.length ? comarcasIds[0] : null,
          areasAtuacaoIds: areasIds.length ? areasIds[0] : null
        });
        // Em modo edição, impedir alteração do CPF
        this.agenteForm.get('cpf')?.disable();
      },
      error: (err) => {
        console.error('Erro ao carregar agente:', err);
        this.mostrarErro('Não foi possível carregar os dados do agente.');
      }
    });
  }

  limparFormulario(): void {
    this.agenteForm.reset();
    this.agenteForm.patchValue({
      comarcasIds: null,
      areasAtuacaoIds: null
    });
    this.selectedFile = null;
    this.hideMessages();
  }

  voltar(): void {
    this.router.navigate(['/agentes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.agenteForm.controls).forEach(key => {
      const control = this.agenteForm.get(key);
      control?.markAsTouched();
    });
  }

  private mostrarSucesso(mensagem: string): void {
    this.successMessage = mensagem;
    this.showSuccess = true;
    this.showError = false;
    setTimeout(() => {
      if (this.showSuccess) this.showSuccess = false;
    }, 10000);
  }

  private mostrarErro(mensagem: string): void {
    this.errorMessage = mensagem;
    this.showError = true;
    this.showSuccess = false;
    setTimeout(() => {
      if (this.showError) this.showError = false;
    }, 10000);
  }

  private hideMessages(): void {
    this.showSuccess = false;
    this.showError = false;
  }
}
