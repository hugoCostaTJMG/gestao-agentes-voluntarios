import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../app/shared/components/search/search.component';

type Story = StoryObj<SearchComponent>;
const SIZES = ['sm','md','lg'] as const;

const meta: Meta<SearchComponent> = {
  title: 'Shared/Components/Search',
  component: SearchComponent,
  decorators: [
    moduleMetadata({ imports: [CommonModule, SearchComponent] }),
  ],
  argTypes: {
    size: { control: 'select', options: SIZES as unknown as string[] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    fluid: { control: 'boolean' },
    debounceMs: { control: 'number' },
    value: { control: 'text' },
    valueChange: { action: 'valueChange' },
    search: { action: 'search' },
  },
};

export default meta;

export const Playground: Story = {
  args: {
    placeholder: 'Buscar agente por nome ou CPF',
    size: 'md',
    fluid: true,
    debounceMs: 300,
  },
};

