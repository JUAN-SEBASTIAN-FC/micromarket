import { useState, useCallback } from 'react';
import { EnterpriseErrorResponse, executeEnterpriseSafe } from '../lib/validation';

export interface UseValidationEngineReturn {
  error: EnterpriseErrorResponse | null;
  loading: boolean;
  setError: (error: EnterpriseErrorResponse | null) => void;
  clearError: () => void;
  validate: <T extends any[]>(
    validatorFn: (...args: T) => EnterpriseErrorResponse | null,
    ...args: T
  ) => boolean;
  executeSafe: <R>(
    operation: () => Promise<R>,
    contextSource: string
  ) => Promise<R | null>;
}

export function useValidationEngine(): UseValidationEngineReturn {
  const [error, setErrorState] = useState<EnterpriseErrorResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const setError = useCallback((err: EnterpriseErrorResponse | null) => {
    setErrorState(err);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  /**
   * Ejecuta una función de validación sincrónica. Setea el estado si falla.
   * Retorna true si pasa la validación, false en caso contrario.
   */
  const validate = useCallback(<T extends any[]>(
    validatorFn: (...args: T) => EnterpriseErrorResponse | null,
    ...args: T
  ): boolean => {
    const err = validatorFn(...args);
    if (err) {
      setErrorState(err);
      return false;
    }
    setErrorState(null);
    return true;
  }, []);

  /**
   * Envuelve una operación asíncrona (ej. consultas a Firestore).
   * Administra automáticamente el loading y formatea fallos inesperados.
   */
  const executeSafe = useCallback(async <R>(
    operation: () => Promise<R>,
    contextSource: string
  ): Promise<R | null> => {
    setLoading(true);
    setErrorState(null);
    try {
      const { data, error: err } = await executeEnterpriseSafe(operation, contextSource);
      if (err) {
        setErrorState(err);
        return null;
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    error,
    loading,
    setError,
    clearError,
    validate,
    executeSafe
  };
}
