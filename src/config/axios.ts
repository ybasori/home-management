import axios from "axios";

export const wbvtInstance = axios.create({
  baseURL: "https://wbvt.online/api-developer/yusuf_basori/home-management",
  headers: { "X-Api-Key": "aadf8aa0-5745-4f91-83cc-4fea51a2d279" },
});
