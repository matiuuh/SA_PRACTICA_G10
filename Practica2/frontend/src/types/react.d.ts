// Declaración global para React si es necesario
import 'react';

declare module 'react' {
  interface FC<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
  }
}
