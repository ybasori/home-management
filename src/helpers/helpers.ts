const onArrayForm = (
  name: string,
  data: { [key: string]: unknown },
  obj: { label: string; value: unknown }[]
) => {
  let newObj = [...obj];
  for (const key in data) {
    if (
      !!data[key] &&
      (Array.isArray(data[key]) || typeof data[key] === "object") &&
      !(data[key] instanceof File)
    ) {
      newObj = onArrayForm(
        `${name}[${key}]`,
        data[key] as { [key: string]: unknown },
        newObj
      );
    } else {
      newObj = [...newObj, { label: `${name}[${key}]`, value: data[key] }];
    }
  }
  return newObj;
};

export const expandJSON = (data: { [key: string]: unknown }) => {
  let obj: { label: string; value: unknown }[] = [];
  for (const key in data) {
    if (
      !!data[key] &&
      (Array.isArray(data[key]) ||
        (typeof data[key] === "object" && !(data[key] instanceof File)))
    ) {
      console.log(key, data[key], 1);
      obj = onArrayForm(`${key}`, data[key] as { [key: string]: unknown }, obj);
    } else {
      console.log(key, data[key], 2);
      obj = [
        ...obj,
        {
          label: key,
          value: data[key],
        },
      ];
    }
  }
  return obj;
};
