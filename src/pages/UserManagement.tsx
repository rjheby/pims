
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Pencil } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/user";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type ExtendedUser = User & {
  created_at: string;
  status: "active" | "inactive";
};

// Type definition for database role values - matches what the database expects
type DbRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DRIVER" | "CLIENT";

// Map application roles to database roles
const mapToDbRole = (role: UserRole): DbRole => {
  const roleMap: Record<UserRole, DbRole | string> = {
    'superadmin': 'SUPER_ADMIN',
    'admin': 'ADMIN',
    'manager': 'MANAGER',
    'warehouse': 'MANAGER', // Map warehouse to MANAGER as WAREHOUSE is not in DbRole
    'driver': 'DRIVER',
    'client': 'CLIENT',
    'customer': 'CLIENT', // Default to CLIENT for customer
  };
  
  return roleMap[role] as DbRole;
};

// Map database roles to application roles
const mapFromDbRole = (dbRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'SUPER_ADMIN': 'superadmin',
    'ADMIN': 'admin',
    'MANAGER': 'manager',
    'DRIVER': 'driver',
    'CLIENT': 'client',
  };
  
  return (roleMap[dbRole] as UserRole) || dbRole as UserRole;
};

export default function UserManagement() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ExtendedUser | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [password, setPassword] = useState("");
  const [hasSetPassword, setHasSetPassword] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // First get auth users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }
        
        if (!authUsers) {
          setUsers([]);
          return;
        }
        
        // Then get profile data
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          throw profilesError;
        }
        
        // Combine the data
        const combinedUsers = authUsers.users.map((authUser) => {
          const profile = profilesData?.find(p => p.id === authUser.id);
          
          const userStatus: "active" | "inactive" = authUser.banned ? 'inactive' : 'active';
          
          return {
            id: authUser.id,
            name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : (authUser.user_metadata?.name || 'Unnamed User'),
            email: authUser.email || '',
            role: profile ? mapFromDbRole(profile.role) : 'customer',
            avatar: null, // No avatar in profile, default to null
            created_at: authUser.created_at || '',
            status: userStatus,
          } as ExtendedUser;
        });
        
        setUsers(combinedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error fetching users",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);

  const handleAddUser = () => {
    setEditUser(null);
    setUserName("");
    setUserEmail("");
    setUserRole("customer");
    setSendInvite(true);
    setPassword("");
    setHasSetPassword(false);
    setModalOpen(true);
  };

  const handleEditUser = (user: ExtendedUser) => {
    setEditUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setSendInvite(false);
    setPassword("");
    setHasSetPassword(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editUser) {
        // Split the name into first_name and last_name
        const nameParts = userName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Map application role to database role
        const dbRole = mapToDbRole(userRole);
        
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({ 
            first_name: firstName,
            last_name: lastName,
            role: dbRole,
          })
          .eq('id', editUser.id);
          
        if (error) throw error;
        
        toast({
          title: "User updated",
          description: `${userName} has been updated successfully.`,
        });
        
        // Update local state
        setUsers(users.map(user => 
          user.id === editUser.id 
            ? { ...user, name: userName, role: userRole }
            : user
        ));
      } else {
        // Creating a new user
        // Split the name into first_name and last_name
        const nameParts = userName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Map application role to database role
        const dbRole = mapToDbRole(userRole);
        
        if (sendInvite) {
          // Create user with invitation
          const { data, error } = await supabase.auth.admin.inviteUserByEmail(userEmail, {
            data: {
              firstName,
              lastName,
              role: dbRole,
            }
          });
          
          if (error) throw error;
          
          toast({
            title: "User invited",
            description: `An invitation has been sent to ${userEmail}.`,
          });
        } else if (hasSetPassword && password) {
          // Create user with a set password
          const { data, error } = await supabase.auth.admin.createUser({
            email: userEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
              firstName,
              lastName,
            }
          });
          
          if (error) throw error;
          
          // Update the user's role in the profile
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ role: dbRole })
              .eq('id', data.user.id);
              
            if (profileError) throw profileError;
          }
          
          toast({
            title: "User created",
            description: `${userName} has been created successfully.`,
          });
        } else {
          toast({
            title: "Missing information",
            description: "Please either send an invitation or set a password for the new user.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Refresh user list
        setLoading(true);
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const { data: profilesData } = await supabase.from('profiles').select('*');
        
        if (authUsers && profilesData) {
          const combinedUsers = authUsers.users.map((authUser) => {
            const profile = profilesData?.find(p => p.id === authUser.id);
            
            const userStatus: "active" | "inactive" = authUser.banned ? 'inactive' : 'active';
            
            return {
              id: authUser.id,
              name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : (authUser.user_metadata?.name || 'Unnamed User'),
              email: authUser.email || '',
              role: profile ? mapFromDbRole(profile.role) : 'customer',
              avatar: null,
              created_at: authUser.created_at || '',
              status: userStatus,
            } as ExtendedUser;
          });
          
          setUsers(combinedUsers);
        }
      }
      
      setModalOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast({
        title: "Error saving user",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>
              View and manage all users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className="capitalize">{user.role}</span>
                        </TableCell>
                        <TableCell>{formatDateTime(user.created_at)}</TableCell>
                        <TableCell>
                          <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editUser 
                ? 'Update user information and permissions' 
                : 'Enter the details for the new user'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  disabled={!!editUser}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={userRole} onValueChange={(value: UserRole) => setUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!editUser && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendInvite" 
                      checked={sendInvite}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSendInvite(true);
                          setHasSetPassword(false);
                        } else {
                          setSendInvite(false);
                        }
                      }}
                    />
                    <Label htmlFor="sendInvite">Send email invitation to set up password</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="setPassword" 
                      checked={hasSetPassword}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setHasSetPassword(true);
                          setSendInvite(false);
                        } else {
                          setHasSetPassword(false);
                        }
                      }}
                    />
                    <Label htmlFor="setPassword">Set initial password</Label>
                  </div>
                  
                  {hasSetPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Initial Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter initial password"
                        required={hasSetPassword}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editUser ? (
                  'Save Changes'
                ) : (
                  'Add User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
