// Custom Zod validation resolver for React Hook Form
// Fits the "Zod Validation" + "React Hook Form" requirements without extra packages
export const zodResolver = (schema) => async (values) => {
  try {
    const data = schema.parse(values);
    return {
      values: data,
      errors: {}
    };
  } catch (err) {
    const errors = {};
    if (err.inner || err.issues) {
      err.issues.forEach((issue) => {
        const path = issue.path.join('.');
        errors[path] = {
          type: issue.code,
          message: issue.message
        };
      });
    }
    return {
      values: {},
      errors
    };
  }
};
