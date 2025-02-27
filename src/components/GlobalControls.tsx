
import { NavigationControls } from './Navigation/NavigationControls';
import { HistoryControls } from './History/HistoryControls';

export function GlobalControls() {
  return (
    <div className="flex items-center gap-4">
      <NavigationControls />
      <div className="h-6 border-r border-gray-200" />
      <HistoryControls />
    </div>
  );
}
