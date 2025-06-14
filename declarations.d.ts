// declarations.d.ts
import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

// If you have other global type declarations, you can add them here.
// For example, if you were using CSS modules with custom naming:
// declare module '*.module.css' {
//   const classes: { readonly [key: string]: string };
//   export default classes;
// }
