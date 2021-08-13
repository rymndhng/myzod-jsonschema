import * as z from "myzod";
import Ajv from "ajv";
import ToJsonSchema from "./index";

const ajv = new Ajv();

describe("ToJsonSchema", () => {
  test.each([
    ["string", z.string(), { type: "string" }],
    ["boolean", z.boolean(), { type: "boolean" }],
    ["number", z.number(), { type: "number" }],
    ["null", z.null(), { type: "null" }],
    [
      "arrays",
      z.array(z.string()),
      { type: "array", items: { type: "string" } },
    ],
    [
      "array of objects",
      z.array(z.object({ a: z.string() })),
      {
        type: "array",
        items: { type: "object", properties: { a: { type: "string" } } },
      },
    ],
    [
      "union",
      z.string().or(z.number()),
      { anyOf: [{ type: "string" }, { type: "number" }] },
    ],
    [
      "intersection",
      z.string().and(z.number()),
      { allOf: [{ type: "string" }, { type: "number" }] },
    ],
    [
      "tuple",
      z.tuple([z.number(), z.string(), z.object({ s: z.string() })]),
      {
        type: "array",
        items: [
          { type: "number" },
          { type: "string" },
          {
            type: "object",
            required: ["s"],
            properties: { s: { type: "string" } },
          },
        ],
      },
    ],
  ])("%s", (key, zSchema, expected) => {
    const jsonschema = ToJsonSchema(zSchema, { key });
    expect(jsonschema).toMatchObject(expected);
    expect(ajv.validateSchema(jsonschema, true)).toBeTruthy();
  });
});

describe("objects", () => {
  test("basic-object", () => {
    expect(ToJsonSchema(z.object({ string: z.string() }))).toEqual({
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      required: ["string"],
      properties: {
        string: { type: "string" },
      },
    });
  });

  test("complex-object", () => {
    const schema = z.object({
      null: z.null(),
      nullOptional: z.null().optional(),

      string: z.string(),
      stringOptional: z.string().optional(),

      boolean: z.boolean(),
      booleanOptional: z.boolean().optional(),

      number: z.number(),
      numberOptional: z.number().optional(),

      arrayOfString: z.array(z.string()),
      arrayObject: z.array(z.object({ s: z.string() })),

      object: z.object({ s: z.string() }),
      objectOptional: z.object({ s: z.string() }).optional(),
    });

    expect(ToJsonSchema(schema)).toEqual({
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      required: [
        "null",
        "string",
        "boolean",
        "number",
        "arrayOfString",
        "arrayObject",
        "object",
      ],
      properties: {
        arrayObject: {
          type: "array",
          items: {
            properties: { s: { type: "string" } },
            required: ["s"],
            type: "object",
          },
        },
        arrayOfString: {
          type: "array",
          items: { type: "string" },
        },
        boolean: {
          type: "boolean",
        },
        booleanOptional: {
          type: "boolean",
        },
        null: {
          type: "null",
        },
        nullOptional: {
          type: "null",
        },
        number: {
          type: "number",
        },
        numberOptional: {
          type: "number",
        },
        object: {
          type: "object",
          required: ["s"],
          properties: { s: { type: "string" } },
        },
        objectOptional: {
          type: "object",
          required: ["s"],
          properties: { s: { type: "string" } },
        },
        string: {
          type: "string",
        },
        stringOptional: {
          type: "string",
        },
      },
    });
  });
});
