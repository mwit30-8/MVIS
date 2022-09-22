import type { CodegenConfig } from "@graphql-codegen/cli";
import "dotenv/config";

const config: CodegenConfig = {
  schema: process.env.BACKEND_URL as string,
  documents: ["./src/queries.graphql"],
  emitLegacyCommonJSImports: false,
  generates: {
    "generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-resolvers",
        "typescript-react-apollo",
      ],
    },
    "generated/introspection.ts": {
      plugins: [
        {
          "fragment-matcher": {
            useExplicitTyping: true,
          },
        },
      ],
    },
    "generated/introspection.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
