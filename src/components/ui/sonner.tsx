import { Toaster as Sonner, type ToasterProps } from 'sonner';

// Pa next-themes — aplikacioni është gjithmonë në temën light.
// Toast-et mbajnë pamjen e mëparshme: pilulë e errët me tekst të bardhë.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        className: 'justify-center text-sm font-medium',
      }}
      style={
        {
          '--normal-bg': 'var(--primary)',
          '--normal-text': 'var(--primary-foreground)',
          '--normal-border': 'transparent',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
