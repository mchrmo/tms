export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role: {
        id: number;
        name: string;
      };
    };
  }
}


export type DefaultFormProps = {
  edit?: boolean, 
  onUpdate?: () => void, 
  onCancel?: () => void,
  defaultValues?: any
}


import '@tanstack/react-table' 
export type SelectOptionDef = {
  title: string,
  value: string
} 

declare module '@tanstack/react-table' {
  interface ColumnMeta {
    filterVariant?: 'select' | 'range',
    selectOptions?: SelectOptionDef[]
  }
}
