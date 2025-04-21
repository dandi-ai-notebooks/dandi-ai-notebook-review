/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper } from "@mui/material";
import { FC, useEffect, useRef } from "react";
import { NotebookData } from "../types";
import { HorizontalSplitterChildProps } from "./HorizontalSplitter";

export interface NotebookViewerProps extends HorizontalSplitterChildProps {
  url: string;
  onNotebookContent: (content: NotebookData) => void;
  onIframeRef?: (ref: any) => void;
}

const NotebookViewer: FC<NotebookViewerProps> = ({
  width,
  height,
  url,
  onNotebookContent,
  onIframeRef,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    onIframeRef?.(iframeRef);
  }, [onIframeRef]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "notebookContent") {
        let notebookData: NotebookData | undefined;
        try {
          notebookData = JSON.parse(event.data.content) as NotebookData;
        } catch (error) {
          console.error("Error parsing notebook content:", error);
        }
        if (notebookData) {
          onNotebookContent(notebookData);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onNotebookContent]);

  return (
    <Paper
      sx={{
        width,
        height,
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        src={url}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Notebook Viewer"
      />
    </Paper>
  );
};

export default NotebookViewer;
