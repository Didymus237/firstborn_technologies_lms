# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.10. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

you can create ingest files anywhere but the most important part is:

```ts
app.use(
    //Expose the middleware on our recommend path at `/api/inngest`.
    "/api/inngest",
    //Pass in the Inngest client instance.  
    serve({
        client: inngest,
        functions: [userCreated],
    })
)
