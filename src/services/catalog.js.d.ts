declare module './catalog.js' {
  export type CatalogParams = Record<string, unknown>;
  export function getCatalog(
    resource: string,
    params?: CatalogParams
  ): Promise<unknown>;
  export function getCatalogById(
    resource: string,
    id: string | number
  ): Promise<unknown>;
  export function createCatalog(
    resource: string,
    payload: Record<string, unknown>
  ): Promise<unknown>;
  export function updateCatalog(
    resource: string,
    id: string | number,
    payload: Record<string, unknown>
  ): Promise<unknown>;
  export function deleteCatalog(
    resource: string,
    id: string | number
  ): Promise<unknown>;
  export {};
}
