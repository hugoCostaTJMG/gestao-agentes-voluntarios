// container-list.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ContainerListComponent } from '../../../app/shared/components/container-list/container-list.component';

const meta: Meta<ContainerListComponent> = {
  title: 'Shared/Components/ContainerList',
  component: ContainerListComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ContainerListComponent],
    }),
  ],
  argTypes: {
    title: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ContainerListComponent>;

export const Default: Story = {
  args: {
    title: 'Minha Lista',
    disabled: false,
    items: [],
  },
};

export const WithItems: Story = {
  args: {
    title: 'Documentos',
    items: [
      { text: 'Contrato Assinado' },
      { text: 'Declaração de Residência' },
      { text: 'Carteira de Identidade' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    title: 'Lista Bloqueada',
    disabled: true,
    items: [
      { text: 'Item 1', disabled: true },
      { text: 'Item 2', disabled: true },
    ],
  },
};

export const Responsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1', // simula responsividade
    },
  },
  args: {
    title: 'Lista Responsiva',
    items: [
      { text: 'Item A' },
      { text: 'Item B' },
      { text: 'Item C' },
    ],
  },
};
