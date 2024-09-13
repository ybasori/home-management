import { wbvtInstance } from "src/config/axios";
import { onFetchAllAsync } from "./lazyFetch";
import {
  API_PHOTOS,
  API_PREFERENCES,
  API_THINGS,
  API_UPLOAD,
} from "src/config/api";

const getAllChildren = (
  items: { id: string }[],
  itemsBefore: { id: string }[] = [],
  cb: (result: { id: string }[]) => void = () => null
) => {
  onFetchAllAsync(wbvtInstance)(
    items.map((item) => ({
      url: `${API_THINGS}`,
      data: {
        filter: {
          parent_id: item.id,
        },
      },
    })),
    {
      success(res) {
        let dt: { id: string }[] = [];
        res
          .map((item) => item.data.result.data)
          .forEach((item) => {
            dt = [...dt, ...item];
          });
        if (dt.length === 0) {
          cb([...itemsBefore, ...items]);
        } else {
          getAllChildren(
            dt,
            [
              ...JSON.parse(JSON.stringify(itemsBefore)),
              ...JSON.parse(JSON.stringify(items)),
            ],
            cb
          );
        }
      },
      error() {
        return null;
      },
    }
  );
};

const getAllPhotos = (
  items: { id: string }[],
  cb: (result: { id: string; upload_id: string }[]) => void = () => null
) => {
  onFetchAllAsync(wbvtInstance)(
    items.map((item) => ({
      url: `${API_PHOTOS}`,
      data: {
        filter: {
          things_id: item.id,
        },
      },
    })),
    {
      success(res) {
        let dt: { id: string; upload_id: string }[] = [];
        res
          .map((item) => item.data.result.data)
          .forEach((item) => {
            dt = [...dt, ...item];
          });
        cb([...dt]);
      },
      error() {
        return null;
      },
    }
  );
};
const getAllPrefs = (
  items: { id: string }[],
  cb: (result: { id: string }[]) => void = () => null
) => {
  onFetchAllAsync(wbvtInstance)(
    items.map((item) => ({
      url: `${API_PREFERENCES}`,
      data: {
        filter: {
          things_id: item.id,
        },
      },
    })),
    {
      success(res) {
        let dt: { id: string }[] = [];
        res
          .map((item) => item.data.result.data)
          .forEach((item) => {
            dt = [...dt, ...item];
          });
        cb([...dt]);
      },
      error() {
        return null;
      },
    }
  );
};

export const onDeleteThings = async (
  items: { id: string }[],
  {
    beforeSend,
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
  getAllChildren(items, [], (dt) => {
    getAllPhotos(dt, (pt) => {
      getAllPrefs(dt, (pr) => {
        const config = [
          ...pt.map((item) => ({
            url: `${API_UPLOAD}/${item.upload_id}`,
            method: "DELETE" as "DELETE",
          })),
          ...pt.map((item) => ({
            url: `${API_PHOTOS}/${item.id}`,
            method: "DELETE" as "DELETE",
          })),
          ...pr.map((item) => ({
            url: `${API_PREFERENCES}/${item.id}`,
            method: "DELETE" as "DELETE",
          })),
          ...dt.map((item) => ({
            url: `${API_THINGS}/${item.id}`,
            method: "DELETE" as "DELETE",
          })),
        ];
        // console.log(m);
        onFetchAllAsync(wbvtInstance)(config, {
          beforeSend,
          success,
          error,
        });
      });
    });
  });
};
