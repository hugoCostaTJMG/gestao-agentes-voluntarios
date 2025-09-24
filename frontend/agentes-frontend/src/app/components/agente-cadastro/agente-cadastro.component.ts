import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Comarca, AreaAtuacao, AgenteVoluntarioDTO } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';

interface Estado {
  sigla: string;
  nome: string;
}

@Component({
  selector: 'app-agente-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ButtonComponent],
  templateUrl: './agente-cadastro.component.html',
  styleUrls: ['./agente-cadastro.component.scss']
})
export class AgenteCadastroComponent implements OnInit {
  agenteForm: FormGroup;
  comarcas: Comarca[] = [];
  areasAtuacao: AreaAtuacao[] = [];
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
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefone: ['', [Validators.required]],
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
      comarcasIds: [[], [Validators.required, this.minLengthArray(1)]],
      areasAtuacaoIds: [[], [Validators.required, this.minLengthArray(1)]]
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
    if (this.agenteForm.valid) {
      this.loading = true;
      this.hideMessages();

      const formValue = this.agenteForm.getRawValue();
      
      // Limpar CPF (remover pontos e traços)
      const cpfLimpo = (formValue.cpf || '').toString().replace(/\D/g, '');
      
      const agenteData: AgenteVoluntarioDTO = {
        nomeCompleto: formValue.nomeCompleto,
        cpf: cpfLimpo,
        telefone: formValue.telefone,
        email: formValue.email,
        dataNascimento: formValue.dataNascimento,
        nacionalidade: formValue.nacionalidade,
        numeroCarteiraIdentidade: formValue.numeroCarteiraIdentidade,
        dataExpedicaoCI: formValue.dataExpedicaoCI,
        uf: formValue.uf,
        naturalidade: formValue.naturalidade,
        filiacaoPai: formValue.filiacaoPai,
        filiacaoMae: formValue.filiacaoMae,
        disponibilidade: formValue.disponibilidade,
        comarcasIds: formValue.comarcasIds.map((id: any) => Number(id)),
        areasAtuacaoIds: formValue.areasAtuacaoIds.map((id: any) => Number(id))
      };

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
    } else {
      this.markFormGroupTouched();
      this.mostrarErro('Preencha todos os campos obrigatórios');
    }
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
          telefone: agente.telefone || '',
          email: agente.email || '',
          disponibilidade: agente.disponibilidade || '',
          comarcasIds,
          areasAtuacaoIds: areasIds
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
      comarcasIds: [],
      areasAtuacaoIds: []
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
