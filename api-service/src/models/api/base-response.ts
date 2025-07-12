export type BaseResponse<T> = {
  code: string;
  message?: string;
  errors: string | null;
  data?: T;
  serverTime: string;
  spanID?: string;
  traceID?: string;
};
