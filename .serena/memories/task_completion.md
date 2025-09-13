# Task Completion Guidelines

Before considering a task complete, ensure the following checks pass. The `check-all` script is a convenient way to run all of these at once.

1.  **Type Checking:** Ensure there are no TypeScript errors.
    ```bash
    bun run type-check
    ```

2.  **Formatting & Linting:** Ensure the code is formatted correctly.
    ```bash
    bun run format
    ```

3.  **Testing:** Ensure all tests pass.
    ```bash
    bun run test
    ```


### All-in-One Check

You can run all of the above checks with a single command:

```bash
 bun run check-all
```
