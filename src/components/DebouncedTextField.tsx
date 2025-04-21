import { FC, useCallback, useEffect, useRef, useState } from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface DebouncedTextFieldProps
  extends Omit<TextFieldProps, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

const DebouncedTextField: FC<DebouncedTextFieldProps> = ({
  value: externalValue,
  onChange,
  debounceMs = 1000,
  ...textFieldProps
}) => {
  const [internalValue, setInternalValue] = useState(externalValue);

  useEffect(() => {
    if (internalValue) return;
    setInternalValue(externalValue);
  }, [externalValue, internalValue]);

  const changeScheduled = useRef(false);
  const valueToSet = useRef("");

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      valueToSet.current = newValue;
      if (changeScheduled.current) return;
      changeScheduled.current = true;
      const timeoutId = setTimeout(() => {
        changeScheduled.current = false;
        onChange(valueToSet.current);
      }, debounceMs);

      return () => {
        clearTimeout(timeoutId);
        changeScheduled.current = false;
      };
    },
    [onChange, debounceMs],
  );

  // Handle immediate internal state updates and trigger debounced external updates
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange],
  );

  return (
    <TextField
      {...textFieldProps}
      value={internalValue}
      onChange={handleChange}
    />
  );
};

export default DebouncedTextField;
