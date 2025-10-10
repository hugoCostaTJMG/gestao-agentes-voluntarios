import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { TextAreaComponent } from '../../../app/shared/components/text-area/text-area.component';

type Story = StoryObj<TextAreaComponent>;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<TextAreaComponent> = {
  title: 'Shared/Components/Text Area',
  component: TextAreaComponent,
  decorators: [
    moduleMetadata({ imports: [CommonModule, TextAreaComponent] }),
  ],
  argTypes: {
    size: { control: 'select', options: SIZES as unknown as string[] },
    rows: { control: 'number' },
    autoResize: { control: 'boolean' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    helperText: { control: 'text' },
    errorMessage: { control: 'text' },
    warningMessage: { control: 'text' },
    invalid: { control: 'boolean' },
    warn: { control: 'boolean' },
    valueChange: { action: 'valueChange' },
    changed: { action: 'changed' },
    focused: { action: 'focused' },
    blurred: { action: 'blurred' },
  },
};

export default meta;

export const Playground: Story = {
  args: {
    label: 'Descrição',
    placeholder: 'Digite uma descrição detalhada...',
    rows: 4,
    autoResize: true,
    helperText: 'Até 500 caracteres',
    fluid: true,
    value: '',
  },
};

