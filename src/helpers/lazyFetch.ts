import axios from "axios";

export const onFetch = async ({
  url,
  method = "GET",
  data = null,
  beforeSend,
  success,
  error,
}: {
  url: string;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  data?: unknown;
  beforeSend: () => void;
  success: (data: unknown) => void;
  error: (err: unknown) => void;
}) => {
  try {
    beforeSend();
    const response = await axios({
      url,
      method,
      ...(!!data ? { data } : {}),
    });
    success(response.data.data);
  } catch (err) {
    error(err);
  }
};
