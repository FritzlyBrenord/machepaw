"use client";

import { useEffect, useState } from "react";
import Frame from "react-frame-component";

interface PreviewFrameProps {
  children: React.ReactNode;
  frameKey: string;
  deviceLabel: string;
  frameWidth: string;
  frameHeight?: string;
}

export function PreviewFrame({
  children,
  frameKey,
  deviceLabel,
  frameWidth,
  frameHeight = "100%",
}: PreviewFrameProps) {
  const [headContent, setHeadContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const styles = Array.from(
      document.head.querySelectorAll('link[rel="stylesheet"], style')
    ).map((node, index) => {
      if (node instanceof HTMLLinkElement) {
        return (
          <link
            key={`link-${index}`}
            rel="stylesheet"
            href={node.href}
          />
        );
      }

      return (
        <style
          key={`style-${index}`}
          dangerouslySetInnerHTML={{ __html: node.innerHTML }}
        />
      );
    });

    setHeadContent(styles);
  }, []);

  return (
    <div className="mx-auto flex h-full w-full flex-col items-center justify-start gap-3">
      <div className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
        {deviceLabel}
      </div>
      <div
        className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl transition-all duration-300"
        style={{
          width: frameWidth,
          maxWidth: "100%",
          height: frameHeight,
        }}
      >
        <Frame
          key={frameKey}
          head={headContent}
          className="h-full w-full border-0 bg-white"
          initialContent={`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
              </head>
              <body>
                <div id="mountHere"></div>
              </body>
            </html>
          `}
          mountTarget="#mountHere"
        >
          {children}
        </Frame>
      </div>
    </div>
  );
}
