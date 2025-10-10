import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '../../../app/shared/components/text-input/text-input.component';

type Story = StoryObj<TextInputComponent>;

const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<TextInputComponent> = {
  title: 'Shared/Components/Text Input',
  component: TextInputComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, TextInputComponent],
    }),
  ],
  argTypes: {
    size: { control: 'select', options: SIZES as unknown as string[] },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    warningMessage: { control: 'text' },
    prefixIcon: { control: 'text' },
    suffixIcon: { control: 'text' },
    clearable: { control: 'boolean' },
    fluid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    invalid: { control: 'boolean' },
    warn: { control: 'boolean' },
    maxLength: { control: 'number' },
    valueChange: { action: 'valueChange' },
    changed: { action: 'changed' },
    focused: { action: 'focused' },
    blurred: { action: 'blurred' },
  },
};

export default meta;

export const Playground: Story = {
  args: {
    label: 'Nome',
    placeholder: 'Digite seu nome',
    helperText: 'Campo obrigatório',
    size: 'md',
    fluid: true,
    clearable: true,
    value: '',
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Busca',
    placeholder: 'Pesquisar...',
    prefixIcon: 'fas fa-search',
    suffixIcon: 'fas fa-circle-info',
    fluid: true,
  },
};

export const Invalid: Story = {
  args: {
    label: 'Email',
    placeholder: 'seu@email',
    invalid: true,
    errorMessage: 'Formato inválido',
    fluid: true,
  },
};

