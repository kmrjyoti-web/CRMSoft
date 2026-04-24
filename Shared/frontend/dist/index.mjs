// components/aic/GSTInput.tsx
import { forwardRef, useState, useId } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
function validateGST(value) {
  return GST_REGEX.test(value.trim().toUpperCase());
}
var GSTInput = forwardRef(
  ({ label, value = "", onChange, error, showValidation = true, className, required, id, ...rest }, ref) => {
    const [touched, setTouched] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const normalized = value.toUpperCase();
    const isValid = validateGST(normalized);
    const showError = error ?? (touched && normalized.length > 0 && !isValid ? "Invalid GST number (e.g. 27AABCS1234A1Z5)" : void 0);
    return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
      label && /* @__PURE__ */ jsxs("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1", children: [
        label,
        required && /* @__PURE__ */ jsx("span", { className: "text-red-500 ml-0.5", "aria-hidden": "true", children: "*" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref,
          id: inputId,
          type: "text",
          inputMode: "text",
          maxLength: 15,
          value: normalized,
          onChange: (e) => onChange?.(e.target.value.toUpperCase()),
          onBlur: () => setTouched(true),
          placeholder: "e.g. 27AABCS1234A1Z5",
          "aria-label": label ?? "GST Number",
          "aria-required": required,
          "aria-invalid": showError ? "true" : "false",
          "aria-describedby": showError ? errorId : void 0,
          className: [
            "w-full rounded-md border px-3 py-2 text-sm font-mono uppercase tracking-wider",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            showError ? "border-red-400 focus:ring-red-400" : "border-gray-300",
            className ?? ""
          ].join(" "),
          ...rest
        }
      ),
      showValidation && !showError && touched && normalized.length === 15 && isValid && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-green-600", role: "status", children: "\u2713 Valid GST number" }),
      showError && /* @__PURE__ */ jsx("p", { id: errorId, role: "alert", className: "mt-1 text-xs text-red-500", children: showError })
    ] });
  }
);
GSTInput.displayName = "GSTInput";

// components/aic/PANInput.tsx
import { forwardRef as forwardRef2, useState as useState2, useId as useId2 } from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
function validatePAN(value) {
  return PAN_REGEX.test(value.trim().toUpperCase());
}
var PANInput = forwardRef2(
  ({ label, value = "", onChange, error, showValidation = true, className, required, id, ...rest }, ref) => {
    const [touched, setTouched] = useState2(false);
    const generatedId = useId2();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const normalized = value.toUpperCase();
    const isValid = validatePAN(normalized);
    const showError = error ?? (touched && normalized.length > 0 && !isValid ? "Invalid PAN (e.g. ABCDE1234F)" : void 0);
    return /* @__PURE__ */ jsxs2("div", { className: "w-full", children: [
      label && /* @__PURE__ */ jsxs2("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1", children: [
        label,
        required && /* @__PURE__ */ jsx2("span", { className: "text-red-500 ml-0.5", "aria-hidden": "true", children: "*" })
      ] }),
      /* @__PURE__ */ jsx2(
        "input",
        {
          ref,
          id: inputId,
          type: "text",
          inputMode: "text",
          maxLength: 10,
          value: normalized,
          onChange: (e) => onChange?.(e.target.value.toUpperCase()),
          onBlur: () => setTouched(true),
          placeholder: "e.g. ABCDE1234F",
          "aria-label": label ?? "PAN Number",
          "aria-required": required,
          "aria-invalid": showError ? "true" : "false",
          "aria-describedby": showError ? errorId : void 0,
          className: [
            "w-full rounded-md border px-3 py-2 text-sm font-mono uppercase tracking-widest",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            showError ? "border-red-400 focus:ring-red-400" : "border-gray-300",
            className ?? ""
          ].join(" "),
          ...rest
        }
      ),
      showValidation && !showError && touched && normalized.length === 10 && isValid && /* @__PURE__ */ jsx2("p", { className: "mt-1 text-xs text-green-600", role: "status", children: "\u2713 Valid PAN" }),
      showError && /* @__PURE__ */ jsx2("p", { id: errorId, role: "alert", className: "mt-1 text-xs text-red-500", children: showError })
    ] });
  }
);
PANInput.displayName = "PANInput";

// components/aic/StateSelect.tsx
import { forwardRef as forwardRef3, useId as useId3 } from "react";

// ../common/constants/indian-states.ts
var INDIAN_STATES = [
  // States
  { code: "AP", name: "Andhra Pradesh", gstCode: "37" },
  { code: "AR", name: "Arunachal Pradesh", gstCode: "12" },
  { code: "AS", name: "Assam", gstCode: "18" },
  { code: "BR", name: "Bihar", gstCode: "10" },
  { code: "CG", name: "Chhattisgarh", gstCode: "22" },
  { code: "GA", name: "Goa", gstCode: "30" },
  { code: "GJ", name: "Gujarat", gstCode: "24" },
  { code: "HR", name: "Haryana", gstCode: "06" },
  { code: "HP", name: "Himachal Pradesh", gstCode: "02" },
  { code: "JH", name: "Jharkhand", gstCode: "20" },
  { code: "KA", name: "Karnataka", gstCode: "29" },
  { code: "KL", name: "Kerala", gstCode: "32" },
  { code: "MP", name: "Madhya Pradesh", gstCode: "23" },
  { code: "MH", name: "Maharashtra", gstCode: "27" },
  { code: "MN", name: "Manipur", gstCode: "14" },
  { code: "ML", name: "Meghalaya", gstCode: "17" },
  { code: "MZ", name: "Mizoram", gstCode: "15" },
  { code: "NL", name: "Nagaland", gstCode: "13" },
  { code: "OR", name: "Odisha", gstCode: "21" },
  { code: "PB", name: "Punjab", gstCode: "03" },
  { code: "RJ", name: "Rajasthan", gstCode: "08" },
  { code: "SK", name: "Sikkim", gstCode: "11" },
  { code: "TN", name: "Tamil Nadu", gstCode: "33" },
  { code: "TG", name: "Telangana", gstCode: "36" },
  { code: "TR", name: "Tripura", gstCode: "16" },
  { code: "UP", name: "Uttar Pradesh", gstCode: "09" },
  { code: "UK", name: "Uttarakhand", gstCode: "05" },
  { code: "WB", name: "West Bengal", gstCode: "19" },
  // Union Territories
  { code: "AN", name: "Andaman & Nicobar Islands", gstCode: "35" },
  { code: "CH", name: "Chandigarh", gstCode: "04" },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu", gstCode: "26" },
  { code: "DL", name: "Delhi", gstCode: "07" },
  { code: "JK", name: "Jammu & Kashmir", gstCode: "01" },
  { code: "LA", name: "Ladakh", gstCode: "38" },
  { code: "LD", name: "Lakshadweep", gstCode: "31" },
  { code: "PY", name: "Puducherry", gstCode: "34" }
];

// components/aic/StateSelect.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var StateSelect = forwardRef3(
  ({
    label,
    value = "",
    onChange,
    error,
    placeholder = "Select state",
    showGstCode = false,
    className,
    required,
    id,
    ...rest
  }, ref) => {
    const generatedId = useId3();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return /* @__PURE__ */ jsxs3("div", { className: "w-full", children: [
      label && /* @__PURE__ */ jsxs3("label", { htmlFor: inputId, className: "block text-sm font-medium text-gray-700 mb-1", children: [
        label,
        required && /* @__PURE__ */ jsx3("span", { className: "text-red-500 ml-0.5", "aria-hidden": "true", children: "*" })
      ] }),
      /* @__PURE__ */ jsxs3(
        "select",
        {
          ref,
          id: inputId,
          value,
          onChange: (e) => onChange?.(e.target.value),
          "aria-label": label ?? "State",
          "aria-required": required,
          "aria-invalid": error ? "true" : "false",
          "aria-describedby": error ? errorId : void 0,
          className: [
            "w-full rounded-md border px-3 py-2 text-sm bg-white",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            error ? "border-red-400 focus:ring-red-400" : "border-gray-300",
            className ?? ""
          ].join(" "),
          ...rest,
          children: [
            /* @__PURE__ */ jsx3("option", { value: "", children: placeholder }),
            INDIAN_STATES.map((state) => /* @__PURE__ */ jsx3("option", { value: state.code, children: showGstCode ? `${state.gstCode} \u2014 ${state.name}` : state.name }, state.code))
          ]
        }
      ),
      error && /* @__PURE__ */ jsx3("p", { id: errorId, role: "alert", className: "mt-1 text-xs text-red-500", children: error })
    ] });
  }
);
StateSelect.displayName = "StateSelect";
export {
  GSTInput,
  PANInput,
  StateSelect,
  validateGST,
  validatePAN
};
