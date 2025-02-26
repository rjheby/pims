
interface BaseOrderSummaryProps {
  items: {
    totalQuantity: number;
    totalValue: number;
  };
  renderCustomSummary?: () => React.ReactNode;
}

export function BaseOrderSummary({ items, renderCustomSummary }: BaseOrderSummaryProps) {
  return (
    <div className="mt-8 border-t pt-6">
      <div className="bg-[#f3f3f3] rounded-lg p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-[#222222] mb-4">Order Summary</h3>
        <div className="space-y-3 w-full max-w-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#8A898C]">Total Quantity</span>
            <span className="font-medium text-[#333333]">{items.totalQuantity}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-[#1A1F2C]">Total Order Value</span>
            <span className="font-bold text-[#1A1F2C]">
              ${items.totalValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          {renderCustomSummary && renderCustomSummary()}
        </div>
      </div>
    </div>
  );
}
