"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Database,
  Activity,
  Dumbbell,
  Utensils,
  Moon,
  Pill,
  ShoppingCart,
  RefreshCw,
  Loader2,
  Download,
  Search,
  UserPlus,
  UserMinus,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AppDataPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [quizData, setQuizData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [purchasesAccessData, setPurchasesAccessData] = useState<any[]>([]);

  // Access control dialog
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [accessAction, setAccessAction] = useState<
    "grant" | "revoke" | "extend"
  >("grant");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [capsulesToGrant, setCapsulesToGrant] = useState("60");
  const [daysToExtend, setDaysToExtend] = useState("30");
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverview();
    } else {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/testograph-data?type=overview");
      const data = await res.json();
      if (data.success) {
        setOverviewStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async (type: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/testograph-data?type=${type}`);
      const data = await res.json();

      if (data.success) {
        switch (type) {
          case "quiz":
            setQuizData(data.data);
            break;
          case "workouts":
            setWorkoutData(data.data);
            break;
          case "nutrition":
            setNutritionData(data.data);
            break;
          case "sleep":
            setSleepData(data.data);
            break;
          case "purchases_access":
            setPurchasesAccessData(data.data);
            break;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessControl = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: any = {
        action: accessAction,
        email: selectedUser,
        reason: actionReason,
        admin_email: "caspere63@gmail.com", // TODO: Get from auth
      };

      if (accessAction === "grant") {
        payload.capsules = parseInt(capsulesToGrant);
      } else if (accessAction === "extend") {
        payload.additional_days = parseInt(daysToExtend);
      }

      const res = await fetch("/api/admin/access-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: data.message });
        setShowAccessDialog(false);
        fetchTabData("purchases_access");
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  const filteredPurchasesAccess = purchasesAccessData.filter(
    (item) =>
      !searchQuery ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8" />
              Testograph v2 - App Data
            </h1>
            <p className="text-muted-foreground mt-2">
              Реални данни от app.testograph.eu
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              activeTab === "overview"
                ? fetchOverview()
                : fetchTabData(activeTab)
            }
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Обнови
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quiz_workouts">
              <Dumbbell className="h-4 w-4 mr-2" />
              Quiz + Workouts
            </TabsTrigger>
            <TabsTrigger value="nutrition_sleep">
              <Moon className="h-4 w-4 mr-2" />
              Nutrition + Sleep
            </TabsTrigger>
            <TabsTrigger value="purchases_access">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchases & Access
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.totalUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overviewStats?.activeUsers || 0} активни
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quiz Completions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {overviewStats?.totalQuizzes || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {overviewStats?.totalRevenue || 0} лв
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overviewStats?.totalPurchases || 0} purchases
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      Workouts: {overviewStats?.totalWorkouts || 0}
                    </div>
                    <div className="text-sm">
                      Meals: {overviewStats?.totalMeals || 0}
                    </div>
                    <div className="text-sm">
                      Sleep: {overviewStats?.totalSleep || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* QUIZ + WORKOUTS TAB */}
          <TabsContent value="quiz_workouts">
            <div className="space-y-4">
              <Button onClick={() => fetchTabData("quiz")}>
                Load Quiz Data
              </Button>
              <Button
                onClick={() => fetchTabData("workouts")}
                variant="outline"
              >
                Load Workout Data
              </Button>
              {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
              {quizData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quizData.slice(0, 20).map((q, i) => (
                          <TableRow key={i}>
                            <TableCell>{q.email}</TableCell>
                            <TableCell>
                              <Badge>{q.category}</Badge>
                            </TableCell>
                            <TableCell>{q.level}</TableCell>
                            <TableCell>{q.total_score}</TableCell>
                            <TableCell>
                              {new Date(q.completed_at).toLocaleDateString(
                                "bg-BG",
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
              {workoutData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Workout Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Exercises</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workoutData.slice(0, 20).map((w, i) => (
                          <TableRow key={i}>
                            <TableCell>{w.email}</TableCell>
                            <TableCell>{w.date}</TableCell>
                            <TableCell>{w.exercisesCount}</TableCell>
                            <TableCell>
                              {w.completed ? (
                                <Badge variant="outline">✓</Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* NUTRITION + SLEEP TAB */}
          <TabsContent value="nutrition_sleep">
            <div className="space-y-4">
              <Button onClick={() => fetchTabData("nutrition")}>
                Load Nutrition
              </Button>
              <Button onClick={() => fetchTabData("sleep")} variant="outline">
                Load Sleep
              </Button>
              {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
              {nutritionData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Completions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      Total: {nutritionData.length} meals
                    </div>
                  </CardContent>
                </Card>
              )}
              {sleepData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sleep Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      Total: {sleepData.length} entries
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* PURCHASES & ACCESS TAB */}
          <TabsContent value="purchases_access">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Purchases & Access Management</CardTitle>
                    <CardDescription>Manual access control</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      onClick={() => {
                        setShowAccessDialog(true);
                        setAccessAction("grant");
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Grant Access
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Capsules</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchasesAccess.slice(0, 50).map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {item.email}
                          </TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.capsulesRemaining || 0}</TableCell>
                          <TableCell>
                            {item.hasActiveAccess ? (
                              <Badge className="bg-green-600">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {item.accessEndDate
                              ? new Date(item.accessEndDate).toLocaleDateString(
                                  "bg-BG",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(item.email);
                                  setAccessAction("extend");
                                  setShowAccessDialog(true);
                                }}
                              >
                                <Clock className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(item.email);
                                  setAccessAction("revoke");
                                  setShowAccessDialog(true);
                                }}
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ACCESS CONTROL DIALOG */}
        <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {accessAction === "grant"
                  ? "Grant Access"
                  : accessAction === "extend"
                    ? "Extend Access"
                    : "Revoke Access"}
              </DialogTitle>
              <DialogDescription>
                Manual access management for {selectedUser}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              {accessAction === "grant" && (
                <div>
                  <Label>Capsules</Label>
                  <Input
                    type="number"
                    value={capsulesToGrant}
                    onChange={(e) => setCapsulesToGrant(e.target.value)}
                  />
                </div>
              )}
              {accessAction === "extend" && (
                <div>
                  <Label>Additional Days</Label>
                  <Input
                    type="number"
                    value={daysToExtend}
                    onChange={(e) => setDaysToExtend(e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Reason for this action..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAccessDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAccessControl}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
