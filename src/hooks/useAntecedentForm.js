import { useCallback, useState } from "react";

let nextId = 1;

const emptyAntecedent = () => ({
  _key: nextId++,
  condition_type: '',
  description: '',
  diagnosed_at: null,
  medication: '',
  notes: '',
});

const useAntecedentForm = () => {
  const [antecedents, setAntecedents] = useState([]);

  const addAntecedent = useCallback(() => {
    setAntecedents((prev) => [...prev, emptyAntecedent()]);
  }, []);

  const removeAntecedent = useCallback((key) => {
    setAntecedents((prev) => prev.filter((a) => a._key !== key));
  }, []);

  const updateAntecedent = useCallback((key, field, value) => {
    setAntecedents((prev) =>
      prev.map((a) => (a._key === key ? { ...a, [field]: value } : a)),
    );
  }, []);

  const clearAntecedents = useCallback(() => {
    setAntecedents([]);
  }, []);

  return {
    antecedents,
    addAntecedent,
    removeAntecedent,
    updateAntecedent,
    clearAntecedents,
  };
};

export default useAntecedentForm;
