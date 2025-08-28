import { getRequestLogger } from '@helpers/request-context';
import axios from 'axios';

const api = axios.create();
api.interceptors.request.use(
  (config) => {
    const logger = getRequestLogger();
    logger.info(
      {
        type: 'http-request',
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
      },
      'Outbound Request',
    );
    return config;
  },
  (error) => {
    const logger = getRequestLogger();
    logger.error({ type: 'http-request-error', err: error }, 'Outbound Request Error');
    return Promise.reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
  },
);

api.interceptors.response.use(
  (response) => {
    const logger = getRequestLogger();
    logger.info(
      {
        type: 'http-response',
        url: response.config.url,
        status: response.status,
        data: response.data,
      },
      'Inbound Response',
    );
    return response;
  },
  (error) => {
    const logger = getRequestLogger();
    logger.error(error, 'Inbound Response Error');
    return Promise.reject(new Error(typeof error === 'string' ? error : JSON.stringify(error)));
  },
);

export default api;
