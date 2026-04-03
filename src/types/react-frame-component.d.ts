declare module "react-frame-component" {
  import type { ComponentType, HTMLAttributes, ReactNode } from "react";

  export interface FrameProps extends HTMLAttributes<HTMLIFrameElement> {
    children?: ReactNode;
    head?: ReactNode;
    initialContent?: string;
    mountTarget?: string;
  }

  const Frame: ComponentType<FrameProps>;

  export default Frame;
}
