import { api } from "../../lib/api";
import type { OperationsResponse } from "./types";

export interface OperationsRequest {
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
  userId?: string;

  filters?: {
    projectName?: string;
    plateNumber?: string;
    documentNo?: string;
    customerName?: string;
    supplierName?: string;
  };
}

export function getOperations(request: OperationsRequest) {
  return api<OperationsResponse>("/api/v1/operations/query", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

