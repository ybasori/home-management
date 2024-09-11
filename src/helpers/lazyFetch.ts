import { AxiosInstance, AxiosResponse } from "axios";
import { expandJSON } from "./helpers";

export const onFetch = (axiosInstance: AxiosInstance) => {
  return async ({
    url,
    method = "GET",
    data = null,
    type = "json",
    beforeSend,
    success,
    error,
  }: {
    url: string;
    method?: "DELETE" | "GET" | "POST" | "PUT";
    data?: unknown;
    type?: "json" | "formdata";
    beforeSend: () => void;
    success: (data: {
      message: string;
      result: { data: any; total: number } | any;
    }) => void;
    error: (err: unknown) => void;
  }) => {
    try {
      beforeSend();
      const form = new FormData();
      const dt = expandJSON(data as { [key: string]: string | Blob });
      for (let i in dt) {
        form.append(dt[i].label, dt[i].value);
      }
      const response = await axiosInstance({
        url,
        method,
        ...(!!data ? { data } : {}),
        ...(method === "GET"
          ? {
              params: data,
            }
          : { data: type === "json" ? data : form }),
      });
      success(response.data);
    } catch (err) {
      error(err);
    }
  };
};

export const onFetchAllAsync =
  (axiosInstance: AxiosInstance) =>
  ({
    url,
    method = "GET",
    path: paths = [],
    data: datas = [],
    type,
    beforeSend = () => null,
    success,
    error,
  }: {
    url: string;
    path?: string[];
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: unknown[];
    type?: "formdata" | "json";
    beforeSend?: () => void;
    success: (
      response: {
        config: { params: any };
        data: {
          message: string;
          result: { data: any; total: number } | any;
        };
      }[]
    ) => void;
    error: (xhr: any) => void;
  }) => {
    beforeSend();
    Promise.all(
      (Array.isArray(datas) ? datas : []).length > 0
        ? (Array.isArray(datas) ? datas : []).map((item, index) => {
            const form = new FormData();
            const dt = expandJSON(item as { [key: string]: string | Blob });
            for (let i in dt) {
              form.append(dt[i].label, dt[i].value);
            }
            return axiosInstance({
              method,
              url:
                url +
                (paths.length > 0 && paths.length === datas.length
                  ? `/${paths[index]}`
                  : ""),
              headers: {
                "Content-Type":
                  type === "json" ? "application/json" : "multipart/form-data",
              },
              ...(method === "GET"
                ? {
                    params: item,
                  }
                : { data: type === "json" ? item : form }),
            });
          })
        : (Array.isArray(paths) ? paths : []).length > 0
        ? (Array.isArray(paths) ? paths : []).map((item) => {
            return axiosInstance({
              method,
              url: url + `/${item}`,
              headers: {
                "Content-Type":
                  type === "json" ? "application/json" : "multipart/form-data",
              },
            });
          })
        : []
    )
      .then((response) => {
        success(
          response.map((item) => ({
            config: {
              params: item.config.params,
            },
            data: item.data,
          }))
        );
      })
      .catch((err) => {
        error(err);
      });
  };
