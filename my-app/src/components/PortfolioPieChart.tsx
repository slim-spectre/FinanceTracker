import {type IPortfolioPieChartProps } from "../types/IPortfolioPieChartProps";
import { ResponsiveContainer,PieChart,Pie,Tooltip } from "recharts";

function PortfolioPieChart({chartData} : IPortfolioPieChartProps){

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          >
          
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PortfolioPieChart;