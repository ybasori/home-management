interface IConfig {
  arrayNoNumber: boolean;
}
type IData = { [key: string]: any };
type IDataResult = { label: string; value: any };

const onArrayForm = (
  name: string,
  data: IData,
  obj: IDataResult[],
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
      newObj = onArrayForm(labelName, data[key] as IData, newObj, config);
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

export const expandJSON = (data: IData, config?: IConfig) => {
  let obj: IDataResult[] = [];
  for (const key in data) {
    if (
      !!data[key] &&
      (Array.isArray(data[key]) ||
        (typeof data[key] === "object" && !(data[key] instanceof File)))
    ) {
      obj = onArrayForm(
        `${key}`,
        data[key] as { [key: string]: string | Blob },
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
