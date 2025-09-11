// number-input.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from '../../../app/shared/components/number-input/number-input.component';

type Story = StoryObj<NumberInputComponent>;

const meta: Meta<NumberInputComponent> = {
  title: 'Shared/Components/NumberInput',
  component: NumberInputComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, FormsModule, NumberInputComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'NumberInput baseado no Carbon. Suporta prefixo, action items, estados (invalid/warn/disabled/readonly/skeleton), clamping min/max e navegação por teclado.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    fluid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    warn: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    hideControls: { control: 'boolean' },
    label: { control: 'text' },
    helperText: { control: 'text' },
    invalidText: { control: 'text' },
    warnText: { control: 'text' },
    placeholder: { control: 'text' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    pageStep: { control: 'number' },
    precision: { control: 'number' },

    // Actions (mapeia os @Output() diretamente no painel de Actions)
    valueChange: { action: 'valueChange' },
    increment:   { action: 'increment' },
    decrement:   { action: 'decrement' },
    focusin:     { action: 'focusin' },
    focusout:    { action: 'focusout' },
  },
  args: {
    label: 'Label',
    helperText: 'Helper text',
    size: 'md',
    step: 1,
    pageStep: 10,
    fluid: false,
    disabled: false,
    readonly: false,
    invalid: false,
    warn: false,
    skeleton: false,
    hideLabel: false,
    hideControls: false,
    min: 0,
    max: 1000,
    precision: null,
  },
};
export default meta;

/* Util para binding bidirecional local ao story */
const withModel = (initial = 1) => ({
  props: { model: initial },
});

/* --------------------- Stories --------------------- */

export const Playground: Story = {
  render: (args) => ({
    ...withModel(1),
    props: { ...args },
    template: `
      <div style="min-width:360px;">
        <app-number-input
          [label]="label"
          [helperText]="helperText"
          [size]="size"
          [fluid]="fluid"
          [min]="min"
          [max]="max"
          [step]="step"
          [pageStep]="pageStep"
          [precision]="precision"
          [disabled]="disabled"
          [readonly]="readonly"
          [invalid]="invalid"
          [warn]="warn"
          [skeleton]="skeleton"
          [hideLabel]="hideLabel"
          [hideControls]="hideControls"
          [(ngModel)]="model"
          (valueChange)="valueChange($event)"
          (increment)="increment($event)"
          (decrement)="decrement($event)"
          (focusin)="focusin($event)"
          (focusout)="focusout($event)">
          <span prefix>R$</span>
          <span action-item style="display:inline-flex;align-items:center;border:1px solid #999;border-radius:4px;padding:0 6px;font-size:12px;line-height:1.2;">AI</span>
        </app-number-input>
        <p style="margin-top:8px;font-size:12px;color:#888;">Valor atual: {{ model }}</p>
      </div>
    `,
  }),
};

export const SizesSmMdLg: Story = {
  render: () => ({
    ...withModel(1),
    template: `
      <div style="display:grid;gap:16px;min-width:360px;">
        <app-number-input label="Small" size="sm" [(ngModel)]="model"></app-number-input>
        <app-number-input label="Medium" size="md" [(ngModel)]="model"></app-number-input>
        <app-number-input label="Large" size="lg" [(ngModel)]="model"></app-number-input>
      </div>
    `,
  }),
};

export const Fluid: Story = {
  args: { fluid: true },
  render: (args) => ({
    ...withModel(42),
    props: { ...args },
    template: `
      <div style="width:520px;max-width:100%;">
        <app-number-input [label]="label" [helperText]="helperText" [fluid]="true" [(ngModel)]="model">
          <span action-item style="display:inline-flex;border:1px solid #999;border-radius:4px;padding:0 6px;font-size:12px;">AI</span>
        </app-number-input>
      </div>
    `,
  }),
};

export const Invalid: Story = {
  args: { invalid: true, invalidText: 'Error message goes here' },
  render: (args) => ({
    ...withModel(1),
    props: { ...args },
    template: `
      <app-number-input [label]="label" [invalid]="true" [invalidText]="invalidText" [(ngModel)]="model"></app-number-input>
    `,
  }),
};

export const Warning: Story = {
  args: { warn: true, warnText: 'Warning message goes here' },
  render: (args) => ({
    ...withModel(1),
    props: { ...args },
    template: `
      <app-number-input [label]="label" [warn]="true" [warnText]="warnText" [(ngModel)]="model"></app-number-input>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true, helperText: 'Campo desabilitado' },
  render: (args) => ({
    ...withModel(3),
    props: { ...args },
    template: `
      <app-number-input [label]="label" [disabled]="true" [helperText]="helperText" [(ngModel)]="model"></app-number-input>
    `,
  }),
};

export const Readonly: Story = {
  args: { readonly: true, helperText: 'Somente leitura' },
  render: (args) => ({
    ...withModel(7),
    props: { ...args },
    template: `
      <app-number-input [label]="label" [readonly]="true" [helperText]="helperText" [(ngModel)]="model"></app-number-input>
    `,
  }),
};

export const Skeleton: Story = {
  args: { skeleton: true, label: ' ', helperText: ' ' },
  render: (args) => ({
    props: { ...args },
    template: `<app-number-input [skeleton]="true" [label]="label" [helperText]="helperText"></app-number-input>`,
  }),
};

export const WithPrefix: Story = {
  render: () => ({
    ...withModel(123.45),
    template: `
      <app-number-input label="Valor" [precision]="2" [(ngModel)]="model">
        <span prefix>R$</span>
      </app-number-input>
    `,
  }),
};

export const NoControls_ActionOnly: Story = {
  args: { hideControls: true },
  render: (args) => ({
    ...withModel(1),
    props: { ...args },
    template: `
      <app-number-input [label]="label" [hideControls]="true" [(ngModel)]="model">
        <span action-item style="display:inline-flex;border:1px solid #999;border-radius:4px;padding:0 6px;font-size:12px;">AI</span>
      </app-number-input>
    `,
  }),
};

export const MinMaxClamped: Story = {
  args: { min: 0, max: 10, step: 2, helperText: 'Min 0 / Max 10 / Step 2' },
  render: (args) => ({
    ...withModel(0),
    props: { ...args },
    template: `
      <app-number-input
        [label]="label"
        [min]="min"
        [max]="max"
        [step]="step"
        [helperText]="helperText"
        [(ngModel)]="model">
      </app-number-input>
      <p style="margin-top:8px;font-size:12px;color:#888;">Tente segurar os botões – / + para repetir.</p>
    `,
  }),
};
