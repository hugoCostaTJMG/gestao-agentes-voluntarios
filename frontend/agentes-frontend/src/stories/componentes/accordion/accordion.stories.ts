import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { AccordionComponent } from '../../../app/shared/components/accordion/accordion.component';

const meta: Meta<AccordionComponent> = {
  title: 'Shared/Components/Accordion',
  component: AccordionComponent,
  decorators: [
    moduleMetadata({
      imports: [AccordionComponent],
    }),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    loading: { control: 'boolean' },
    toggled: { action: 'toggled' }, // loga no painel Actions
  },
};

export default meta;
type Story = StoryObj<AccordionComponent>;

const sampleItems = [
  { title: 'Primeiro item', content: 'Conteúdo do primeiro item.' },
  { title: 'Segundo item', content: 'Conteúdo do segundo item.' },
  { title: 'Terceiro item (desabilitado)', content: 'Esse está desabilitado.', disabled: true },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    type: 'primary',
    size: 'md',
    loading: false,
  },
};

export const WithIcons: Story = {
  args: {
    items: sampleItems,
    type: 'secondary',
    size: 'md',
    iconLeft: 'fas fa-star',
    iconRight: 'fas fa-chevron-right',
  },
};

export const Danger: Story = {
  args: {
    items: sampleItems,
    type: 'danger',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    items: sampleItems,
    loading: true,
  },
};
