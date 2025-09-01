import React from 'react';
import styles from './Input.module.css';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const inputClasses = [
    styles.input,
    fullWidth && styles.fullWidth,
    hasError && styles.error,
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}

        <input
          id={inputId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
      </div>

      {error && (
        <div id={`${inputId}-error`} className={styles.errorText} role='alert'>
          {error}
        </div>
      )}

      {helperText && !error && (
        <div id={`${inputId}-helper`} className={styles.helperText}>
          {helperText}
        </div>
      )}
    </div>
  );
}
