export type MenuSelectable = 'none' | 'single' | 'multiple';

export interface MenuItem {
  id: string;
  label?: string;
  shortcut?: string;       // ex: '⌘X' ou 'Ctrl+X'
  trailingIcon?: string;   // ex: 'fa-regular fa-envelope'
  disabled?: boolean;
  danger?: boolean;        // item destrutivo
  selected?: boolean;
  checked?: boolean;       // para checkbox/radio
  role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'separator';
  dividerAbove?: boolean;  // adiciona separador acima
  ariaLabel?: string;
}
