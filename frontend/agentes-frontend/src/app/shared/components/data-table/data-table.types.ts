export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn {
  /** id único da coluna (usado para sort e trackBy) */
  id: string;
  /** label do header */
  header: string;
  /** chave do objeto row (quando render padrão) */
  field?: string;
  /** alinhamento do conteúdo */
  align?: 'left' | 'center' | 'right';
  /** se pode ordenar */
  sortable?: boolean;
  /** largura opcional (ex: '160px', '20%') */
  width?: string;
  /** template opcional para célula (ng-template) */
  cellTemplate?: any; // TemplateRef<{$implicit:any,row:any,col:DataTableColumn}>
  /** template opcional para header */
  headerTemplate?: any;
}

export interface DataTableBatchAction {
  id: string;
  label: string;
  icon?: string; // classe fa
  danger?: boolean;
}
