type DataTableTranslate = (
  key:
    | "rowsPerPage"
    | "pageOf"
    | "first"
    | "previous"
    | "next"
    | "last"
    | "selected",
  values?: Record<string, string | number | Date>,
) => string;

/** Shared ICU-safe labels for DataTablePagination — always pass page/pages/count. */
export function dataTablePaginationLabels(td: DataTableTranslate) {
  return {
    rowsPerPage: td("rowsPerPage"),
    pageOf: (page: number, pages: number) => td("pageOf", { page, pages }),
    first: td("first"),
    previous: td("previous"),
    next: td("next"),
    last: td("last"),
    selected: (count: number) => td("selected", { count }),
  };
}
