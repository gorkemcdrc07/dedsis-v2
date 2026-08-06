import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "./dashboard.api";

type UseDashboardInput = {
  startDate: string;
  endDate: string;
};

export function useDashboard({
  startDate,
  endDate,
}: UseDashboardInput) {
  return useQuery({
    queryKey: [
      "dashboard",
      startDate,
      endDate,
    ],
    queryFn: () =>
      getDashboard({
        startDate: new Date(
          `${startDate}T00:00:00`,
        ),
        endDate: new Date(
          `${endDate}T23:59:59`,
        ),
      }),
    enabled: Boolean(
      startDate && endDate,
    ),
    staleTime: 5 * 60 * 1000,
  });
}

