import * as z from "myzod";

function unwrapSchema(
  schema: z.AnyType,
  features: { nullable: boolean; optional: boolean } = {
    nullable: false,
    optional: false,
  }
): { schema: z.AnyType; nullable: boolean; optional: boolean } {
  if (schema instanceof z.OptionalType) {
    return unwrapSchema(schema.schema, { ...features, optional: true });
  } else if (schema instanceof z.NullableType) {
    return unwrapSchema(schema.schema, { ...features, nullable: true });
  }

  return { schema, ...features };
}

function convert(schema0: z.AnyType) {
  let { schema, nullable } = unwrapSchema(schema0);

  const nullableType = (type: string) => (nullable ? [type, "null"] : type);

  // Primitive Types
  if (schema instanceof z.BooleanType) {
    return {
      type: nullableType("boolean"),
    };
  } else if (schema instanceof z.NumberType) {
    return {
      type: nullableType("number"),
    };
  } else if (schema instanceof z.StringType) {
    return {
      type: nullableType("string"),
    };
  } else if (schema instanceof z.NullType) {
    return {
      type: "null",
    };
  } else if (schema instanceof z.TupleType) {
    return {
      type: "array",
      items: (schema as any).schemas.map(convert),
    };
  } else if (schema instanceof z.ArrayType) {
    const innerSchema = convert(schema.schema);
    return {
      type: "array",
      items: innerSchema,
    };
  } else if (schema instanceof z.ObjectType) {
    const required = [];
    const properties = {};

    for (const [key, value] of Object.entries(schema.shape())) {
      let innerUnwrapped = unwrapSchema(value as any);

      const innerSchema = convert(innerUnwrapped.schema);
      if (!innerUnwrapped.optional) {
        required.push(key);
      }
      properties[key] = innerSchema;
    }

    return {
      type: "object",
      required,
      properties,
    };
  } else if (schema instanceof z.UnionType) {
    return {
      anyOf: (schema as any).schemas.map(convert),
    };
  } else if (schema instanceof z.IntersectionType) {
    let currentSchema = schema as any;

    const schemas = [currentSchema.right];
    while (currentSchema.left instanceof z.IntersectionType) {
      schemas.push[currentSchema.right];
      currentSchema = currentSchema.left;
    }

    schemas.push(currentSchema.left);

    return {
      allOf: schemas.reverse().map(convert),
    };
  }
}

export const ToJsonSchema = (schema: z.AnyType, options?: { key?: string }) => ({
  $schema: "https://json-schema.org/draft/2019-09/schema",
  // TODO: what is this for?
  ...options,
  ...convert(schema),
});

export default ToJsonSchema;
