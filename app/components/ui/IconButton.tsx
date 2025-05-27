export interface IconButtonProps {
  description?: string;
  children?: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, description }: IconButtonProps) => {
  return (
    <button
      type="button"
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      {children}
      {description && <span className="sr-only">{description}</span>}
    </button>
  );
};
