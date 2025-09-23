import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordInputComponent } from '../../../app/shared/components/password-input/password-input.component';

type Story = StoryObj<PasswordInputComponent>;

const meta: Meta<PasswordInputComponent> = {
  title: 'Shared/Components/PasswordInput',
  component: PasswordInputComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, PasswordInputComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Campo de senha seguindo o Carbon Design System. Suporta estados (focus/invalid/warn/disabled/readonly/skeleton), modo fluid, contador de caracteres, rótulo oculto e alternância de visibilidade.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    fluid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    toggleVisibility: { control: 'boolean' },
    warn: { control: 'boolean' },
    invalid: { control: 'boolean' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    warningMessage: { control: 'text' },
    label: { control: 'text' },
    ariaLabel: { control: 'text' },
    placeholder: { control: 'text' },
    maxLength: { control: { type: 'number', min: 0 } },
    valueChange: { action: 'valueChange' },
    changed: { action: 'changed' },
    toggledVisibility: { action: 'toggledVisibility' },
    focused: { action: 'focused' },
    blurred: { action: 'blurred' },
  },
  args: {
    label: 'Senha',
    helperText: 'Mínimo 8 caracteres, incluindo letra e número.',
    placeholder: 'Password',
    size: 'md',
    fluid: false,
    disabled: false,
    readonly: false,
    required: false,
    hideLabel: false,
    skeleton: false,
    toggleVisibility: true,
    warn: false,
    invalid: false,
    errorMessage: '',
    warningMessage: '',
    maxLength: null,
  },
};

export default meta;

const withModel = (initial = 'Senha@123') => ({
  props: { model: initial },
});

export const Playground: Story = {
  render: (args) => ({
    ...withModel('Senha@123'),
    props: { ...args },
    template: `
      <div style="min-width:320px;max-width:420px;">
        <app-password-input
          [label]="label"
          [ariaLabel]="ariaLabel"
          [placeholder]="placeholder"
          [helperText]="helperText"
          [errorMessage]="errorMessage"
          [warningMessage]="warningMessage"
          [size]="size"
          [fluid]="fluid"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [hideLabel]="hideLabel"
          [skeleton]="skeleton"
          [toggleVisibility]="toggleVisibility"
          [maxLength]="maxLength"
          [warn]="warn"
          [invalid]="invalid"
          [(ngModel)]="model"
          (valueChange)="valueChange($event)"
          (changed)="changed($event)"
          (toggledVisibility)="toggledVisibility($event)"
          (focused)="focused()"
          (blurred)="blurred()"
        ></app-password-input>
        <p style="margin-top:8px;font-size:12px;color:#6f6f6f;">Valor atual: {{ model }}</p>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: {
      sm: '',
      md: 'Senha@123',
      lg: 'SenhaComplexa!2024',
    },
    template: `
      <div style="display:grid;gap:16px;min-width:320px;max-width:420px;">
        <app-password-input label="Senha pequena" size="sm" [(ngModel)]="sm"></app-password-input>
        <app-password-input label="Senha média" size="md" [(ngModel)]="md"></app-password-input>
        <app-password-input label="Senha grande" size="lg" [(ngModel)]="lg"></app-password-input>
      </div>
    `,
  }),
};

export const Fluid: Story = {
  args: { fluid: true },
  render: (args) => ({
    ...withModel('SenhaFluid99'),
    props: { ...args },
    template: `
      <div style="width:520px;max-width:100%;">
        <app-password-input
          [label]="label"
          [fluid]="true"
          [helperText]="helperText"
          [(ngModel)]="model"
        ></app-password-input>
      </div>
    `,
  }),
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errorMessage: 'Senha inválida. Use ao menos 8 caracteres, letra e número.',
  },
  render: (args) => ({
    ...withModel('123'),
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [invalid]="true"
        [errorMessage]="errorMessage"
        [(ngModel)]="model"
      ></app-password-input>
    `,
  }),
};

export const Warning: Story = {
  args: {
    warn: true,
    warningMessage: 'Considere adicionar caracteres especiais.',
  },
  render: (args) => ({
    ...withModel('Senha123'),
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [warn]="true"
        [warningMessage]="warningMessage"
        [(ngModel)]="model"
      ></app-password-input>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    helperText: 'Campo desabilitado',
  },
  render: (args) => ({
    ...withModel('SenhaBloqueada!'),
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [disabled]="true"
        [helperText]="helperText"
        [(ngModel)]="model"
      ></app-password-input>
    `,
  }),
};

export const Readonly: Story = {
  args: {
    readonly: true,
    helperText: 'Somente leitura',
  },
  render: (args) => ({
    ...withModel('SenhaSomenteLeitura!'),
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [readonly]="true"
        [helperText]="helperText"
        [(ngModel)]="model"
      ></app-password-input>
    `,
  }),
};

export const Skeleton: Story = {
  args: { skeleton: true, label: ' ', helperText: ' ' },
  render: (args) => ({
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [helperText]="helperText"
        [skeleton]="true"
      ></app-password-input>
    `,
  }),
};

export const WithMaxLength: Story = {
  args: { maxLength: 16 },
  render: (args) => ({
    ...withModel('Senha@123'),
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [helperText]="helperText"
        [maxLength]="maxLength"
        [(ngModel)]="model"
      ></app-password-input>
    `,
  }),
};

export const HideLabelWithAria: Story = {
  args: {
    hideLabel: true,
    ariaLabel: 'Senha da conta',
    helperText: 'Etiqueta visual oculta, mas acessível via aria-label.',
  },
  render: (args) => ({
    ...withModel('SenhaSecreta!'),
    props: { ...args },
    template: `
      <app-password-input
        [label]="label"
        [ariaLabel]="ariaLabel"
        [hideLabel]="true"
        [helperText]="helperText"
        [(ngModel)]="model"
      ></app-password-input>
    `,
  }),
};
