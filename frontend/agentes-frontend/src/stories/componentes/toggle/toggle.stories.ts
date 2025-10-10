import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ToggleComponent } from '../../../app/shared/components/toggle/toggle.component';

type Story = StoryObj<ToggleComponent>;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<ToggleComponent> = {
  title: 'Shared/Components/Toggle',
  component: ToggleComponent,
  decorators: [
    moduleMetadata({ imports: [CommonModule, ToggleComponent] }),
  ],
  argTypes: {
    size: { control: 'select', options: SIZES as unknown as string[] },
    label: { control: 'text' },
    helperText: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    checkedChange: { action: 'checkedChange' },
  },
};

export default meta;

export const Playground: Story = {
  args: {
    label: 'Ativar notificações',
    helperText: 'Você pode alterar a qualquer momento',
    size: 'md',
    checked: true,
  },
};

