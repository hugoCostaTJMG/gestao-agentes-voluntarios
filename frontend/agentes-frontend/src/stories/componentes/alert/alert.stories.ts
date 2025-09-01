// alert.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../../../app/shared/components/alert/alert.component';

const TYPES = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'danger',
  'neutral',
  'ghost',
] as const;

const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<AlertComponent> = {
  title: 'Shared/Components/Alert',
  component: AlertComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AlertComponent],
    }),
  ],
  argTypes: {
    type: { control: 'select', options: TYPES as unknown as string[] },
    size: { control: 'select', options: SIZES as unknown as string[] },
    title: { control: 'text' },
    message: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    dismissible: { control: 'boolean' },
    dismissed: { action: 'dismissed' },
  },
};
export default meta;

type Story = StoryObj<AlertComponent>;

/* Story principal com args controláveis */
export const Playground: Story = {
  args: {
    type: 'primary',
    size: 'md',
    title: 'Well done!',
    message: 'You successfully read this important alert message.',
    iconLeft: 'fa fa-info-circle',
    dismissible: true,
  },
};

/* Variações por tipo */
export const Variants: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 16px;">
        <app-alert type="primary" title="Primary" message="Mensagem de alerta primário"></app-alert>
        <app-alert type="secondary" title="Secondary" message="Mensagem de alerta secundário"></app-alert>
        <app-alert type="success" title="Success" message="Operação realizada com sucesso!"></app-alert>
        <app-alert type="info" title="Info" message="Informação importante para o usuário."></app-alert>
        <app-alert type="warning" title="Warning" message="Atenção: verifique os dados."></app-alert>
        <app-alert type="danger" title="Danger" message="Erro crítico encontrado."></app-alert>
        <app-alert type="neutral" title="Neutral" message="Mensagem neutra."></app-alert>
        <app-alert type="ghost" title="Ghost" message="Mensagem em estilo ghost."></app-alert>
      </div>
    `,
  }),
};

/* Variações de tamanho */
export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 16px;">
        <app-alert size="sm" type="info" title="Small" message="Alerta pequeno"></app-alert>
        <app-alert size="md" type="info" title="Medium" message="Alerta médio"></app-alert>
        <app-alert size="lg" type="info" title="Large" message="Alerta grande"></app-alert>
      </div>
    `,
  }),
};

/* Com ícones nos dois lados */
export const WithIcons: Story = {
  args: {
    type: 'info',
    size: 'md',
    title: 'Com ícones',
    message: 'Este alerta possui ícones à esquerda e à direita.',
    iconLeft: 'fa fa-info-circle',
    iconRight: 'fa fa-chevron-right',
  },
};

/* Dismissible */
export const Dismissible: Story = {
  args: {
    type: 'warning',
    size: 'md',
    title: 'Atenção',
    message: 'Você pode fechar este alerta clicando no X.',
    dismissible: true,
  },
};
