import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../../../app/shared/components/select/select.component';
import { DropdownOption } from '../../../app/shared/components/dropdown/dropdown.component';

type Story = StoryObj<SelectComponent>;
const SIZES = ['sm','md','lg'] as const;

const meta: Meta<SelectComponent> = {
  title: 'Shared/Components/Select',
  component: SelectComponent,
  decorators: [moduleMetadata({ imports: [CommonModule, SelectComponent] })],
  argTypes: {
    size: { control: 'select', options: SIZES as unknown as string[] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    warningMessage: { control: 'text' },
    invalid: { control: 'boolean' },
    warn: { control: 'boolean' },
    disabled: { control: 'boolean' },
    multi: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
  },
};

export default meta;

const SAMPLE_OPTS: DropdownOption[] = [
  { label: 'Belo Horizonte', value: 1 },
  { label: 'Uberlândia', value: 2 },
  { label: 'Juiz de Fora', value: 3 },
  { label: 'Montes Claros', value: 4 },
];

export const Playground: Story = {
  args: {
    label: 'Comarca',
    placeholder: 'Selecione a comarca',
    helperText: 'Escolha uma ou mais opções',
    size: 'md',
    options: SAMPLE_OPTS,
    multi: false,
  },
};

export const Multiple: Story = {
  args: {
    label: 'Comarcas',
    placeholder: 'Selecione comarcas',
    helperText: 'Multi-seleção habilitada',
    size: 'md',
    options: SAMPLE_OPTS,
    multi: true,
  },
};

