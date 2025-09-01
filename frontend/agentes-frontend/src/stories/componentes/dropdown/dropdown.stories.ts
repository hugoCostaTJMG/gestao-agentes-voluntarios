// dropdown.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DropdownComponent, DropdownOption } from '../../../app/shared/components/dropdown/dropdown.component';

const meta: Meta<DropdownComponent> = {
  title: 'Shared/Components/Dropdown',
  component: DropdownComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, DropdownComponent],
    }),
  ],
  argTypes: {
    placeholder: { control: 'text' },
    fluid: { control: 'boolean' },
    multiSelect: { control: 'boolean' },
    parentCheckbox: { control: 'boolean' },
    options: { control: 'object' },
    changed: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<DropdownComponent>;

const OPTIONS: DropdownOption[] = [
  { label: 'Opção 1', value: '1', icon: 'fa fa-user' },
  { label: 'Opção 2', value: '2', icon: 'fa fa-cog' },
  { label: 'Opção 3', value: '3', disabled: true, icon: 'fa fa-lock' },
  { label: 'Opção 4', value: '4', icon: 'fa fa-star' },
];


export const Default: Story = {
  args: {
    placeholder: 'Selecione uma opção',
    options: OPTIONS,
    fluid: false,
    multiSelect: false,
    parentCheckbox: false,
  },
};

export const Fluid: Story = {
  args: {
    ...Default.args,
    fluid: true,
  },
};

export const MultiSelect: Story = {
  args: {
    placeholder: 'Selecione várias opções',
    options: OPTIONS.map(o => ({ ...o, checkbox: true })), // ativa checkboxes
    multiSelect: true,
  },
};

export const WithParentCheckbox: Story = {
  args: {
    ...MultiSelect.args,
    parentCheckbox: true,
  },
};
