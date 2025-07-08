export type paths = {
  '/ready': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** return the readiness */
    get: operations['getReadiness'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/openapi.json': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** get the openapi json specification */
    get: operations['getOpenapiJson'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
};
export type webhooks = Record<string, never>;
export type components = {
  schemas: {
    Readiness: {
      readiness: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
};
export type Readiness = components['schemas']['Readiness'];
export type $defs = Record<string, never>;
export interface operations {
  getReadiness: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description readiness */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Readiness'];
        };
      };
    };
  };
  getOpenapiJson: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description returns this document */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': Record<string, never>;
        };
      };
    };
  };
}
