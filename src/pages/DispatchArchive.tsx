import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

function DispatchArchive() {
  // Fix for accessing array properties correctly (assuming this is the issue in lines 174-176)
  const processCustomerData = (data: any) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      // Ensure we're accessing properties on individual objects, not the array itself
      return {
        name: item?.name || 'Unknown',
        address: item?.address || 'No address',
        phone: item?.phone || 'No phone'
      };
    });
  };

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dispatch_schedules")
        .select("*")
        .order("schedule_date", { ascending: false });

      if (error) {
        throw error;
      }

      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("dispatch_schedules")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully.",
      });
      fetchSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "submitted":
        return "default";
      case "in progress":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    // Render component as normal
    <div>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-5">Dispatch Schedule Archive</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Created At</th>
                  <th className="py-2 px-4 border-b">Updated At</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule: any) => (
                  <tr key={schedule.id}>
                    <td className="py-2 px-4 border-b">
                      {formatDate(schedule.schedule_date)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(schedule.created_at)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {formatDate(schedule.updated_at)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex gap-2">
                        <a
                          href={`/dispatch/${schedule.id}`}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DispatchArchive;
