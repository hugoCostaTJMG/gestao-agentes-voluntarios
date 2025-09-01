// button.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonComponent } from '../../../app/shared/components/buttons/button/button.component';

const TYPES = ['primary', 'secondary', 'danger', 'ghost'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

const meta: Meta<ButtonComponent> = {
  title: 'Shared/Components/Button',
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        RouterTestingModule, // ✅ mocka o RouterLink e ActivatedRoute
        ButtonComponent,
      ],
    }),
  ],
  argTypes: {
    type: { control: 'select', options: TYPES as unknown as string[] },
    size: { control: 'select', options: SIZES as unknown as string[] },
    label: { control: 'text' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    disabled: { control: 'boolean' },
    buttonType: { control: 'select', options: ['button', 'submit', 'reset'] },
    clicked: { action: 'clicked' },
  },
  args: {
    type: 'primary',
    size: 'md',
    label: 'Botão',
    disabled: false,
    buttonType: 'button',
  },
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Default: Story = {};
