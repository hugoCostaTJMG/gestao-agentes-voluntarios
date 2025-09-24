import { CommonModule } from '@angular/common';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';

import { ProgressBarComponent } from './progress-bar.component';
import { ProgressBarItemComponent } from './progress-bar-item.component';
import {
  PROGRESS_BAR_DETERMINATE_MOCK,
  PROGRESS_BAR_ERROR_MOCK,
  PROGRESS_BAR_INDETERMINATE_MOCK,
  PROGRESS_BAR_SEGMENTED_MOCK,
  PROGRESS_BAR_SUCCESS_MOCK,
} from './progress-bar.mocks';

const meta: Meta<ProgressBarComponent> = {
  title: 'Shared/Components/Progress Bar',
  component: ProgressBarComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'success', 'error', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showPercentage: { control: 'boolean' },
    inline: { control: 'boolean' },
    skeleton: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    segmented: { control: 'boolean' },
    striped: { control: 'boolean' },
    animated: { control: 'boolean' },
    stackedLabels: { control: 'boolean' },
    showItemLabels: { control: 'boolean' },
    completed: { action: 'completed' },
  },
  args: {
    max: 100,
    status: 'default',
    size: 'md',
    showPercentage: false,
    inline: false,
    skeleton: false,
    indeterminate: false,
    segmented: false,
    striped: false,
    animated: true,
    stackedLabels: false,
    showItemLabels: false,
  },
};

export default meta;

type Story = StoryObj<ProgressBarComponent>;

const baseRender: Story['render'] = (args) => ({
  props: args,
  template: `
    <app-progress-bar
      [value]="value"
      [max]="max"
      [indeterminate]="indeterminate"
      [label]="label"
      [helperText]="helperText"
      [status]="status"
      [showPercentage]="showPercentage"
      [size]="size"
      [inline]="inline"
      [skeleton]="skeleton"
      [ariaLabel]="ariaLabel"
      [ariaDescribedby]="ariaDescribedby"
      [animated]="animated"
      [striped]="striped"
      [segmented]="segmented"
      [stackedLabels]="stackedLabels"
      [showItemLabels]="showItemLabels"
    ></app-progress-bar>
  `,
  imports: [ProgressBarComponent],
});

export const Determinate: Story = {
  render: baseRender,
  args: {
    ...PROGRESS_BAR_DETERMINATE_MOCK,
  },
};

export const Empty: Story = {
  render: baseRender,
  args: {
    label: 'Sem progresso',
    helperText: 'Nenhum item iniciado ainda',
    value: 0,
    showPercentage: true,
  },
};

export const Quarter: Story = {
  render: baseRender,
  args: {
    label: 'Progresso 25%',
    helperText: 'Primeira fase concluída',
    value: 25,
    showPercentage: true,
  },
};

export const Half: Story = {
  render: baseRender,
  args: {
    label: 'Progresso 50%',
    helperText: 'Metade do caminho',
    value: 50,
    showPercentage: true,
  },
};

export const ThreeQuarters: Story = {
  render: baseRender,
  args: {
    label: 'Progresso 75%',
    helperText: 'Quase lá',
    value: 75,
    showPercentage: true,
  },
};

export const Full: Story = {
  render: baseRender,
  args: {
    label: 'Progresso completo',
    helperText: 'Todas as etapas finalizadas',
    value: 100,
    showPercentage: true,
  },
};

export const Indeterminate: Story = {
  render: baseRender,
  args: {
    ...PROGRESS_BAR_INDETERMINATE_MOCK,
  },
};

export const Success: Story = {
  render: baseRender,
  args: {
    ...PROGRESS_BAR_SUCCESS_MOCK,
  },
};

export const Error: Story = {
  render: baseRender,
  args: {
    ...PROGRESS_BAR_ERROR_MOCK,
  },
};

export const Inline: Story = {
  render: baseRender,
  args: {
    label: 'Etapa atual',
    helperText: 'Processando lote 2 de 5',
    value: 45,
    showPercentage: true,
    inline: true,
  },
};

export const Skeleton: Story = {
  render: baseRender,
  args: {
    label: 'Carregando progresso',
    skeleton: true,
  },
};

export const Segmented: Story = {
  render: (args) => ({
    props: { ...args, segments: PROGRESS_BAR_SEGMENTED_MOCK },
    template: `
      <app-progress-bar
        [max]="max"
        [label]="label"
        [helperText]="helperText"
        [segmented]="segmented"
        [showItemLabels]="showItemLabels"
        [stackedLabels]="stackedLabels"
      >
        <app-progress-bar-item
          *ngFor="let item of segments"
          [label]="item.label"
          [value]="item.value"
          [status]="item.status"
        ></app-progress-bar-item>
      </app-progress-bar>
    `,
    imports: [CommonModule, ProgressBarComponent, ProgressBarItemComponent],
  }),
  args: {
    max: 100,
    label: 'Pipeline',
    helperText: 'Monitorando cada etapa',
    segmented: true,
    showItemLabels: true,
    stackedLabels: false,
  },
};

export const Responsive: Story = {
  render: baseRender,
  args: {
    label: 'Progresso responsivo',
    helperText: 'Redimensione a viewport para testar',
    value: 60,
    showPercentage: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
