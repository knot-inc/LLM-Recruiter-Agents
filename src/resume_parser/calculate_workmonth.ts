import { unknown } from "zod";

export function calculateMonthsBetweenDates(
  startDateStr: string | undefined = "unknown",
  endDateStr: string | undefined = "unknown",
): number {
  if (startDateStr === "unknown" || endDateStr === "unknown") {
    return 0;
  }
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  // Calculate the difference in months
  const months = (endYear - startYear) * 12 + endMonth - startMonth;

  return months;
}
