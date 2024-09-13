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
        headers: {
          "Content-Type":
            type === "json" ? "application/json" : "multipart/form-data",
        },
      });
      success(response.data);
    } catch (err) {
      error(err);
    }
  };
};

export const onFetchAllAsync =
  (axiosInstance: AxiosInstance) =>
  (
    config: {
      url: string;
      path?: string;
      method?: "GET" | "POST" | "PUT" | "DELETE";
      data?: unknown;
      type?: "formdata" | "json";
    }[],
    {
      beforeSend = () => null,
      success,
      error,
    }: {
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
    }
  ) => {
    beforeSend();
    Promise.all(
      (Array.isArray(config) ? config : []).map((item) => {
        const form = new FormData();
        if (item.data) {
          const dt = expandJSON(item.data as { [key: string]: string | Blob });
          for (let i in dt) {
            form.append(dt[i].label, dt[i].value);
          }
        }
        return axiosInstance({
          method: item.method ?? "GET",
          url: item.url + (item.path ?? ""),
          headers: {
            "Content-Type":
              item.type === "json" ? "application/json" : "multipart/form-data",
          },
          ...((item.method ?? "GET") === "GET"
            ? {
                params: item.data,
              }
            : { data: item.type === "json" ? item.data : form }),
        });
      })
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
        console.log(err);
        error(err);
      });
  };
