// src/stories/button.stories.ts
import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../app/shared/components/buttons/button/button.component';


const TYPES = [
  'primary',
  'secondary',
  'tertiary',
  'ghost',
  'danger',
  'danger-tertiary',
  'danger-ghost',
] as const;

const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<ButtonComponent> = {
  title: 'Shared/Components/Button',
  component: ButtonComponent,
  decorators: [
    applicationConfig({
      // necessário para usar [routerLink] nas histórias
      providers: [provideRouter([])],
    }),
    moduleMetadata({
      imports: [CommonModule, ButtonComponent],
    }),
  ],
  args: {
    label: 'Button',
    type: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    iconLeft: '',
    iconRight: '',
    buttonType: 'button',
    ariaLabel: '',
  },
  argTypes: {
    type: { control: 'select', options: TYPES as unknown as string[] },
    size: { control: 'inline-radio', options: SIZES as unknown as string[] },
    label: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    buttonType: { control: 'radio', options: ['button', 'submit', 'reset'] },
    ariaLabel: { control: 'text' },
    routerLink: { control: false }, // usar apenas em histórias específicas
    clicked: { action: 'clicked' },
  },
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Botão no padrão Carbon-like com kinds, tamanhos produtivos, estados, loading e suporte a ícone-only.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<ButtonComponent>;

/** Ajuste livre via Controls */
export const Playground: Story = {
  name: 'Playground',
};

/** Kinds (variações principais) */
export const Primary: Story = {
  args: { type: 'primary', label: 'Primary' },
};
export const Secondary: Story = {
  args: { type: 'secondary', label: 'Secondary' },
};
export const Tertiary: Story = {
  args: { type: 'tertiary', label: 'Tertiary' },
};
export const Ghost: Story = {
  args: { type: 'ghost', label: 'Ghost' },
};
export const Danger: Story = {
  args: { type: 'danger', label: 'Danger' },
};
export const DangerTertiary: Story = {
  args: { type: 'danger-tertiary', label: 'Danger tertiary' },
};
export const DangerGhost: Story = {
  args: { type: 'danger-ghost', label: 'Danger ghost' },
};

/** Tamanhos produtivos (sm 32px, md 40px, lg 48px) */
export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap">
        <app-button [type]="type" size="sm" [label]="label + ' sm'"></app-button>
        <app-button [type]="type" size="md" [label]="label + ' md'"></app-button>
        <app-button [type]="type" size="lg" [label]="label + ' lg'"></app-button>
      </div>
    `,
  }),
  args: { type: 'primary', label: 'Size' },
  parameters: { controls: { exclude: ['size'] } },
};

/** Ícones à esquerda e à direita (use classes do seu ícone, ex.: Font Awesome) */
export const WithIcons: Story = {
  args: {
    label: 'Com ícones',
    iconLeft: 'fa fa-download',
    iconRight: 'fa fa-arrow-right',
  },
};

/** Icon-only (usa aria-label para acessibilidade) */
export const IconOnly: Story = {
  args: {
    label: '',
    iconLeft: 'fa fa-download',
    ariaLabel: 'Download',
    type: 'ghost',
    size: 'md',
  },
};

/** Loading inline (desabilita interação) */
export const Loading: Story = {
  args: {
    label: 'Carregando',
    loading: true,
    type: 'primary',
  },
};

/** Disabled */
export const Disabled: Story = {
  args: {
    label: 'Desabilitado',
    disabled: true,
  },
};

/** Com routerLink (navegação interna) */
export const WithRouterLink: Story = {
  args: {
    label: 'Ir para /demo',
    type: 'primary',
    // funciona porque fornecemos provideRouter([]) no decorator
    routerLink: ['/demo'],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Exemplo usando [routerLink]. Em projetos reais, a rota /demo deve existir; aqui é apenas para validar binding.',
      },
    },
  },
};

/** Vitrine: todos os kinds em uma grade (útil para revisar tokens/estados) */
export const AllKinds: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:16px;">
        <div style="display:flex; gap:8px; flex-wrap: wrap">
          <app-button type="primary" label="Primary"></app-button>
          <app-button type="secondary" label="Secondary"></app-button>
          <app-button type="tertiary" label="Tertiary"></app-button>
          <app-button type="ghost" label="Ghost"></app-button>
        </div>
        <div style="display:flex; gap:8px; flex-wrap: wrap">
          <app-button type="danger" label="Danger"></app-button>
          <app-button type="danger-tertiary" label="Danger tertiary"></app-button>
          <app-button type="danger-ghost" label="Danger ghost"></app-button>
        </div>
        <div style="display:flex; gap:8px; flex-wrap: wrap">
          <app-button type="primary" size="sm" label="sm"></app-button>
          <app-button type="primary" size="md" label="md"></app-button>
          <app-button type="primary" size="lg" label="lg"></app-button>
          <app-button type="ghost" size="md" iconLeft="fa fa-download" ariaLabel="Download"></app-button>
        </div>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};
