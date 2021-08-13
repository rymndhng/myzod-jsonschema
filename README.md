# myzod-jsonschema

Converts myzod schemas to JsonSchemas.

``` typescript
import * as z from "myzod";
import toJsonSchema from "myzod-jsonschema";

const schema = z.object({ name: z.string() })
const jsonSchema toJsonSchema(schema);
console.log(jsonSchema);

// This outputs
{
  $schema: "https://json-schema.org/draft/2019-09/schema",
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string" },
  },
}
```

## What doesn't currently work?

The commonly used types works, however it lacks some of the smaller features, such as:

- [ ] No support for schema metadata, such as doc strings, title, etc
- [ ] Numbers: predicates for min/max length
- [ ] Arrays: predicates for min/max length
- [ ] String: predicates for min/max length, Regex Patterns
- [ ] Enums/Literals
- [ ] Objects: allowUnknown
- Predicates
