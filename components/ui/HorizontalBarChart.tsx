import React from 'react';

interface HorizontalBarChartProps {
    data: { label: string; value: number }[];
    label: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, label }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No data available</div>;
    }

    const padding = { top: 10, right: 20, bottom: 10, left: 150 };
    const chartHeight = 288;
    const barHeight = (chartHeight - padding.top - padding.bottom) / data.length;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    const textColor = '#A9A9A9';
    const barColor = '#25F4EE';

    return (
        <div className="w-full h-full">
            {data.map((d, i) => (
                <div key={d.label} className="flex items-center mb-2" style={{ height: `${barHeight * 0.8}px`}}>
                    <div className="w-1/3 pr-2 text-right">
                        <p className="text-sm truncate" style={{ color: textColor }} title={d.label}>
                            {d.label}
                        </p>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <div 
                            className="rounded-r-md transition-all duration-300 h-full" 
                            style={{ width: `${(d.value / maxValue) * 100}%`, backgroundColor: barColor }}
                        >
                        </div>
                        <span className="text-xs font-semibold pl-2" style={{ color: textColor }}>
                            {d.value} {label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HorizontalBarChart;