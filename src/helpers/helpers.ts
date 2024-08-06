interface IConfig {
  arrayNoNumber: boolean;
}
const onArrayForm = (
  name: string,
  data: { [key: string]: unknown },
  obj: { label: string; value: unknown }[],
  config?: IConfig
) => {
  let newObj = [...obj];
  for (const key in data) {
    if (
      !!data[key] &&
      (Array.isArray(data[key]) || typeof data[key] === "object") &&
      !(data[key] instanceof File)
    ) {
      let labelName = `${name}[${key}]`;
      if (!isNaN(Number(key)) && config?.arrayNoNumber) {
        labelName = `${name}[]`;
      }
      newObj = onArrayForm(
        labelName,
        data[key] as { [key: string]: unknown },
        newObj,
        config
      );
    } else {
      let labelName = `${name}[${key}]`;
      if (!isNaN(Number(key)) && config?.arrayNoNumber) {
        labelName = `${name}[]`;
      }
      newObj = [...newObj, { label: labelName, value: data[key] }];
    }
  }
  return newObj;
};

export const expandJSON = (
  data: { [key: string]: unknown },
  config?: IConfig
) => {
  let obj: { label: string; value: unknown }[] = [];
  for (const key in data) {
    if (
      !!data[key] &&
      (Array.isArray(data[key]) ||
        (typeof data[key] === "object" && !(data[key] instanceof File)))
    ) {
      obj = onArrayForm(
        `${key}`,
        data[key] as { [key: string]: unknown },
        obj,
        config
      );
    } else {
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
