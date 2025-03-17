"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", application: 186, interview: 80 },
  { month: "February", application: 305, interview: 200 },
  { month: "March", application: 237, interview: 120 },
  { month: "April", application: 73, interview: 190 },
  { month: "May", application: 209, interview: 130 },
  { month: "June", application: 214, interview: 140 },
];

const chartConfig = {
  application: {
    label: "Applications",
    color: "hsl(var(--chart-1))",
  },
  interview: {
    label: "Interviews",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ApplicationVsInterview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application vs Interviews</CardTitle>
        <CardDescription>
          Showing total vital scores for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="interview"
              type="natural"
              fill="var(--color-interview)"
              fillOpacity={0.4}
              stroke="var(--color-interview)"
              stackId="a"
            />
            <Area
              dataKey="application"
              type="natural"
              fill="var(--color-application)"
              fillOpacity={0.4}
              stroke="var(--color-application)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
