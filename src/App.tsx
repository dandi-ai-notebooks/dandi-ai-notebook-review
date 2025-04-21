/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { CssBaseline } from "@mui/material";
import HorizontalSplitter from "./components/HorizontalSplitter";
import ReviewForm, { questions } from "./components/ReviewForm";
import NotebookViewer from "./components/NotebookViewer";
import { NotebookData } from "./types";

function App() {
  const [notebookData, setNotebookData] = useState<NotebookData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [url, setUrl] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("");
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Get URL from query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("notebook_url");
    if (urlParam) {
      // Convert Github URL to nbfiddle URL if needed
      const nbfiddleUrl = `https://nbfiddle.app/?url=${urlParam}&embedded=1`;
      // const nbfiddleUrl = `http://localhost:5174/?url=${urlParam}&embedded=1`;
      setUrl(nbfiddleUrl);
    }
  }, []);

  const handleNotebookContent = useCallback((content: NotebookData) => {
    setNotebookData(content);
    // Extract existing answers from notebook metadata if available
    const cellMetadataNbfiddleNotes =
      content.cells[0]?.metadata?.nbfiddle_notes || [];
    const reviewNote = cellMetadataNbfiddleNotes.find((note: any) => {
      try {
        const parsedNote = JSON.parse(note.text);
        return (
          typeof parsedNote === "object" &&
          parsedNote.type === "dandi-ai-notebook-review"
        );
      } catch {
        return false;
      }
    });
    const parsedReviewNote = reviewNote ? JSON.parse(reviewNote.text) : null;
    setAnswers({}); // Reset answers
    if (parsedReviewNote) {
      const reviewAnswers = parsedReviewNote.answers;
      if (reviewAnswers) {
        setAnswers(reviewAnswers);
      }
      if (parsedReviewNote.reviewer_name) {
        setReviewerName(parsedReviewNote.reviewer_name);
      }
    }
  }, []);

  const [iframeRef, setIframeRef] = useState<any>(null);

  const handleReviewerNameChange = useCallback(
    (name: string) => {
      setReviewerName(name);
      if (!iframeRef || !iframeRef.current || !notebookData) {
        return;
      }

      const updatedNotebook = { ...notebookData };
      if (updatedNotebook.cells.length === 0) {
        return;
      }

      const cellMetadataNbfiddleNotes =
        updatedNotebook.cells[0].metadata?.nbfiddle_notes || [];
      let reviewNoteIndex = cellMetadataNbfiddleNotes.findIndex((note: any) => {
        try {
          const parsedNote = JSON.parse(note.text);
          return (
            typeof parsedNote === "object" &&
            parsedNote.type === "dandi-ai-notebook-review"
          );
        } catch {
          return false;
        }
      });

      if (reviewNoteIndex === -1) {
        reviewNoteIndex = cellMetadataNbfiddleNotes.length;
        cellMetadataNbfiddleNotes.push({
          user: "dandi-ai-notebook-review",
          text: JSON.stringify({
            type: "dandi-ai-notebook-review",
            notebook_url:
              window.location.search.split("notebook_url=")[1]?.split("&")[0] ||
              "",
            reviewer_name: name,
            answers: answers,
          }),
          timestamp: new Date().toISOString(),
        });
      } else {
        const reviewNote = cellMetadataNbfiddleNotes[reviewNoteIndex];
        const reviewNoteContent = reviewNote
          ? JSON.parse(reviewNote.text)
          : null;
        const updatedReviewNoteContent = {
          ...reviewNoteContent,
          type: "dandi-ai-notebook-review",
          notebook_url:
            window.location.search.split("notebook_url=")[1]?.split("&")[0] ||
            "",
          reviewer_name: name,
          answers,
        };
        cellMetadataNbfiddleNotes[reviewNoteIndex] = {
          ...reviewNote,
          text: JSON.stringify(updatedReviewNoteContent),
          timestamp: new Date().toISOString(),
        };
      }

      if (!updatedNotebook.cells[0].metadata) {
        updatedNotebook.cells[0].metadata = {};
      }
      updatedNotebook.cells[0].metadata.nbfiddle_notes =
        cellMetadataNbfiddleNotes;
      updateNotebook(iframeRef, updatedNotebook);
    },
    [notebookData, iframeRef, answers],
  );

  const handleAnswerChange = useCallback(
    (questionId: string, value: number) => {
      if (!iframeRef || !iframeRef.current) {
        console.error("Iframe reference is not set");
        return;
      }
      const newAnswers = { ...answers, [questionId]: value };

      // Update notebook metadata with new answers
      if (notebookData) {
        const updatedNotebook = { ...notebookData };
        if (updatedNotebook.cells.length === 0) {
          return;
        }
        const cellMetadataNbfiddleNotes =
          updatedNotebook.cells[0].metadata?.nbfiddle_notes || [];
        let reviewNoteIndex = cellMetadataNbfiddleNotes.findIndex(
          (note: any) => {
            try {
              const parsedNote = JSON.parse(note.text);
              return (
                typeof parsedNote === "object" &&
                parsedNote.type === "dandi-ai-notebook-review"
              );
            } catch {
              return false;
            }
          },
        );
        if (reviewNoteIndex === -1) {
          reviewNoteIndex = cellMetadataNbfiddleNotes.length;
          // add dummy review note
          cellMetadataNbfiddleNotes.push({
            user: "dandi-ai-notebook-review",
            text: JSON.stringify({
              type: "dandi-ai-notebook-review",
              notebook_url:
                window.location.search
                  .split("notebook_url=")[1]
                  ?.split("&")[0] || "",
              reviewer_name: reviewerName,
            }),
            timestamp: new Date().toISOString(),
          });
        }
        const reviewNote = cellMetadataNbfiddleNotes[reviewNoteIndex];
        const reviewNoteContent = reviewNote
          ? JSON.parse(reviewNote.text)
          : null;
        const updatedReviewNoteContent = {
          ...reviewNoteContent,
          type: "dandi-ai-notebook-review",
          notebook_url:
            window.location.search.split("notebook_url=")[1]?.split("&")[0] ||
            "",
          reviewer_name: reviewerName,
          answers: newAnswers,
        };
        const updatedCellMetadataNbfiddleNotes = cellMetadataNbfiddleNotes.map(
          (note: any, index: number) => {
            if (index === reviewNoteIndex) {
              return {
                ...note,
                text: JSON.stringify(updatedReviewNoteContent),
                timestamp: new Date().toISOString(),
              };
            }
            return note;
          },
        );
        if (!updatedNotebook.cells[0].metadata) {
          updatedNotebook.cells[0].metadata = {};
        }
        updatedNotebook.cells[0].metadata.nbfiddle_notes =
          updatedCellMetadataNbfiddleNotes;
        updateNotebook(iframeRef, updatedNotebook);
      }
    },
    [answers, notebookData, iframeRef, reviewerName],
  );

  if (!url) {
    return <div>Please provide a notebook URL in the query parameters</div>;
  }

  return (
    <>
      <CssBaseline />
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <HorizontalSplitter
          width={dimensions.width}
          height={dimensions.height}
          initialSplitterPosition={dimensions.width / 3}
        >
          {notebookData ? (
            <ReviewForm
              width={0} // Width will be set by HorizontalSplitter
              height={0} // Height will be set by HorizontalSplitter
              questions={questions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              reviewerName={reviewerName}
              onReviewerNameChange={handleReviewerNameChange}
            />
          ) : (
            <div>Loading notebook</div>
          )}
          <NotebookViewer
            width={0} // Width will be set by HorizontalSplitter
            height={0} // Height will be set by HorizontalSplitter
            url={url}
            onNotebookContent={handleNotebookContent}
            onIframeRef={setIframeRef}
          />
        </HorizontalSplitter>
      </div>
    </>
  );
}

const updateNotebook = (iframeRef: any, notebookData: NotebookData) => {
  if (iframeRef.current?.contentWindow) {
    iframeRef.current.contentWindow.postMessage(
      {
        type: "updateNotebook",
        content: JSON.stringify(notebookData),
      },
      "*",
    );
  }
};

export default App;
