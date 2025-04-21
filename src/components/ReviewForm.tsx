import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { FC } from "react";
import DebouncedTextField from "./DebouncedTextField";
import { HorizontalSplitterChildProps } from "./HorizontalSplitter";

export interface Question {
  id: string;
  text: string;
  options: {
    value: number;
    label: string;
  }[];
}

export interface ReviewFormProps extends HorizontalSplitterChildProps {
  questions: Question[];
  answers: Record<string, number>;
  onAnswerChange: (questionId: string, value: number) => void;
  reviewerName: string;
  onReviewerNameChange: (name: string) => void;
}

export const questions: Question[] = [
  {
    id: "describe-dandiset",
    text: "How well does the notebook describe the Dandiset?",
    options: [
      { value: 0, label: "Not at all or very poorly" },
      { value: 1, label: "Reasonably well" },
      { value: 2, label: "Very well" },
    ],
  },
  {
    id: "load-dandiset",
    text: "How well does the notebook show how to load information about the Dandiset?",
    options: [
      { value: 0, label: "Not at all or very poorly" },
      { value: 1, label: "Reasonably well" },
      { value: 2, label: "Very well" },
    ],
  },
  {
    id: "load-nwb",
    text: "How well does the notebook show how to load basic information from an NWB file in the Dandiset?",
    options: [
      { value: 0, label: "Not at all or very poorly" },
      { value: 1, label: "Reasonably well" },
      { value: 2, label: "Very well" },
    ],
  },
  {
    id: "load-nwb-data",
    text: "How well does the notebook show how to load data from an NWB file in the Dandiset?",
    options: [
      { value: 0, label: "No data is loaded or is done very poorly" },
      { value: 1, label: "One piece of data is loaded" },
      { value: 2, label: "Two independent pieces of data are loaded" },
      {
        value: 3,
        label: "Three or more independent pieces of data are loaded",
      },
    ],
  },
  {
    id: "visualize-nwb-data",
    text: "How well does the notebook show how to visualize data from an NWB file in the Dandiset?",
    options: [
      { value: 0, label: "No data is visualized or is done very poorly" },
      { value: 1, label: "One piece of data is visualized" },
      { value: 2, label: "Two independent pieces of data are visualized" },
      {
        value: 3,
        label: "Three or more independent pieces of data are visualized",
      },
    ],
  },
  {
    id: "advanced-visualization",
    text: "Does the notebook create an advanced visualization involving multiple types of data from an NWB file in the Dandiset?",
    options: [
      {
        value: 0,
        label: "No advanced visualization is shown or is done ineffectively",
      },
      { value: 1, label: "A high quality advanced visualization is shown" },
    ],
  },
  {
    id: "plot-quality",
    text: "What is the quality of the plots in the notebook?",
    options: [
      { value: 0, label: "No plots are shown or are done very poorly" },
      { value: 1, label: "Reasonably good quality" },
      { value: 2, label: "Very good quality" },
    ],
  },
  {
    id: "plot-issues",
    text: "What issues are there with the plots in the notebook?",
    options: [
      { value: 0, label: "No issues" },
      { value: -1, label: "Some minor issues only" },
      { value: -2, label: "At least one major issue" },
      { value: -3, label: "Two or more major issues" },
    ],
  },
  {
    id: "analysis-issues",
    text: "What issues are there with the analysis in the notebook?",
    options: [
      { value: 0, label: "No issues" },
      { value: -1, label: "Some minor issues only" },
      { value: -2, label: "At least one major issue" },
      { value: -3, label: "Two or more major issues" },
    ],
  },
  {
    id: "unsupported-conclusions",
    text: "What unsupported conclusions are drawn in the notebook?",
    options: [
      { value: 0, label: "No unsupported conclusions" },
      { value: -1, label: "Some minor unsupported conclusions" },
      { value: -2, label: "At least one major unsupported conclusion" },
      { value: -3, label: "Two or more major unsupported conclusions" },
    ],
  },
  {
    id: "other-issues",
    text: "What other issues are there with the notebook?",
    options: [
      { value: 0, label: "No other issues" },
      { value: -1, label: "Some minor issues only" },
      { value: -2, label: "At least one major issue" },
      { value: -3, label: "Two or more major issues" },
    ],
  },
];

const ReviewForm: FC<ReviewFormProps> = ({
  width,
  height,
  answers,
  onAnswerChange,
  reviewerName,
  onReviewerNameChange,
}) => {
  return (
    <Paper
      sx={{
        width,
        height,
        overflowY: "auto",
        padding: 2,
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Notebook Review
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        To complete this review: 1. Read through the notebook displayed on the
        right side. 2. Use the "Add Note" button in the top right of any cell to
        attach specific notes to individual cells. 3. Answer the questions below
        based on your review. 4. Download the reviewed notebook as an .ipynb
        file using the menu bar at the top of the notebook. 5. Send the
        downloaded notebook to the appropriate person. Your review is
        automatically saved in your browser's local storage. You can revise and
        resend your review at any time until the browser cache is cleared.
      </Typography>
      <Stack spacing={3}>
        <FormControl>
          <FormLabel>Reviewer Name</FormLabel>
          <DebouncedTextField
            value={reviewerName}
            onChange={onReviewerNameChange}
            placeholder="Enter your name"
            fullWidth
            size="small"
          />
        </FormControl>
        {questions.map((question) => (
          <FormControl key={question.id}>
            <FormLabel>{question.text}</FormLabel>
            <RadioGroup
              value={answers[question.id] ?? ""}
              onChange={(e) =>
                onAnswerChange(question.id, Number(e.target.value))
              }
            >
              {question.options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        ))}
      </Stack>
    </Paper>
  );
};

export default ReviewForm;
