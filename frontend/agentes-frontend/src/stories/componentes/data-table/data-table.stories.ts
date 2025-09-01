// data-table.stories.ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../../app/shared/components/data-table/data-table.component';

const meta: Meta<DataTableComponent> = {
  title: 'Shared/Components/DataTable',
  component: DataTableComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, DataTableComponent],
    }),
  ],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    zebra: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    loading: { control: 'boolean' },
    selectable: {
      control: 'select',
      options: ['none', 'single', 'multi'],
    },
    expandable: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    toolbarTitle: { control: 'text' },
    toolbarDescription: { control: 'text' },
    showSearch: { control: 'boolean' },
    searchPlaceholder: { control: 'text' },
    errorMessage: { control: 'text' },
    batchActions: { control: 'object' },
    searchChange: { action: 'searchChange' },
    sortChange: { action: 'sortChange' },
    selectionChange: { action: 'selectionChange' },
    rowClick: { action: 'rowClick' },
    expandChange: { action: 'expandChange' },
    pageChange: { action: 'pageChange' },
    batchAction: { action: 'batchAction' },
  },
};
export default meta;
type Story = StoryObj<DataTableComponent>;

// Colunas e linhas de exemplo
const sampleColumns = [
  { id: 'name', header: 'Nome', field: 'name', sortable: true },
  { id: 'description', header: 'Descrição', field: 'description' },
];

const sampleRows = [
  { name: 'Item 1', description: 'Descrição do item 1' },
  { name: 'Item 2', description: 'Descrição do item 2' },
  { name: 'Item 3', description: 'Descrição do item 3' },
];

const batchActions = [
  { id: 'export', label: 'Exportar', icon: 'fa fa-download' },
  { id: 'delete', label: 'Excluir', icon: 'fa fa-trash', danger: true },
];

// 🟦 Story: Tabela default
export const Default: Story = {
  args: {
    size: 'md',
    zebra: true,
    columns: sampleColumns,
    rows: sampleRows,
    selectable: 'multi',
    batchActions,
    toolbarTitle: 'Tabela de exemplo',
    toolbarDescription: 'Descrição da tabela',
  },
};

// 🟦 Story: Expansível
export const Expandable: Story = {
  args: {
    ...Default.args,
    expandable: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-data-table
        [columns]="columns"
        [rows]="rows"
        [zebra]="zebra"
        [selectable]="selectable"
        [expandable]="expandable"
        [batchActions]="batchActions"
        (rowClick)="rowClick($event)">
        <ng-template #expandedRowTemplate let-row>
          <div class="expanded-content">
            <strong>{{ row.name }}</strong> — {{ row.description }}
          </div>
        </ng-template>
      </app-data-table>
    `,
  }),
};

// 🟦 Story: Skeleton (loading)
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

// 🟦 Story: Estado vazio
export const Empty: Story = {
  args: {
    ...Default.args,
    rows: [],
  },
  render: (args) => ({
    props: args,
    template: `
      <app-data-table
        [columns]="columns"
        [rows]="rows"
        [zebra]="zebra"
        [selectable]="selectable">
        <div empty-state>Nenhum dado encontrado</div>
      </app-data-table>
    `,
  }),
};

// 🟦 Story: Estado de erro
export const Error: Story = {
  args: {
    ...Default.args,
    rows: [],
    errorMessage: 'Erro ao carregar dados',
  },
};
