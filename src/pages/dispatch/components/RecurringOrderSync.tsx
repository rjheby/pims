import React, { useEffect } from "react";
import { Button, Alert, Space } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { useRecurringOrderSync } from "@/hooks/useRecurringOrderSync";
import { RecurringOrderSyncProps } from "./stops/types";

export const RecurringOrderSync: React.FC<RecurringOrderSyncProps> = ({
  date,
  onSyncComplete,
  onSyncError,
}) => {
  const {
    isSyncing,
    syncResult,
    syncError,
    syncRecurringOrders,
    resetSyncState,
  } = useRecurringOrderSync();

  useEffect(() => {
    if (syncResult) {
      onSyncComplete(syncResult);
    }
  }, [syncResult, onSyncComplete]);

  useEffect(() => {
    if (syncError) {
      onSyncError(syncError);
    }
  }, [syncError, onSyncError]);

  const handleSync = async () => {
    await syncRecurringOrders(date);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Button
        type="primary"
        icon={<SyncOutlined spin={isSyncing} />}
        onClick={handleSync}
        loading={isSyncing}
      >
        Sync Recurring Orders
      </Button>

      {syncResult && (
        <Alert
          message="Sync Complete"
          description={`Added: ${syncResult.added.length}, Updated: ${syncResult.updated.length}, Removed: ${syncResult.removed.length}`}
          type="success"
          showIcon
          closable
          onClose={resetSyncState}
        />
      )}

      {syncError && (
        <Alert
          message="Sync Error"
          description={syncError}
          type="error"
          showIcon
          closable
          onClose={resetSyncState}
        />
      )}
    </Space>
  );
}; 