# Edit Employee — Smoke Test Log
**Feature:** Phase 3, Item 2 — Edit Employee (`EditEmployeeComponent`)
**Branch:** `feature/employee-portal-ui`

---

## Completed Tests

### E1 — Edit Route Navigation & Role Gating
**Commit:** `47d0941`
**Verified:**
- `EmployeeDetailComponent.onEdit()` navigates to `/employees/:id/edit` using the numeric `employee.id`.
- Route `employees/:id/edit` is registered **before** `employees/:id` in `app.routes.ts`, preventing the literal segment `"edit"` from being captured by the dynamic ID route.
- The Edit button in the detail template is gated behind `isHR() || isManager()`, so it is hidden from plain Employee-role users.

---

### E2 — Loading Spinner Wiring
**Commit:** `47d0941`
**Verified:**
- `loading` is set to `true` at the start of `fetchEmployee()`.
- Spinner is shown via `*ngIf="loading"` while the GET is in-flight.
- Form is gated behind `*ngIf="!loading && !loadError && employee"` — it is never rendered until the data has loaded successfully.
- `loading` is correctly toggled back to `false` on both the `next` and `error` paths of the `getEmployeeById` subscription.

---

### E3 — Form Pre-fill via patchValue
**Commit:** `b499426`
**Verified:**
- `fetchEmployee()` calls the private `patchForm(emp: Employee)` helper on the `next` path (`.component.ts` line 117).
- `patchForm` calls `this.form.patchValue(...)` mapping all 11 fields:
  - `firstName`, `lastName`, `email`, `department`, `position`, `hireDate`, `status`, `role` — mapped directly from the `Employee` record.
  - `phoneNumber`, `address` — mapped with `?? ''` fallback for optional fields.
  - `managerId` — mapped with `?? null` fallback.
- Every field has a matching `formControlName` binding in the template (`.component.html` lines 60, 75, 92, 108, 122, 141, 156, 172, 184, 199, 210), confirming the form control values will be reflected in the UI immediately after `patchValue` runs.

---

### E4 — Validation Errors on Empty / Invalid Submit
**Commit:** `b499426`
**Verified:**
- `onSubmit()` calls `this.form.markAllAsTouched()` when `form.invalid`, causing all untouched controls to surface their errors (`.component.ts` line 161).
- `isInvalid(name)` returns `true` when a control is `invalid && (dirty || touched)` (`.component.ts` lines 152–154).
- Required fields with error messages in the template:

  | Field        | Validators                              | Error messages shown                               |
  |--------------|-----------------------------------------|----------------------------------------------------|
  | `firstName`  | `required`, `maxLength(50)`             | "First name is required." / "Max 50 characters."  |
  | `lastName`   | `required`, `maxLength(50)`             | "Last name is required." / "Max 50 characters."   |
  | `email`      | `required`, `email`, `maxLength(100)`   | "Email is required." / "Enter a valid email address." / "Max 100 characters." |
  | `department` | `required`                              | "Department is required."                          |
  | `position`   | `required`, `maxLength(100)`            | "Position is required." / "Max 100 characters."   |
  | `hireDate`   | `required`                              | "Hire date is required."                           |
  | `role`       | `required`                              | "Role is required."                                |
  | `status`     | `required`                              | "Status is required."                              |
  | `phoneNumber`| `pattern(/^[+\d\s\-().]{7,20}$/)`       | "Enter a valid phone number (7–20 digits)."        |
  | `address`    | `maxLength(200)`                        | "Max 200 characters."                              |

- The `has-error` CSS class is applied to the `.form-group` wrapper via `[class.has-error]="isInvalid(name)"` for all validated fields, providing visual highlighting in addition to the inline message.

---

### E5 — Successful Save Triggers PUT and Navigates Back
**Commit:** `b499426`
**Verified:**
- `onSubmit()` sets `submitting = true` and clears `submitError` before the API call (`.component.ts` lines 165–166).
- `employeeService.updateEmployee(this.employeeId, payload)` is called with the correct numeric ID and a fully-constructed `UpdateEmployeeRequest` payload (line 184).
- On the `next` path: `submitting` is set back to `false` and `this.router.navigate(['/employees', this.employeeId])` routes the user to the employee detail page (lines 186–187).
- During the in-flight period, the Save button shows "Saving…" text with a spinner and is `[disabled]="submitting"` (`.component.html` lines 227–229), preventing double-submit.
- The Cancel button is also `[disabled]="submitting"` during submission (line 224).

---

### E6 — API Failure on Submit Shows Error Banner and Re-enables Save
**Commit:** `b499426`
**Verified:**
- On the `error` path of the `updateEmployee` subscription: `submitting` is set to `false` and `submitError` is populated from `err?.error?.message ?? err?.error?.error ?? 'Failed to update employee. Please try again.'` (`.component.ts` lines 190–193).
- The `submitError` banner is rendered inside the `<form>` block via `*ngIf="submitError"` (`.component.html` lines 43–45), so it appears only when there is an error and is scoped within the form context.
- Because `submitting` is `false` after the error, the Save button's `[disabled]="submitting"` binding re-enables it immediately, allowing the user to retry.
- The `loadError` banner (outside the form) is not affected by a submit failure — the two error states are fully independent.

---

### E7 — Load Error State: Banner, Retry Button, and Form Hidden
**Commit:** `f7efc70`
**Verified:**
- `fetchEmployee()` sets `loading = true` and `loadError = ''` at the start of every call (`.component.ts` lines 108–109), so a retry always begins with a clean state.
- On the `error` path of `getEmployeeById`: `loading` is set to `false` and `loadError` is populated from `err?.error?.message ?? err?.error?.error ?? 'Failed to load employee data. Please try again.'` (`.component.ts` lines 120–124).
- The load error banner is rendered via `*ngIf="loadError"` with `role="alert"` (`.component.html` lines 26–29), displaying the error message and a **Retry** button.
- The Retry button binds `(click)="fetchEmployee()"` directly (`.component.html` line 28), re-triggering the full fetch cycle on click.
- The form is gated behind `*ngIf="!loading && !loadError && employee"` (`.component.html` line 37), so it remains completely hidden when `loadError` is non-empty — the user never sees a partially-rendered form alongside the error banner.
- The loading spinner is independently gated by `*ngIf="loading"` (`.component.html` line 32), so it shows again during a retry request and disappears once the response arrives.
- The `submitError` state is not affected by a load failure — the two error states are fully independent.

---

## Production Build — Week 6 Verification
**Result:** ✅ Zero compilation errors

```
Lazy chunk files      | Names                     |  Raw size | Estimated transfer size
chunk-PM2B6N7L.js     | edit-employee-component   |  19.69 kB |                 4.71 kB

Application bundle generation complete. [3.120 seconds]
```

---

## Pending Tests (Week 7)

| ID  | Description                                                                 |
|-----|-----------------------------------------------------------------------------|
| E8  | HR access control: non-HR users redirected to `/employees` in `ngOnInit()`  |
| E9  | Cancel button navigates back without triggering any API call                |
| E10 | Definitive production build sign-off for Phase 3, Item 2                   |
