import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../app/shared/components/pagination/pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Shared/Components/Pagination',
  component: PaginationComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, PaginationComponent],
    }),
  ],
  args: {
    variant: 'nav',
    totalItems: 300,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    page: 1,
    maxPageButtons: 7,
    disabled: false,
    showFirstLast: false,
    ariaLabel: 'Paginação',
    compact: false,
    itemsLabel: 'Items per page:',
    ofLabel: 'of',
    itemsWord: 'items',
    pageWord: 'Page',
  },
  argTypes: {
    variant: { control: 'select', options: ['nav', 'table-bar'] },
    totalItems: { control: { type: 'number', min: 0 } },
    pageSize: { control: { type: 'number', min: 1 } },
    pageSizeOptions: { control: 'object' },
    page: { control: { type: 'number', min: 1 } },
    maxPageButtons: { control: { type: 'number', min: 3 } },
    disabled: { control: 'boolean' },
    showFirstLast: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    compact: { control: 'boolean' },
    itemsLabel: { control: 'text' },
    ofLabel: { control: 'text' },
    itemsWord: { control: 'text' },
    pageWord: { control: 'text' },
    pageChange: { action: 'pageChange' },
    pageSizeChange: { action: 'pageSizeChange' },
  },
  parameters: {
    controls: { expanded: true },
    docs: {
      description: {
        component:
          'Componente de paginação Carbon-like com variantes para navegação ou barra de tabela, responsivo e acessível.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<PaginationComponent>;

/** Ajuste livre via Controls */
export const Playground: Story = {
  name: 'Playground',
};

/** Navegação padrão com reticências e botões numéricos */
export const NavManyPages: Story = {
  args: {
    variant: 'nav',
    totalItems: 120,
    pageSize: 10,
    page: 6,
    maxPageButtons: 7,
  },
};

/** Variante nav com botões de primeira/última página */
export const NavWithBoundaries: Story = {
  args: {
    variant: 'nav',
    totalItems: 200,
    pageSize: 10,
    page: 4,
    showFirstLast: true,
  },
};

/** Barra de tabela completa com seleção de itens por página */
export const TableBar: Story = {
  args: {
    variant: 'table-bar',
    totalItems: 430,
    pageSize: 50,
    page: 3,
  },
};

/** Exemplo compacto (forçado) para telas menores */
export const Compact: Story = {
  args: {
    variant: 'table-bar',
    totalItems: 150,
    pageSize: 20,
    page: 2,
    compact: true,
  },
};

/** Estado desabilitado */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
