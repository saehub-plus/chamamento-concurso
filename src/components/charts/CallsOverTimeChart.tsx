
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getConvocations } from '@/utils/storage';

export function CallsOverTimeChart() {
  // Prepare data for the chart
  const convocations = getConvocations();
  
  if (convocations.length === 0) {
    return null;
  }
  
  // Sort convocations by date
  const sortedConvocations = [...convocations]
    .filter(c => c.hasCalled)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedConvocations.length === 0) {
    return null;
  }
  
  // Group data by month
  const convocationsByMonth: Record<string, { date: string, calls: number, cumulative: number }> = {};
  let cumulativeCalls = 0;
  
  sortedConvocations.forEach(convocation => {
    const date = new Date(convocation.date);
    const monthKey = format(date, 'MM/yyyy');
    const callsCount = convocation.calledCandidates?.length || 0;
    
    cumulativeCalls += callsCount;
    
    if (convocationsByMonth[monthKey]) {
      convocationsByMonth[monthKey].calls += callsCount;
      convocationsByMonth[monthKey].cumulative = cumulativeCalls;
    } else {
      convocationsByMonth[monthKey] = { 
        date: format(date, 'MMM/yy'),
        calls: callsCount,
        cumulative: cumulativeCalls
      };
    }
  });
  
  const chartData = Object.values(convocationsByMonth);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Evolução de Chamamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} candidato(s)`, '']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#8884d8"
                name="Chamados no mês"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#82ca9d"
                name="Total acumulado"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
