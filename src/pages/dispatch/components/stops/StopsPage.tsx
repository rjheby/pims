import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { DeliveryStop, StopFormData } from "./types";
import { fetchStops, createStop, updateStop, deleteStop } from "../../../../store/slices/stopsSlice";
import { Button, Table, Modal, Form, Input, Select, DatePicker, Checkbox } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";

const { Option } = Select;

const StopsPage: React.FC = () => {
  const dispatch = useDispatch();
  const stops = useSelector((state: RootState) => state.stops.items);
  const loading = useSelector((state: RootState) => state.stops.loading);
  const error = useSelector((state: RootState) => state.stops.error);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStop, setEditingStop] = useState<DeliveryStop | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchStops());
  }, [dispatch]);

  const handleAddStop = () => {
    setEditingStop(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStop = (stop: DeliveryStop) => {
    setEditingStop(stop);
    form.setFieldsValue({
      ...stop,
      start_date: stop.start_date ? moment(stop.start_date) : undefined,
      end_date: stop.end_date ? moment(stop.end_date) : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDeleteStop = (stopId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this stop?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        dispatch(deleteStop(stopId));
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData: StopFormData = {
        ...values,
        start_date: values.start_date?.format("YYYY-MM-DD"),
        end_date: values.end_date?.format("YYYY-MM-DD"),
      };

      if (editingStop) {
        dispatch(updateStop({ id: editingStop.id, data: formData }));
      } else {
        dispatch(createStop(formData));
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

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
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DeliveryStop) => (
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditStop(record)}
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStop(record.id)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Delivery Stops</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddStop}
        >
          Add Stop
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={stops}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingStop ? "Edit Stop" : "Add Stop"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="stop_number"
            label="Stop Number"
            rules={[{ required: true, message: "Please input the stop number!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="customer"
            label="Customer"
            rules={[{ required: true, message: "Please select a customer!" }]}
          >
            <Select>
              {/* Add customer options here */}
            </Select>
          </Form.Item>

          <Form.Item
            name="driver"
            label="Driver"
            rules={[{ required: true, message: "Please select a driver!" }]}
          >
            <Select>
              {/* Add driver options here */}
            </Select>
          </Form.Item>

          <Form.Item
            name="items"
            label="Items"
            rules={[{ required: true, message: "Please input the items!" }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="is_recurring"
            valuePropName="checked"
          >
            <Checkbox>Recurring Stop</Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.is_recurring !== currentValues.is_recurring
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("is_recurring") ? (
                <>
                  <Form.Item
                    name="recurrence_frequency"
                    label="Frequency"
                    rules={[{ required: true, message: "Please select a frequency!" }]}
                  >
                    <Select>
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="biweekly">Bi-weekly</Option>
                      <Option value="monthly">Monthly</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="preferred_day"
                    label="Preferred Day"
                  >
                    <Select>
                      <Option value="monday">Monday</Option>
                      <Option value="tuesday">Tuesday</Option>
                      <Option value="wednesday">Wednesday</Option>
                      <Option value="thursday">Thursday</Option>
                      <Option value="friday">Friday</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="start_date"
                    label="Start Date"
                  >
                    <DatePicker />
                  </Form.Item>

                  <Form.Item
                    name="end_date"
                    label="End Date"
                  >
                    <DatePicker />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StopsPage; 