import { ProgressBarItemStatus } from './progress-bar-item.component';

export interface ProgressBarSegmentMock {
  label: string;
  value: number;
  status?: ProgressBarItemStatus;
  tooltip?: string;
  icon?: string;
}

export const PROGRESS_BAR_DETERMINATE_MOCK = {
  value: 72,
  max: 100,
  label: 'Progress bar label',
  helperText: 'Optional helper text',
  showPercentage: true,
};

export const PROGRESS_BAR_INDETERMINATE_MOCK = {
  indeterminate: true,
  label: 'Carregando dados...',
  helperText: 'Isso pode levar alguns segundos',
};

export const PROGRESS_BAR_SUCCESS_MOCK = {
  value: 100,
  max: 100,
  status: 'success' as const,
  label: 'Upload concluído',
  helperText: 'Success message text',
  showPercentage: true,
};

export const PROGRESS_BAR_ERROR_MOCK = {
  value: 100,
  max: 100,
  status: 'error' as const,
  label: 'Falha ao enviar',
  helperText: 'Error message text',
  showPercentage: true,
};

export const PROGRESS_BAR_SEGMENTED_MOCK: ProgressBarSegmentMock[] = [
  { label: 'Baixando', value: 20, status: 'default' },
  { label: 'Processando', value: 40, status: 'default' },
  { label: 'Validando', value: 25, status: 'success' },
  { label: 'Publicando', value: 15, status: 'neutral' },
];
