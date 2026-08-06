import { useMutation } from "@tanstack/react-query";
import {
  getOperations,
  type OperationsRequest,
} from "./operations.api";

export function useOperations() {
  return useMutation({
    mutationFn: (request: OperationsRequest) =>
      getOperations(request),
  });
}
