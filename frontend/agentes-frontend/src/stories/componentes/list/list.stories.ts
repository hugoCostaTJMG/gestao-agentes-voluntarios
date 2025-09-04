import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ListComponent, ListItem } from '../../../app/shared/components/list/list.component';

// ---------- Exemplos de dados ----------
const UNORDERED_BASIC: ListItem[] = [
  { text: 'List item text' },
  { text: 'List item text' },
  { text: 'List item text' },
];

const UNORDERED_NESTED: ListItem[] = [
  {
    text: 'List item text',
    children: [
      { text: 'List item text' },
      {
        text: 'List item text',
        children: [{ text: 'List item text' }],
      },
    ],
  },
];

const ORDERED_BASIC: ListItem[] = [
  { text: 'List item text' },
  { text: 'List item text' },
  { text: 'List item text' },
];

const ORDERED_NESTED: ListItem[] = [
  {
    text: 'List item text',
    children: [
      { text: 'List item text' },
      { text: 'List item text' },
      {
        text: 'List item text',
        children: [
          { text: 'List item text' },
          { text: 'List item text' },
        ],
      },
    ],
  },
  { text: 'List item text' },
  { text: 'List item text' },
];

// Muitos itens para demonstrar 2 colunas
const MANY_ITEMS: ListItem[] = Array.from({ length: 10 }).map((_, i) => ({
  text: `List item ${i + 1}`,
}));

// ---------- Meta ----------
const meta: Meta<ListComponent> = {
  title: 'Shared/Components/List',
  component: ListComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ListComponent],
    }),
  ],
  parameters: {
    layout: 'padded',
    controls: { sort: 'requiredFirst' },
  },
  argTypes: {
    type: { control: 'select', options: ['unordered', 'ordered'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    columns: { control: { type: 'radio' }, options: [1, 2] },
    start: { control: { type: 'number', min: 1 } },
    ariaLabel: { control: 'text' },
    items: { control: 'object' },
  },
  args: {
    type: 'unordered',
    size: 'md',
    columns: 1,
    start: null,
    ariaLabel: 'Lista',
    items: UNORDERED_BASIC,
  },
};

export default meta;
type Story = StoryObj<ListComponent>;

// ---------- Stories ----------
export const UnorderedBasic: Story = {
  name: 'Unordered • Básico',
  args: {
    type: 'unordered',
    items: UNORDERED_BASIC,
  },
};

export const UnorderedNested: Story = {
  name: 'Unordered • Aninhada',
  args: {
    type: 'unordered',
    items: UNORDERED_NESTED,
  },
};

export const OrderedBasic: Story = {
  name: 'Ordered • Básico',
  args: {
    type: 'ordered',
    items: ORDERED_BASIC,
  },
};

export const OrderedNested: Story = {
  name: 'Ordered • Aninhada (1 → a → i)',
  args: {
    type: 'ordered',
    items: ORDERED_NESTED,
  },
};

export const TwoColumns: Story = {
  name: 'Unordered • 2 colunas',
  args: {
    type: 'unordered',
    columns: 2,
    items: MANY_ITEMS,
  },
};

export const StartAtFive: Story = {
  name: 'Ordered • começando em 5',
  args: {
    type: 'ordered',
    start: 5,
    items: ORDERED_BASIC,
  },
};

export const Sizes: Story = {
  name: 'Tamanhos (sm / md / lg)',
  render: (args) => ({
    // Passe os dados via props para evitar JSON no template
    props: { ...args, nested: UNORDERED_NESTED },
    template: `
      <div style="display:grid; gap:16px; max-width:720px;">
        <app-list [type]="'unordered'" [size]="'sm'" [items]="nested"></app-list>
        <app-list [type]="'unordered'" [size]="'md'" [items]="nested"></app-list>
        <app-list [type]="'unordered'" [size]="'lg'" [items]="nested"></app-list>
      </div>
    `,
  }),
  args: {},
};
