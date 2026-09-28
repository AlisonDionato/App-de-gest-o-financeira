export interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
}
