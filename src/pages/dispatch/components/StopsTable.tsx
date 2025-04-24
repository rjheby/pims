import React from "react";
import { Table, Button, Space, Tag } from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DeliveryStop, StopsTableProps } from "./stops/types";

export const StopsTable: React.FC<StopsTableProps> = ({
  stops,
  onStopsChange,
  useMobileLayout = false,
  readOnly = false,
}) => {
  const columns = [
    {
      title: "Stop #",
      dataIndex: "stop_number",
      key: "stop_number",
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "Driver",
      dataIndex: ["driver", "name"],
      key: "driver",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Time Window",
      dataIndex: "time_window",
      key: "time_window",
      render: (timeWindow: string) => (
        <Tag color={getTimeWindowColor(timeWindow)}>
          {timeWindow?.charAt(0).toUpperCase() + timeWindow?.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DeliveryStop) => (
        <Space>
          {!readOnly && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "orange";
      case "in_progress":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getTimeWindowColor = (timeWindow: string) => {
    switch (timeWindow) {
      case "morning":
        return "gold";
      case "afternoon":
        return "blue";
      case "evening":
        return "purple";
      default:
        return "default";
    }
  };

  const handleEdit = (stop: DeliveryStop) => {
    // TODO: Implement edit functionality
  };

  const handleDelete = (stop: DeliveryStop) => {
    // TODO: Implement delete functionality
  };

  return (
    <Table
      columns={columns}
      dataSource={stops}
      rowKey="id"
      pagination={false}
      size={(useMobileLayout ? "small" : "middle") as SizeType}
    />
  );
}; 