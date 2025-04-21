/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NotebookCell {
  metadata: {
    nbfiddle_notes?: Array<any>;
  };
  // Add other cell properties as needed
  [key: string]: any;
}

export interface NotebookData {
  cells: NotebookCell[];
  // Add other notebook properties as needed
  [key: string]: any;
}
