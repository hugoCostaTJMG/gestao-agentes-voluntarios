import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { TagComponent } from '../../../app/shared/components/tag/tag.component';

type Story = StoryObj<TagComponent>;
const KINDS = ['primary','secondary','success','danger','warning','info','neutral'] as const;

const meta: Meta<TagComponent> = {
  title: 'Shared/Components/Tag',
  component: TagComponent,
  decorators: [
    moduleMetadata({ imports: [CommonModule, TagComponent] }),
  ],
  argTypes: {
    kind: { control: 'select', options: KINDS as unknown as string[] },
    size: { control: 'select', options: ['sm','md'] },
    text: { control: 'text' },
    filter: { control: 'boolean' },
    disabled: { control: 'boolean' },
    iconLeft: { control: 'text' },
    iconRight: { control: 'text' },
    clicked: { action: 'clicked' },
    closed: { action: 'closed' },
  },
};

export default meta;

export const Playground: Story = {
  args: {
    text: 'MG',
    kind: 'primary',
    size: 'md',
    filter: true,
  },
};

export const Examples: Story = {
  render: () => ({
    template: `
    <div style="display:flex; gap:8px; flex-wrap:wrap">
      <app-tag text="Ativo" kind="success"></app-tag>
      <app-tag text="Pendente" kind="warning"></app-tag>
      <app-tag text="Revogado" kind="danger"></app-tag>
      <app-tag text="Info" kind="info" iconLeft="fas fa-info-circle"></app-tag>
    </div>
    `,
  }),
};

