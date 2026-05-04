import type { ValidationRule } from '../types';

export const validateRecord = (record: any, rules: ValidationRule[]) => {
  const errors: Record<string, string[]> = {};

  rules.forEach(rule => {
    const val = record[rule.field];
    let isValid = true;
    let errorMsg = '';

    if (val === undefined || val === null || val === '') {
      if (rule.condition === 'required') {
        isValid = false;
        errorMsg = 'Required';
      }
    } else {
      switch (rule.type) {
        case 'string':
        case 'email':
        case 'phone': {
          const strVal = String(val);
          if (rule.condition === 'minLength' && strVal.length < Number(rule.value)) { isValid = false; errorMsg = `Min length ${rule.value}`; }
          if (rule.condition === 'maxLength' && strVal.length > Number(rule.value)) { isValid = false; errorMsg = `Max length ${rule.value}`; }
          if (rule.condition === 'startsWith' && !strVal.startsWith(String(rule.value))) { isValid = false; errorMsg = `Must start with ${rule.value}`; }
          if (rule.condition === 'endsWith' && !strVal.endsWith(String(rule.value))) { isValid = false; errorMsg = `Must end with ${rule.value}`; }
          if (rule.condition === 'notEqual' && strVal === String(rule.value)) { isValid = false; errorMsg = `Cannot be ${rule.value}`; }
          if (rule.condition === 'regex' && !new RegExp(String(rule.value)).test(strVal)) { isValid = false; errorMsg = `Must match regex ${rule.value}`; }
          if (rule.type === 'email' && rule.condition === 'validEmail') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(strVal)) { isValid = false; errorMsg = 'Invalid email'; }
          }
          break;
        }
        case 'number': {
          const numVal = Number(val);
          if (rule.condition === 'min' && numVal < Number(rule.value)) { isValid = false; errorMsg = `Min ${rule.value}`; }
          if (rule.condition === 'max' && numVal > Number(rule.value)) { isValid = false; errorMsg = `Max ${rule.value}`; }
          break;
        }
        case 'date': {
          const dateVal = new Date(val).getTime();
          const targetDate = new Date(String(rule.value)).getTime();
          if (rule.condition === 'minDate' && dateVal < targetDate) { isValid = false; errorMsg = `After ${rule.value}`; }
          if (rule.condition === 'maxDate' && dateVal > targetDate) { isValid = false; errorMsg = `Before ${rule.value}`; }
          break;
        }
      }
    }

    if (!isValid) {
      if (!errors[rule.field]) errors[rule.field] = [];
      errors[rule.field].push(errorMsg);
    }
  });

  return errors;
};
