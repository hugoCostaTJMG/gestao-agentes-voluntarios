// modal.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
// ⬇️ Ajuste o caminho caso sua pasta de stories esteja em outro lugar
import { ModalComponent } from '../../../app/shared/components/modal/modal.component';

type Story = StoryObj<ModalComponent>;

const meta: Meta<ModalComponent> = {
  title: 'Shared/Components/Modal',
  component: ModalComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ModalComponent],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Modal standalone inspirado no Carbon. Inclui stepper, variações de rodapé e estado de carregamento.',
      },
    },
  },
  argTypes: {
    // Inputs
    open: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    title: { control: 'text' },
    label: { control: 'text' },
    description: { control: 'text' },
    showClose: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    focusTrap: { control: 'boolean' },
    initialFocus: { control: 'text' },
    actions: { control: 'object' },
    busy: { control: 'boolean' },
    busyMessage: { control: 'text' },
    steps: { control: 'object' },

    // A11y extras
    ariaLabel: { control: 'text' },
    ariaLabelledby: { control: 'text' },
    ariaDescribedby: { control: 'text' },

    // Outputs (logs no painel Actions)
    action: { action: 'action' },
    closed: { action: 'closed' },
    openChange: { action: 'openChange' },
  },
  render: (args) => ({
    props: {
      ...args,
      // helper: fecha por ação "cancel"
      onAction: (id: string) => args.action?.(id),
      onClosed: (reason: any) => args.closed?.(reason),
    },
    template: `
      <button type="button" (click)="open = true" style="margin:16px">Open Modal</button>

      <app-modal
        [(open)]="open"
        [size]="size"
        [title]="title"
        [label]="label"
        [description]="description"
        [showClose]="showClose"
        [closeOnEsc]="closeOnEsc"
        [closeOnBackdrop]="closeOnBackdrop"
        [focusTrap]="focusTrap"
        [initialFocus]="initialFocus"
        [steps]="steps"
        [actions]="actions"
        [busy]="busy"
        [busyMessage]="busyMessage"
        [ariaLabel]="ariaLabel"
        [ariaLabelledby]="ariaLabelledby"
        [ariaDescribedby]="ariaDescribedby"
        (action)="onAction($event)"
        (closed)="onClosed($event)">
        <div modal-body>
          <p>Conteúdo de exemplo. Substitua por qualquer componente (forms, listas, etc.).</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </div>
      </app-modal>
    `,
  }),
  args: {
    open: true,
    size: 'lg',
    title: 'Title',
    label: 'Optional label',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.',
    showClose: true,
    closeOnEsc: true,
    closeOnBackdrop: true,
    focusTrap: true,
    actions: [
      { id: 'cancel', label: 'Cancel', kind: 'cancel', align: 'left' },
      { id: 'primary', label: 'Button', kind: 'primary' },
    ],
    steps: [],
    busy: false,
    busyMessage: 'Loading message',
  },
};
export default meta;

/* ===============  Stories  =============== */
export const Playground: Story = {};

/** Tamanhos (tokens Carbon) */
export const SizeSm: Story = { args: { size: 'sm', open: true } };
export const SizeMd: Story = { args: { size: 'md', open: true } };
export const SizeLg: Story = { args: { size: 'lg', open: true } };
export const SizeXl: Story = { args: { size: 'xl', open: true } };

/** Com stepper como no Figma */
export const WithSteps: Story = {
  args: {
    steps: [
      { label: 'Step', optionalLabel: 'Optional label', state: 'current' },
      { label: 'Step', optionalLabel: 'Optional label', state: 'incomplete' },
      { label: 'Step', optionalLabel: 'Optional label', state: 'incomplete' },
      { label: 'Step', optionalLabel: 'Optional label', state: 'incomplete' },
    ],
    open: true,
  },
};

/** Rodapé: Cancel (esquerda) + Primary (direita) */
export const Footer_Cancel_Primary: Story = {
  args: {
    actions: [
      { id: 'cancel', label: 'Cancel', kind: 'cancel', align: 'left' },
      { id: 'primary', label: 'Button', kind: 'primary' },
    ],
    open: true,
  },
};

/** Rodapé: Secondary + Primary (ambos à direita) */
export const Footer_Secondary_Primary: Story = {
  args: {
    actions: [
      { id: 'secondary', label: 'Button', kind: 'secondary' },
      { id: 'primary', label: 'Button', kind: 'primary' },
    ],
    open: true,
  },
};

/** Rodapé: Cancel à esquerda + Secondary + Primary à direita */
export const Footer_Cancel_Secondary_Primary: Story = {
  args: {
    actions: [
      { id: 'cancel', label: 'Cancel', kind: 'cancel', align: 'left' },
      { id: 'secondary', label: 'Button', kind: 'secondary' },
      { id: 'primary', label: 'Button', kind: 'primary' },
    ],
    open: true,
  },
};

/** Busy: mensagem substitui ações da direita, mantendo Cancel */
export const Busy_WithCancelLeft: Story = {
  args: {
    busy: true,
    actions: [
      { id: 'cancel', label: 'Cancel', kind: 'cancel', align: 'left' },
      { id: 'secondary', label: 'Button', kind: 'secondary' },
      { id: 'primary', label: 'Button', kind: 'primary' },
    ],
    open: true,
  },
};

/** Busy: somente mensagem (sem botões) */
export const Busy_OnlyMessage: Story = {
  args: {
    busy: true,
    actions: [],
    open: true,
  },
};

/** Sem fechar por ESC e Backdrop (ex.: fluxo crítico) */
export const NoEscNoBackdrop: Story = {
  args: {
    closeOnEsc: false,
    closeOnBackdrop: false,
    open: true,
  },
};

/** Long content (testa scroll do body) */
export const LongContent: Story = {
  render: (args) => ({
    props: { ...args },
    template: `
      <app-modal
        [(open)]="open"
        [size]="size"
        [title]="title"
        [label]="label"
        [description]="description"
        [actions]="actions">
        <div modal-body>
          <p *ngFor="let i of [].constructor(20)">Parágrafo {{i}} — Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </div>
      </app-modal>
    `,
  }),
  args: {
    open: true,
    actions: [
      { id: 'cancel', label: 'Cancel', kind: 'cancel', align: 'left' },
      { id: 'primary', label: 'Button', kind: 'primary' },
    ],
  },
};
