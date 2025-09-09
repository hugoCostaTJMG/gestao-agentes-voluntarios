# Modal

Componente Modal standalone inspirado no Carbon Design System.

## API

### Inputs
- `open: boolean` – controla a visibilidade do modal.
- `size: 'sm' | 'md' | 'lg' | 'xl'` – tamanho do modal (padrão `lg`).
- `title: string` – título exibido no cabeçalho.
- `label?: string` – label opcional acima do título.
- `description?: string` – texto curto abaixo do cabeçalho.
- `showClose: boolean` – exibe botão de fechar no cabeçalho.
- `closeOnEsc: boolean`
- `closeOnBackdrop: boolean`
- `focusTrap: boolean`
- `initialFocus?: string` – seletor CSS do elemento que recebe foco ao abrir.
- `actions: ModalAction[]` – botões do rodapé.
- `busy: boolean` – estado de carregamento.
- `busyMessage: string`
- `steps: ModalStep[]` – exibe stepper no cabeçalho.
- `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` – atributos de acessibilidade opcionais.

### Outputs
- `openChange: EventEmitter<boolean>` – usado para two-way binding `[(open)]`.
- `closed: EventEmitter<'esc' | 'backdrop' | 'close-button' | 'action'>` – razão do fechamento.
- `action: EventEmitter<string>` – id da ação clicada.

### Tipos
```ts
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type ModalActionKind = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'cancel';

export interface ModalAction {
  id: string;
  label: string;
  kind: ModalActionKind;
  align?: 'left' | 'right';
  disabled?: boolean;
}

export interface ModalStep {
  label: string;
  optionalLabel?: string;
  state: 'complete' | 'current' | 'incomplete';
}
```

## Exemplo
```html
<button (click)="open = true" #trigger>Open</button>

<app-modal
  [(open)]="open"
  size="lg"
  [label]="'Optional label'"
  title="Title"
  [description]="'Lorem ipsum dolor sit amet…'"
  [steps]="[
    { label:'Step', optionalLabel:'Optional label', state:'current' },
    { label:'Step', optionalLabel:'Optional label', state:'incomplete' },
    { label:'Step', optionalLabel:'Optional label', state:'incomplete' }
  ]"
  [actions]="[
    { id:'cancel', label:'Cancel', kind:'ghost', align:'left' },
    { id:'secondary', label:'Button', kind:'secondary' },
    { id:'primary', label:'Button', kind:'primary' }
  ]"
  [busy]="isSaving"
  busyMessage="Loading message"
  (action)="onAction($event)"
  (closed)="onClosed($event)">
  <div modal-body>
    <!-- Conteúdo arbitrário -->
  </div>
</app-modal>
```
